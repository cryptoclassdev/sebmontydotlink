# Breakpoint London 2026 guide (sebmonty.link/breakpoint)

One page for everything at Solana Breakpoint 2026 in London: the full two-stage programme (107 talks, 143 speakers), every side event from the official community calendar on a map, stage livestreams, sourced briefings and live coverage, project watchlists and the LP Army corner. Branded Seb Monty, powered by validator.com.

This folder holds everything that belongs to the guide. It started as the "On Solana / Breakpoint Desk" build (handoff dated 12 November 2026) and was moved here from Cloudflare Workers + R2 to run inside this Next.js site on Vercel.

## How it fits into the site

| Piece | Where | Notes |
| --- | --- | --- |
| Page (React app) | `breakpoint/src/` built to `public/breakpoint/` | Self-contained page with its own stylesheet. `next.config.mjs` rewrites `/breakpoint` to `public/breakpoint/index.html`. The build output is committed; Vercel does not run the guide's build. |
| API | `app/breakpoint/api/[...path]/route.ts` | Thin wrapper; the logic is in `breakpoint/server/`. |
| Server logic | `breakpoint/server/api.mjs`, `core.mjs` | Validation, auth, revisions, ingest, public reads, calendar files. |
| Side events | `breakpoint/server/luma.mjs` | Pulls the Luma calendar `BP-SideEvents` every 10 minutes. Falls back to `data/luma-snapshot.json`, then to the researched list in `data/seed.json`. |
| Storage | `breakpoint/server/upstash.mjs` | Upstash Redis over REST. Optional: without it the public guide works and the editorial desk / live coverage stay off. |
| Programme data | `breakpoint/data/seed.json` | Official agenda, speakers, projects, researched events, pre-event briefings. |
| Collector | `breakpoint/collector/` | Python (standard library) + ffmpeg. Runs on an always-on machine, never on Vercel. |
| Tests | `breakpoint/tests/` | API, storage (including a real-Redis test), Luma, collector. |

API routes (all under `/breakpoint/api`):

- `GET /static`: programme, speakers, projects, side events. Cached 5 min at the CDN.
- `GET /live`: newest 60 published entries, stream settings, session overrides, source health. Cached 15 s at the CDN, so polling visitors do not each hit storage.
- `GET /feed?cursor=`: older published entries. `GET /bootstrap`: static + live combined (used by the collector).
- `GET /calendar?id=`: .ics for one event (hidden venues stay hidden).
- `POST /ingest` (collector token), `GET /admin`, `POST /admin/entry|stream|session` (editor token). Never cached.

## Environment variables (Vercel project settings)

| Variable | Needed for | Value |
| --- | --- | --- |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Desk, live coverage | Added automatically when an Upstash Redis store is connected to the project (Storage tab). `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` also work. |
| `BREAKPOINT_EDITOR_TOKEN` | Editorial desk login | Long random string, e.g. `openssl rand -hex 32`. |
| `BREAKPOINT_INGEST_TOKEN` | Collector | A different long random string. |
| `BREAKPOINT_AUTO_PUBLISH_PROVISIONAL` | Optional | `true` lets collector drafts publish as Provisional (the collector must also set `publishProvisional`). Default off. |

Never paste these values into chat, code or a URL. The collector's copy goes in through `python3 collector/setup.py` (masked macOS popups).

## Work on it

```bash
cd breakpoint
npm ci                 # the guide's own dependencies (pinned, package-lock.json)
npm test               # API, storage, Luma and collector tests
npx tsc --noEmit       # type check the page
npm run build          # writes ../public/breakpoint; commit the result
node scripts/snapshot-luma.mjs   # refresh the side-events fallback before a deploy
```

Then from the repo root, `pnpm dev` serves the whole site including `/breakpoint`. Node 20.9+ (site) and Python 3.11+ (collector). The real-Redis test runs only if `redis-server` is installed.

Agenda refresh: export all four day/stage tabs of the official agenda to `research/agenda-rendered.json` (format in `scripts/import-agenda.py`), run `python3 scripts/import-agenda.py` then `python3 scripts/clean-seed.py`, review the diff, rebuild.

## Evidence rules (carried over unchanged)

- Never present fixture news as real. Seed only sourced event information.
- Every claim has a source URL, attribution, source time and receipt time. "Source checked" means evidence reviewed, not investment merit.
- Mentioning a project does not establish a token mechanism. Token relationships are direct, indirect or unclear.
- Model output is an untrusted draft. Provisional publication needs a verbatim source excerpt and the explicit switch on both sides.
- Speakers are never identified from voice alone. Session assignment comes from the desk.
- Hidden or obfuscated venue coordinates never reach the map or calendar files.
- No fabricated prices, stream URLs, mint addresses, news or countdowns.

## Live coverage: what is still needed

1. Upstash Redis connected and the two tokens set (above). Then the desk works at `/breakpoint#editor`.
2. Official stream embeds for Main Stage, Royal Exchange and LP Army, pasted into the desk ("Broadcast connections"). Only YouTube/Vimeo embed URLs are accepted.
3. For transcription: an approved direct HTTPS audio/HLS URL per stage (a YouTube page URL is not one), an OpenAI key and an X API bearer token on the collector machine, and that machine kept awake.
4. Budget: $50/day is approved (`collector/config.approved-50usd.json`, all sources off). At the default reservations, full coverage of three stages for eight hours reserves about $185, mostly summary calls ($0.10 each, one per minute per stage). Main Stage only, with summaries every two minutes (`summaryEveryChunks: 4`), plus X checks every two minutes, reserves about $49. Confirm real provider prices before switching anything on; the cap is a local reservation gate, not a provider billing limit.

Collector commands, from `breakpoint/`:

```bash
python3 collector/setup.py                                   # store tokens and keys (masked popups)
cp collector/config.approved-50usd.json .local/collector.json   # then edit sources and stages
python3 collector/run.py --config .local/collector.json
python3 scripts/editor-access.py                             # copy the editor token and open the desk
```

Operating notes from the original build still apply: change the "current session" in the desk when a talk actually ends (the collector finalises the summary within about 30 seconds); a heartbeat older than three minutes shows as stale; failed provider calls keep their budget reservation; stop with Ctrl+C and wait for ffmpeg to exit.

## Known limits

- Market prices are not connected; watchlists and saved events live on the visitor's device.
- Browser alerts need permission and an open tab.
- Project and session views use the newest 60 entries; Catch up pages further back.
- Luma can rate-limit; the guide then shows the last good copy or the committed snapshot and says so.
