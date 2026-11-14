#!/usr/bin/env node
// Local rehearsal copy of the Breakpoint guide: the real API (server/api.mjs) with in-memory storage,
// plus the built page from ../public/breakpoint, on http://127.0.0.1:4317/breakpoint only.
// Nothing reaches production: preview and production share one Upstash database, so tests post here.
//
//   cd breakpoint && node scripts/rehearsal.mjs [--config collector/config.rehearsal.json]
//
// The collector authenticates unchanged: INGEST_TOKEN and EDITOR_TOKEN come from .local/provider-secrets.json.
// Provisional entries are shown (AUTO_PUBLISH_PROVISIONAL "true"). The stages' YouTube test links in the
// rehearsal config are shown in the stage player. Storage resets when the server stops.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createApi} from '../server/api.mjs';

const HOST = '127.0.0.1', PORT = 4317, BASE = '/breakpoint';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = path.resolve(root, '../public/breakpoint');
const seed = JSON.parse(fs.readFileSync(path.join(root, 'data/seed.json'), 'utf8'));
const arg = process.argv.indexOf('--config');
const configPath = path.resolve(root, arg > 0 ? process.argv[arg + 1] : 'collector/config.rehearsal.json');

let secrets = {};
try { secrets = JSON.parse(fs.readFileSync(path.join(root, '.local/provider-secrets.json'), 'utf8')); } catch {}
if (!String(secrets.INGEST_TOKEN ?? '').trim() || !String(secrets.EDITOR_TOKEN ?? '').trim()) {
  console.error('INGEST_TOKEN and EDITOR_TOKEN are needed in breakpoint/.local/provider-secrets.json. Run: python3 collector/setup.py');
  process.exit(1);
}

// In-memory R2-style bucket (same as the test double in tests/api.test.mjs).
class Bucket {
  map = new Map(); n = 0;
  async get(key) { const o = this.map.get(key); return o ? {etag: o.etag, json: async () => JSON.parse(o.value)} : null; }
  async put(key, value, opts = {}) { const old = this.map.get(key), c = opts.onlyIf; if (c?.etagMatches && old?.etag !== c.etagMatches) return null; if (c?.etagDoesNotMatch === '*' && old) return null; const etag = String(++this.n); this.map.set(key, {value, etag}); return {etag}; }
  async list({prefix, limit, cursor}) { const all = [...this.map.keys()].filter(x => x.startsWith(prefix)).sort(), start = Number(cursor || 0), end = start + limit; return {objects: all.slice(start, end).map(key => ({key})), truncated: end < all.length, cursor: String(end)}; }
}

const env = {BUCKET: new Bucket(), INGEST_TOKEN: secrets.INGEST_TOKEN, EDITOR_TOKEN: secrets.EDITOR_TOKEN, AUTO_PUBLISH_PROVISIONAL: 'true'};
const api = createApi(seed, {basePath: BASE});

function videoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return /^\/([\w-]{11})\/?$/.exec(u.pathname)?.[1] ?? null;
    if (!/(^|\.)youtube(-nocookie)?\.com$/.test(u.hostname)) return null;
    if (u.pathname === '/watch') return /^[\w-]{11}$/.test(u.searchParams.get('v') ?? '') ? u.searchParams.get('v') : null;
    return /^\/(?:live|embed|shorts)\/([\w-]{11})\/?$/.exec(u.pathname)?.[1] ?? null;
  } catch { return null; }
}

// Show the rehearsal streams in the stage player (editor-only route, called with the local editor token).
try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  for (const stage of config.stages ?? []) {
    const id = videoId(stage.youtube);
    if (!stage.enabled || !id) continue;
    const response = await api(new Request(`http://${HOST}:${PORT}${BASE}/api/admin/stream`, {method: 'POST', headers: {authorization: 'Bearer ' + env.EDITOR_TOKEN, 'content-type': 'application/json'}, body: JSON.stringify({id: stage.id, name: stage.name, embedUrl: 'https://www.youtube-nocookie.com/embed/' + id, sourceUrl: 'https://www.youtube.com/watch?v=' + id, sessionId: stage.sessionId, enabled: true})}), env);
    console.log(`${stage.name}: player shows YouTube video ${id}` + (response.ok ? '' : ' (could not set the player)'));
  }
} catch { console.log('No rehearsal config with YouTube links found; stage players stay empty.'); }

const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json; charset=utf-8', '.ico': 'image/x-icon', '.woff2': 'font/woff2'};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    if (url.pathname.startsWith(BASE + '/api/')) {
      const chunks = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 1_000_000) { res.writeHead(413).end(); return; } chunks.push(chunk); }
      const headers = {}; for (const h of ['authorization', 'content-type']) if (req.headers[h]) headers[h] = req.headers[h];
      const body = ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks);
      const response = await api(new Request(url, {method: req.method, headers, body}), env);
      res.writeHead(response.status, {'content-type': response.headers.get('content-type') ?? 'application/json', 'cache-control': 'no-store'});
      res.end(Buffer.from(await response.arrayBuffer()));
      if (req.method === 'POST' && url.pathname.endsWith('/api/ingest') && response.ok) {
        try { const sent = JSON.parse(Buffer.concat(chunks).toString('utf8')); for (const e of sent.entries ?? []) console.log(`${new Date().toISOString().slice(11, 19)}Z  entry  ${e.stage || '-'}  ${e.kind} [${e.status}]  ${e.title}`); } catch {}
      }
      return;
    }
    if (url.pathname === '/' || url.pathname === BASE) { res.writeHead(302, {location: BASE + '/'}).end(); return; }
    if (url.pathname.startsWith(BASE + '/')) {
      const rel = decodeURIComponent(url.pathname.slice(BASE.length + 1)) || 'index.html';
      const file = path.resolve(site, rel);
      if (file !== site && !file.startsWith(site + path.sep)) { res.writeHead(403).end(); return; }
      const target = fs.existsSync(file) && fs.statSync(file).isFile() ? file : path.join(site, 'index.html');
      res.writeHead(200, {'content-type': TYPES[path.extname(target)] ?? 'application/octet-stream', 'cache-control': 'no-store'});
      fs.createReadStream(target).pipe(res);
      return;
    }
    res.writeHead(404, {'content-type': 'text/plain'}).end('Not found');
  } catch (error) {
    console.error('Request failed:', String(error?.message ?? error).slice(0, 200));
    if (!res.headersSent) res.writeHead(500, {'content-type': 'text/plain'});
    res.end('Rehearsal server error');
  }
});

server.listen(PORT, HOST, () => console.log(`Rehearsal guide: http://${HOST}:${PORT}${BASE} (in-memory storage; nothing reaches production). Ctrl+C to stop.`));
