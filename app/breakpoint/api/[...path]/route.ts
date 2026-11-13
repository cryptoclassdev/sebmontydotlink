// API for the Breakpoint guide at /breakpoint (the page itself is static, in public/breakpoint).
// All logic lives in breakpoint/server; this file only connects it to Next.js and Vercel env vars.
import seed from "@/breakpoint/data/seed.json"
import snapshot from "@/breakpoint/data/luma-snapshot.json"
import { createApi } from "@/breakpoint/server/api.mjs"
import { lumaEvents } from "@/breakpoint/server/luma.mjs"
import { tokenPrices } from "@/breakpoint/server/prices.mjs"
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
})

// Storage is optional: without Upstash env vars the public guide still works
// (programme, side events, briefings); the editorial desk and live coverage need it.
const bucket = upstashBucketFromEnv(process.env)

function handle(request: Request) {
  return api(request, {
    BUCKET: bucket,
    EDITOR_TOKEN: process.env.BREAKPOINT_EDITOR_TOKEN,
    INGEST_TOKEN: process.env.BREAKPOINT_INGEST_TOKEN,
    AUTO_PUBLISH_PROVISIONAL: process.env.BREAKPOINT_AUTO_PUBLISH_PROVISIONAL,
  })
}

export const GET = handle
export const POST = handle
