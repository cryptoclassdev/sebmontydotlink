#!/usr/bin/env node
// The Breakpoint API served from the Mac Mini, with storage in files on the Mac instead of Upstash.
// Vercel forwards /breakpoint/api/* here when BREAKPOINT_BACKEND_URL is set (see app/breakpoint/api/[...path]/route.ts),
// through a Cloudflare tunnel; the page and the Mac jobs keep using https://www.sebmonty.link/breakpoint.
//
//   node scripts/mac-backend.mjs --data <folder> --secrets <provider-secrets.json> [--port 4318]
//
// Normally started by scripts/mac/backend.sh (launchd keeps it running). Listens on 127.0.0.1 only.
// Same API code and options as production: Luma side events, Jupiter prices, X embeds, provisional
// publishing on. INGEST_TOKEN and EDITOR_TOKEN come from the secrets file, so the jobs and the desk
// authenticate unchanged.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createApi} from '../server/api.mjs';
import {fileBucket} from '../server/files.mjs';
import {lumaEvents} from '../server/luma.mjs';
import {tokenPrices} from '../server/prices.mjs';
import {createTweetEmbeds} from '../server/tweets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : fallback; };
const HOST = '127.0.0.1', PORT = Number(arg('--port', '4318')), BASE = '/breakpoint';
const dataDir = path.resolve(arg('--data', path.join(root, '.local/backend')));
const secretsPath = path.resolve(arg('--secrets', path.join(root, '.local/provider-secrets.json')));

let secrets = {};
try { secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8')); } catch {}
const pick = (...names) => names.map((n) => String(secrets[n] ?? '').trim()).find(Boolean);
const INGEST_TOKEN = pick('INGEST_TOKEN', 'BREAKPOINT_INGEST_TOKEN'), EDITOR_TOKEN = pick('EDITOR_TOKEN', 'BREAKPOINT_EDITOR_TOKEN');
if (!INGEST_TOKEN || !EDITOR_TOKEN) {
  console.error(`INGEST_TOKEN and EDITOR_TOKEN are needed in ${secretsPath}.`);
  process.exit(1);
}

const seed = JSON.parse(fs.readFileSync(path.join(root, 'data/seed.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'data/luma-snapshot.json'), 'utf8'));
const api = createApi(seed, {
  basePath: BASE,
  loadEvents: () => lumaEvents(seed.events).catch((error) => ({events: snapshot.events, source: 'snapshot', checkedAt: snapshot.checkedAt, error: String(error?.message ?? error).slice(0, 200)})),
  loadPrices: () => tokenPrices(seed.projects, {apiKey: process.env.JUPITER_API_KEY}),
  attachEmbeds: createTweetEmbeds(),
});
const bucket = fileBucket(path.join(dataDir, 'store'));
const env = {BUCKET: bucket, INGEST_TOKEN, EDITOR_TOKEN, AUTO_PUBLISH_PROVISIONAL: 'true'};

const PASS = ['content-type', 'cache-control', 'content-disposition', 'x-content-type-options', 'content-security-policy'];
const stamp = () => new Date().toISOString().slice(11, 19) + 'Z';
let served = 0, posts = 0, failed = 0;
setInterval(() => { console.log(`${stamp()}  last 5 min: ${served} requests, ${posts} posts, ${failed} errors; ${bucket.keys().length} records stored`); served = posts = failed = 0; }, 300_000).unref();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    if (!url.pathname.startsWith(BASE + '/api/')) { res.writeHead(404, {'content-type': 'text/plain'}).end('Not found'); return; }
    const chunks = []; let size = 0;
    for await (const chunk of req) { size += chunk.length; if (size > 2_000_000) { res.writeHead(413).end(); return; } chunks.push(chunk); }
    const headers = {}; for (const h of ['authorization', 'content-type']) if (req.headers[h]) headers[h] = req.headers[h];
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks);
    const response = await api(new Request(new URL(url.pathname + url.search, 'https://www.sebmonty.link'), {method: req.method, headers, body}), env);
    const out = {}; for (const h of PASS) { const v = response.headers.get(h); if (v) out[h] = v; }
    res.writeHead(response.status, out);
    res.end(Buffer.from(await response.arrayBuffer()));
    served++; if (req.method === 'POST') posts++; if (response.status >= 500) failed++;
  } catch (error) {
    failed++;
    console.error(`${stamp()}  request failed: ${String(error?.message ?? error).slice(0, 200)}`);
    if (!res.headersSent) res.writeHead(500, {'content-type': 'application/json'});
    res.end(JSON.stringify({error: 'Service temporarily unavailable'}));
  }
});

server.listen(PORT, HOST, () => console.log(`${stamp()}  Breakpoint backend on http://${HOST}:${PORT}${BASE}/api (storage: ${dataDir}/store, ${bucket.keys().length} records)`));
