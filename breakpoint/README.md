# Breakpoint London 2026 guide (sebmonty.link/breakpoint)

One page for everything at Solana Breakpoint 2026 in London: the full two-stage programme (111 talks, 149 speakers, 13 tracks), every side event from the official community calendar on a map, stage livestreams, sourced briefings and live coverage, project watchlists and the LP Army corner. Branded Seb Monty, powered by validator.com.

This folder holds everything that belongs to the guide. It started as the "On Solana / Breakpoint Desk" build (handoff dated 12 November 2026) and was moved here from Cloudflare Workers + R2 to run inside this Next.js site on Vercel.

## How it fits into the site

| Piece | Where | Notes |
| --- | --- | --- |
| Page (React app) | `breakpoint/src/` built to `public/breakpoint/` | Self-contained page with its own stylesheet. `next.config.mjs` rewrites `/breakpoint` to `public/breakpoint/index.html`. The build output is committed; Vercel does not run the guide's build. |
| API | `app/breakpoint/api/[...path]/route.ts` | Thin wrapper; the logic is in `breakpoint/server/`. |
| Server logic | `breakpoint/server/api.mjs`, `core.mjs` | Validation, auth, revisions, ingest, public reads, calendar files. |
| Side events | `breakpoint/server/luma.mjs` | Pulls the Luma calendar `BP-SideEvents` every 10 minutes. Falls back to `data/luma-snapshot.json`, then to the researched list in `data/seed.json`. |
| Token prices | `breakpoint/server/prices.mjs` | Jupiter Price API v3 for projects with a verified `mintAddress` (and `mintSourceUrl`) in `seed.json`: KMNO, JUP, MET, JTO, SOL. Cached 30 s; on failure the last prices show for up to 10 minutes, marked stale, then none. Never estimated. |
| Storage | `breakpoint/server/upstash.mjs` | Upstash Redis over REST. Optional: without it the public guide works and the editorial desk / live coverage stay off. |
| Programme data | `breakpoint/data/seed.json` | Official agenda, speakers, projects, researched events, pre-event briefings. |
| Collector | `breakpoint/collector/` | Python (standard library) + ffmpeg. Runs on an always-on machine, never on Vercel. |
| Tests | `breakpoint/tests/` | API, storage (including a real-Redis test), Luma, collector. |

API routes (all under `/breakpoint/api`):

- `GET /static`: programme, speakers, projects, side events. Cached 5 min at the CDN.
- `GET /live`: newest 60 published entries, stream settings, session overrides, source health and token prices. Cached 15 s at the CDN, so polling visitors do not each hit storage or Jupiter.
- `GET /feed?cursor=`: older published entries. `GET /bootstrap`: static + live combined (used by the collector).
- `GET /calendar?id=`: .ics for one event (hidden venues stay hidden).
- `POST /ingest` (collector token), `GET /admin`, `POST /admin/entry|stream|session` (editor token). Never cached.

## Environment variables (Vercel project settings)

| Variable | Needed for | Value |
| --- | --- | --- |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Desk, live coverage | Added automatically when an Upstash Redis store is connected to the project (Storage tab). `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` also work. |
| `BREAKPOINT_EDITOR_TOKEN` | Editorial desk login | Long random string, e.g. `openssl rand -hex 32`. |
| `BREAKPOINT_INGEST_TOKEN` | Collector | A different long random string. |
| `JUPITER_API_KEY` | Optional | Free key from developers.jup.ag/portal for a higher Jupiter rate limit. Without it, token prices use Jupiter's keyless access. |
| `BREAKPOINT_AUTO_PUBLISH_PROVISIONAL` | Optional | `true` lets collector drafts publish as Provisional (the collector must also set `publishProvisional`). Default off. |

