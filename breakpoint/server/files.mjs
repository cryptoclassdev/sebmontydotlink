// File storage for the Breakpoint API on one machine (the Mac Mini backend, scripts/mac-backend.mjs).
// Same small interface as upstash.mjs (R2-style get / put / list with ETag preconditions, plus getMany).
//
// Every record is kept in memory and written through to one file per key in `dir`
// (`<encodeURIComponent(key)>.rec`, JSON {k, v, e}), written to a temporary file and renamed, so a crash
// never leaves half a record. Keys list in byte order, like Upstash's ZRANGEBYLEX, so the newest-first
// indexes (entry-index/, public-index/, summary-index/, x-index/) page the same way.
// One process only: two servers on the same folder would overwrite each other's changes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const SUFFIX = '.rec';

export function fileBucket(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const map = new Map();
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(SUFFIX)) continue;
    try {
      const r = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
      if (typeof r.k === 'string' && typeof r.v === 'string' && typeof r.e === 'string') map.set(r.k, { v: r.v, e: r.e });
    } catch {
      // An unreadable file is skipped; the rest of the store still loads.
    }
  }
  let sorted = null;
  const keys = () => (sorted ??= [...map.keys()].sort());
  const fileOf = (key) => path.join(dir, encodeURIComponent(key) + SUFFIX);
  const write = (key, rec) => {
    const file = fileOf(key), tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ k: key, v: rec.v, e: rec.e }));
    fs.renameSync(tmp, file);
  };
  const wrap = (o) => (o ? { etag: o.e, json: async () => JSON.parse(o.v) } : null);
  // First index whose key is >= target (keys are sorted).
  const lowerBound = (all, target) => {
    let lo = 0, hi = all.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (all[mid] < target) lo = mid + 1; else hi = mid; }
    return lo;
  };

  return {
    async get(key) { return wrap(map.get(key)); },
    async getMany(list) { return list.map((k) => wrap(map.get(k))); },
    async put(key, value, options = {}) {
      if (typeof key !== 'string' || !key || key.length > 400) throw new Error('Invalid storage key');
      const text = typeof value === 'string' ? value : JSON.stringify(value);
      const cond = options.onlyIf || {}, cur = map.get(key);
      if (cond.etagMatches && cur?.e !== cond.etagMatches) return null;
      if (cond.etagDoesNotMatch === '*' && cur) return null;
      const rec = { v: text, e: crypto.randomUUID() };
      write(key, rec);
      if (!cur) sorted = null;
      map.set(key, rec);
      return { etag: rec.e };
    },
    async list({ prefix = '', limit = 250, cursor } = {}) {
      const all = keys();
      let i = lowerBound(all, cursor ?? prefix);
      if (cursor !== undefined && all[i] === cursor) i++;
      const out = [];
      for (; i < all.length && out.length <= limit; i++) {
        if (!all[i].startsWith(prefix)) break;
        out.push(all[i]);
      }
      const truncated = out.length > limit, page = truncated ? out.slice(0, limit) : out;
      return { objects: page.map((key) => ({ key })), truncated, cursor: truncated ? page[page.length - 1] : undefined };
    },
    keys() { return [...map.keys()]; },
  };
}
