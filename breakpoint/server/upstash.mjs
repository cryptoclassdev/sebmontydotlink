// Upstash Redis (REST) storage with the same small interface the API was written
// against (R2-style get / put / list with ETag preconditions), plus getMany.
//
// Layout: each record is a hash `<ns><key>` with fields v (JSON text) and e (etag).
// A sorted set `<ns>__keys` (all scores 0) lists every key so prefixes can be
// paged in order with ZRANGEBYLEX. Conditional writes run as one Lua script.

const PUT_SCRIPT = `
local cur = redis.call('HGET', KEYS[1], 'e')
if ARGV[2] == 'match' and cur ~= ARGV[3] then return false end
if ARGV[2] == 'absent' and cur then return false end
redis.call('HSET', KEYS[1], 'v', ARGV[1], 'e', ARGV[4])
redis.call('ZADD', KEYS[2], 0, ARGV[5])
return ARGV[4]
`;

export function upstashBucketFromEnv(env = process.env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return upstashBucket({ url, token, namespace: env.BREAKPOINT_REDIS_NAMESPACE || 'bp:' });
}

export function upstashBucket({ url, token, namespace = 'bp:', fetchImpl = fetch }) {
  const base = url.replace(/\/+$/, '');
  const index = namespace + '__keys';
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };

  async function call(path, body) {
    const res = await fetchImpl(base + path, { method: 'POST', headers, body: JSON.stringify(body), cache: 'no-store' });
    if (!res.ok) throw new Error(`Storage request failed (${res.status})`);
    return res.json();
  }
  async function command(...args) {
    const data = await call('', args);
    if (data.error) throw new Error('Storage command failed');
    return data.result;
  }
  async function pipeline(commands) {
    if (!commands.length) return [];
    const data = await call('/pipeline', commands);
    if (!Array.isArray(data)) throw new Error('Storage pipeline failed');
    return data.map((item) => {
      if (item.error) throw new Error('Storage command failed');
      return item.result;
    });
  }
  const wrap = (pair) => {
    if (!Array.isArray(pair) || pair[0] == null) return null;
    const [text, etag] = pair;
    return { etag, json: async () => JSON.parse(text) };
  };
  const newEtag = () => crypto.randomUUID();

  return {
    async get(key) {
      return wrap(await command('HMGET', namespace + key, 'v', 'e'));
    },
    async getMany(keys) {
      const results = await pipeline(keys.map((k) => ['HMGET', namespace + k, 'v', 'e']));
      return results.map(wrap);
    },
    async put(key, value, options = {}) {
      const text = typeof value === 'string' ? value : JSON.stringify(value);
      const cond = options.onlyIf || {};
      const mode = cond.etagMatches ? 'match' : cond.etagDoesNotMatch === '*' ? 'absent' : 'any';
      const etag = newEtag();
      const result = await command('EVAL', PUT_SCRIPT, '2', namespace + key, index, text, mode, cond.etagMatches || '', etag, key);
      return result == null ? null : { etag: result };
    },
    async list({ prefix = '', limit = 250, cursor } = {}) {
      const start = cursor ? '(' + cursor : '[' + prefix;
      const keys = await command('ZRANGEBYLEX', index, start, '[' + prefix + '\u007f', 'LIMIT', '0', String(limit + 1));
      const truncated = keys.length > limit;
      const page = truncated ? keys.slice(0, limit) : keys;
      return { objects: page.map((key) => ({ key })), truncated, cursor: truncated ? page[page.length - 1] : undefined };
    },
  };
}
