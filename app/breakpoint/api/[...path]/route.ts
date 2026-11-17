// API for the Breakpoint guide at /breakpoint (the page itself is static, in public/breakpoint).
// All logic lives in breakpoint/server; this file only connects it to Next.js and Vercel env vars.
import seed from "@/breakpoint/data/seed.json"
import snapshot from "@/breakpoint/data/luma-snapshot.json"
import { createApi } from "@/breakpoint/server/api.mjs"
import { lumaEvents } from "@/breakpoint/server/luma.mjs"
import { tokenPrices } from "@/breakpoint/server/prices.mjs"
import { createTweetEmbeds } from "@/breakpoint/server/tweets.mjs"
import { upstashBucketFromEnv } from "@/breakpoint/server/upstash.mjs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Side events: live from Luma (cached 10 min). If Luma is down or rate-limits a fresh
// server, fall back to the committed snapshot (scripts/snapshot-luma.mjs), then to the
// researched list in seed.json. /breakpoint/api/health reports which source is in use and why.
const api = createApi(seed, {
  basePath: "/breakpoint",
  loadEvents: () =>
    lumaEvents(seed.events).catch((error) => ({
      events: snapshot.events,
      source: "snapshot",
      checkedAt: snapshot.checkedAt,
      error: String(error?.message ?? error).slice(0, 200),
    })),
  // Token prices from Jupiter for projects with a verified mint (30 s cache, keyless
  // unless JUPITER_API_KEY is set). Shown as context in /api/live and the market status row.
  loadPrices: () => tokenPrices(seed.projects, { apiKey: process.env.JUPITER_API_KEY }),
  // Posts from X show as embeds in Catch up (author, avatar, text, media), from X's public embed
  // data. Each post is fetched once and kept in storage (tweets/<id>.json); see tweets.mjs.
  attachEmbeds: createTweetEmbeds(),
})

// Mac Mini backend: when BREAKPOINT_BACKEND_URL is set (an https address, normally a Cloudflare tunnel
// to breakpoint/scripts/mac-backend.mjs), every /breakpoint/api/* request is passed on to it and Upstash
// is not used. Its cache headers come back unchanged, so the CDN still answers most reads (15 s for /live).
// If it does not answer, reads fall back to this server without storage (programme, side events,
// briefings) and writes get a 503, which the Mac jobs keep in their outbox and retry.
const backend = (() => {
  const raw = (process.env.BREAKPOINT_BACKEND_URL ?? "").trim().replace(/\/+$/, "")
  try {
    return raw && new URL(raw).protocol === "https:" ? raw : ""
  } catch {
    return ""
  }
})()

// Storage is optional: without Upstash env vars the public guide still works
// (programme, side events, briefings); the editorial desk and live coverage need it.
const bucket = backend ? null : upstashBucketFromEnv(process.env)

function local(request: Request) {
  return api(request, {
    BUCKET: bucket,
    EDITOR_TOKEN: process.env.BREAKPOINT_EDITOR_TOKEN,
    INGEST_TOKEN: process.env.BREAKPOINT_INGEST_TOKEN,
    AUTO_PUBLISH_PROVISIONAL: process.env.BREAKPOINT_AUTO_PUBLISH_PROVISIONAL,
  })
}

const PASS = ["content-type", "cache-control", "content-disposition", "x-content-type-options", "content-security-policy"]

async function viaBackend(request: Request) {
  const url = new URL(request.url)
  const read = request.method === "GET" || request.method === "HEAD"
  const headers: Record<string, string> = {}
  for (const h of ["authorization", "content-type"]) {
    const v = request.headers.get(h)
    if (v) headers[h] = v
  }
  const body = read ? undefined : await request.arrayBuffer()
  try {
    const res = await fetch(backend + url.pathname + url.search, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    })
    // A tunnel or Mac that is down answers 5xx with an HTML page, not the API's JSON.
    const type = res.headers.get("content-type") ?? ""
    if (res.status >= 500 && !type.includes("json")) throw new Error(`Backend answered ${res.status}`)
    const out = new Headers()
    for (const h of PASS) {
      const v = res.headers.get(h)
      if (v) out.set(h, v)
    }
    return new Response(res.body, { status: res.status, headers: out })
  } catch (error) {
    console.error("Breakpoint backend unreachable:", String((error as Error)?.message ?? error).slice(0, 200))
    if (read) return local(request)
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 503,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
    })
  }
}

function handle(request: Request) {
  return backend ? viaBackend(request) : local(request)
}

export const GET = handle
export const POST = handle