To price another project, add its `mintAddress` and a first-party `mintSourceUrl` (the project's own docs or app) in `seed.json`. Never add a mint from a ticker search.

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

Agenda refresh: the official agenda page blocks headless browsers, so read it in a real browser. On https://solana.com/breakpoint/schedule, click through both days and both stages and save the rows in the compact format described in `scripts/import-agenda.py` (example: `research/agenda-export-2026-11-13.json`). Then run `python3 scripts/import-agenda.py research/<file>.json` and `python3 scripts/clean-seed.py`, review the diff, rebuild. Session ids survive renames (matched by title, then by day, stage and start time).

Preview any moment of the conference by adding `?now=` to the URL, e.g. `/breakpoint?now=2026-11-16T14:05:00Z#overview` shows the Now and next strip as it will look at 14:05 on Day 1.

## Evidence rules (carried over unchanged)

- Never present fixture news as real. Seed only sourced event information.
- Every claim has a source URL, attribution, source time and receipt time. "Source checked" means evidence reviewed, not investment merit.
- Mentioning a project does not establish a token mechanism. Token relationships are direct, indirect or unclear.
- Model output is an untrusted draft. Provisional publication needs a verbatim source excerpt and the explicit switch on both sides.
- Speakers are never identified from voice alone. Session assignment comes from the desk.
- Hidden or obfuscated venue coordinates never reach the map or calendar files.
- No fabricated prices, stream URLs, mint addresses, news or countdowns.

## Live coverage (decided 13 November 2026)

Stages: the official YouTube streams, embedded from the desk ("Broadcast connections", tick "Show player"). No transcription.

Alpha: the X monitor below, running on the Mac Mini for the whole event. Seb can also post from the desk at any time.

## X monitor (Breakpoint week)

What it does: every 2 minutes it searches X (through twitterapi.io) for new posts from the 208 accounts in `data/x-accounts.json`: 87 companies and 121 speakers with a talk at Breakpoint. Replies and retweets are skipped. An AI model sorts each new post (Z.ai GLM 5.2 by default; any OpenAI-compatible chat endpoint works, set in the config):

- **alpha** (launch, partnership, token news, funding, approval, milestone, dated launch): published straight away as "Provisional", with the post quoted word for word and linked, and tied to the account's talk when posted within 24 hours of it;
- **maybe**: lands on the editor desk as a draft for Seb to publish or ignore;
- **skip** (booth, side events, memes, hype): dropped.

Accounts: speaker handles are the ones linked on the official speakers page (saved in `research/speakers-x-2026-11-14.json`); company handles are linked from each company's website or checked on the X profile (name, linked website, verification). Each account's `source` field says which. To add one, add a row to `data/x-accounts.json` with its source.

Cost: twitterapi.io charges $0.15 per 1,000 posts returned, with a minimum per request; GLM 5.2 sorting is about $1.40 per million input tokens and $4.40 per million output tokens, roughly $1 to $2 a day here. Expected spend is about $2 to $4 a day. The local budget gate in `collector/config.breakpoint-x.json` reserves the worst case for every request and stops the monitor at $30 a day.

### Set up on the Mac Mini (once)

1. Get the code: GitHub, `cryptoclassdev/sebmontydotlink`, Code, Download ZIP (or `git clone`). Unzip it somewhere permanent.
2. In Vercel (project v0-apple-liquid-glass-link-in-bio-6h), Settings, Environment Variables: add `BREAKPOINT_AUTO_PUBLISH_PROVISIONAL` = `true` for Production. If the ingest token was not saved, generate a new one (`openssl rand -hex 32`), save it in the password manager and replace `BREAKPOINT_INGEST_TOKEN`. Then redeploy the latest Production deployment so the values apply.
3. In Terminal on the Mac Mini, from the unzipped `breakpoint` folder: `python3 collector/setup.py`. Four masked windows ask for the ingest token, the editor token, the twitterapi.io key and the AI key (the Z.ai GLM API key). Nothing is typed into Terminal or chat.
4. Test without publishing: `python3 collector/run.py --config collector/config.breakpoint-x.json --check-x`. It shows how many recent posts it found and how the AI sorted up to five of them.
5. Start it: `caffeinate -dimsu python3 collector/run.py --config collector/config.breakpoint-x.json`. Leave the window open; `caffeinate` keeps the Mac awake. Each pass prints one line (new posts, published, drafts). Stop with Ctrl+C; it resumes where it left off.

Check it on the site: Watch live, Source health, "X monitoring" says "Watching 208 accounts on X". Drafts appear on the desk (`/breakpoint#editor`); published items appear on the overview, in Catch up (filter "From X"), on the project and on the talk.

To pull something back: open it on the desk and withdraw it with a short note. If the model is too eager or too quiet, set `publishProvisional` to `false` in the config to send everything to the desk instead. If the AI step fails, check the key and `xTriageApiUrl`: a pay-as-you-go Z.ai API key uses `https://api.z.ai/api/paas/v4/chat/completions`, a GLM Coding Plan key uses `https://api.z.ai/api/coding/paas/v4/chat/completions`. To use OpenAI instead, set `xTriageApiUrl` to `https://api.openai.com/v1/chat/completions`, `xTriageModel` to an OpenAI model, and remove `xTriageExtraBody`.

### The original transcription collector

Still in `collector/collect.py` and off. It needs a direct HTTPS audio/HLS URL per stage (a YouTube page URL is not one) and its own config (`collector/config.approved-50usd.json`). At default reservations, full coverage of three stages reserves about $185 a day, above the $50 approval.

Operating notes: a heartbeat older than three minutes shows as stale; failed provider calls keep their budget reservation; the outbox and checkpoints survive restarts.

## Known limits

- Watchlists and saved events live on the visitor's device.
- Browser alerts need permission and an open tab.
- Project and session views use the newest 60 entries; Catch up pages further back.
- Luma can rate-limit; the guide then shows the last good copy or the committed snapshot and says so.
