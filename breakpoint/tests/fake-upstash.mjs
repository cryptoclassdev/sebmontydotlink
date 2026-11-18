// Test double for the Upstash REST API: implements only the commands the adapter uses,
// with Redis semantics (hashes, a lexicographic sorted set, and the conditional-put script).
export function fakeUpstash() {
  const hashes = new Map(); // key -> Map(field -> value)
  const zsets = new Map(); // key -> Set(member)
  const commands = [];

  function run(cmd) {
    const [name, ...args] = cmd.map(String);
    commands.push(name);
    switch (name.toUpperCase()) {
      case 'HMGET': {
        const h = hashes.get(args[0]);
        return args.slice(1).map((f) => (h && h.has(f) ? h.get(f) : null));
      }
      case 'EVAL': {
        // Mirrors PUT_SCRIPT in server/upstash.mjs.
        const [, numKeys, key, index, value, mode, expected, etag, member] = args;
        if (numKeys !== '2') throw new Error('unexpected key count');
        const h = hashes.get(key);
        const cur = h ? h.get('e') : undefined;
        if (mode === 'match' && cur !== expected) return null;
        if (mode === 'absent' && cur !== undefined) return null;
        hashes.set(key, new Map([['v', value], ['e', etag]]));
        if (!zsets.has(index)) zsets.set(index, new Set());
        zsets.get(index).add(member);
        return etag;
      }
      case 'ZRANGEBYLEX': {
        const [key, min, max, , offset, count] = args;
        const members = [...(zsets.get(key) || [])].sort((a, b) => (Buffer.from(a) < Buffer.from(b) ? -1 : Buffer.compare(Buffer.from(a), Buffer.from(b))));
        const above = (m) => (min[0] === '(' ? Buffer.compare(Buffer.from(m), Buffer.from(min.slice(1))) > 0 : Buffer.compare(Buffer.from(m), Buffer.from(min.slice(1))) >= 0);
        const below = (m) => (max[0] === '(' ? Buffer.compare(Buffer.from(m), Buffer.from(max.slice(1))) < 0 : Buffer.compare(Buffer.from(m), Buffer.from(max.slice(1))) <= 0);
        return members.filter((m) => above(m) && below(m)).slice(Number(offset), Number(offset) + Number(count));
      }
      default:
        throw new Error('unsupported command ' + name);
    }
  }

  async function fetch(url, init) {
    if (init?.headers?.authorization !== 'Bearer t') return new Response('unauthorized', { status: 401 });
    const body = JSON.parse(init.body);
    if (url.endsWith('/pipeline')) return Response.json(body.map((c) => ({ result: run(c) })));
    return Response.json({ result: run(body) });
  }

  return { fetch, keys: () => [...hashes.keys()], commands };
}
