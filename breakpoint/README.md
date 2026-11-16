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

## Live coverage (updated 15 November 2026)

Stages: the official YouTube streams, embedded from the desk ("Broadcast connections", tick "Show player"). The same desk link drives the stage transcription below, which publishes announcements, the talk's key points ("Live notes") and per-talk recaps as Provisional.

Alpha from X: the X monitor below. Both run on the Mac Mini for the whole event, as two separate launchd jobs. Seb can also post from the desk at any time.

## X monitor (Breakpoint week)

What it does: every 10 minutes (`pollSeconds` 600 in the config; a change applies on restart) it searches X (through twitterapi.io) for new posts from the 208 accounts in `data/x-accounts.json`: 87 companies and 121 speakers with a talk at Breakpoint. Replies and retweets are skipped. An AI model sorts each new post (Claude Haiku 5.5 by default, through the Anthropic key; any OpenAI-compatible chat endpoint such as Z.ai GLM also works, set in the config):

- **alpha** (launch, partnership, token news, funding, approval, milestone, dated launch): published straight away as "Provisional", with the post quoted word for word and linked, and tied to the account's talk when posted within 24 hours of it;
- **maybe**: lands on the editor desk as a draft for Seb to publish or ignore;
- **skip** (booth, side events, memes, hype): dropped.

Accounts: speaker handles are the ones linked on the official speakers page (saved in `research/speakers-x-2026-11-14.json`); company handles are linked from each company's website or checked on the X profile (name, linked website, verification). Each account's `source` field says which. To add one, add a row to `data/x-accounts.json` with its source.

Cost: twitterapi.io charges $0.15 per 1,000 posts returned, with a minimum per request; Claude Haiku 5.5 sorting is $0.10 per million input tokens and $0.50 per million output tokens, about $0.001 per batch of 10 posts. At one search per account batch every 10 minutes (about 1,600 requests a day) expected spend is well under $1 a day, almost all of it twitterapi.io. The local budget gate in `collector/config.breakpoint-x.json` reserves the worst case ($0.003) for every request, about $5 a day at this interval, and stops the monitor at $30 a day.

Between searches the monitor repeats its last status to the site every minute, because the site marks a source stale after 3 minutes without one; Source health keeps showing "Watching 208 accounts on X". A post can take up to 10 minutes to appear; stage announcements come through live transcription within 1 to 2 minutes.

### Set up on the Mac Mini (once)

Folder: `~/breakpoint-live/sebmontydotlink` (a git clone; not Documents, Desktop or Downloads, where macOS blocks background jobs). Both processes share it and its `breakpoint/.local/provider-secrets.json`.

1. In Vercel (project v0-apple-liquid-glass-link-in-bio-6h), Settings, Environment Variables: `BREAKPOINT_AUTO_PUBLISH_PROVISIONAL` = `true` for Production (done 14 November), then redeploy Production.
2. Tools and Python environment: `bash breakpoint/scripts/mac/setup.sh 2>&1 | tee setup.log` from the clone (see "Live stage transcription" below).
3. Keys, from the `breakpoint` folder: `python3 collector/setup.py`. Masked windows ask for the ingest token, the editor token, the twitterapi.io key, the Z.ai key (optional, unused by default) and the Anthropic API key (console.anthropic.com, API credit; a Claude subscription does not cover API calls). Cancel leaves a saved value unchanged. Nothing is typed into Terminal or chat.
4. Test without publishing: `python3 collector/run.py --config collector/config.breakpoint-x.json --check-x`. It shows how many recent posts it found and how the AI sorted up to five of them, ending with "AI triage OK (claude-haiku-5-5)".
5. Start it as a background job: `bash scripts/mac/live.sh start x` (stop: `bash scripts/mac/live.sh stop x`). launchd keeps it running after Terminal closes and restarts it after a crash. Running it in a Terminal tab also works: `caffeinate -dimsu python3 collector/run.py --config collector/config.breakpoint-x.json` (stop with Ctrl+C before starting the launchd job; only one may own its state folder).

Check it on the site: Watch live, Source health, "X monitoring" says "Watching 208 accounts on X". Drafts appear on the desk (`/breakpoint#editor`); published items appear on the overview, in Catch up (filter "From X"), on the project and on the talk.

To pull something back: open it on the desk and withdraw it with a short note. If the model is too eager or too quiet, set `publishProvisional` to `false` in the config to send everything to the desk instead. If the AI step fails, the error line ends with "provider says: …" (never the key): check the Anthropic key and its credit. To use Z.ai GLM instead, remove `xTriageProvider` and set `xTriageApiUrl` to `https://api.z.ai/api/paas/v4/chat/completions`, `xTriageModel` to `glm-5.2`, `xTriageKeyEnv` to `ZAI_API_KEY` and `xTriageExtraBody` to `{"thinking": {"type": "disabled"}}`.

## Live stage transcription (Mac Mini, Breakpoint days)

What it does, per stage (Main Stage and Royal Exchange), all on the Mac Mini:

1. Reads the stage's YouTube link from the desk (`/api/bootstrap`, "Broadcast connections", every 60 s) and resolves the audio with yt-dlp (YouTube blocks datacenter IPs, so this cannot run on a VPS). Signed stream URLs are never logged.
2. ffmpeg cuts 30-second WAV chunks; mlx-whisper large-v3-turbo transcribes them locally (about 2 s per chunk on the M4), with this talk's speakers and Solana names as a glossary. Silence, Whisper hallucinations and repetition loops are dropped; common name misspellings ("Jupyter") are fixed (`transcriptFixes`).
3. The current talk comes from the published schedule (Europe/London, desk time overrides included), active from 60 s before its start to 120 s after its end; `scheduleOffsetMinutes` per stage shifts it when a stage runs late (edit the config, no restart). The collector also listens for introductions: when a scheduled speaker on that stage is introduced ("please welcome", "joined by", "next up" and similar, followed by the speaker's full name or a surname of 5+ letters), that moment becomes the talk's start and the stage's schedule shifts to match (logged as "Heard <speaker> introduced"; Source health then reads "running N min behind schedule"). It only looks at talks within 45 minutes of the current time and never goes back to an earlier talk; the learned shift lasts for the day and survives a restart, and a manual `scheduleOffsetMinutes` change replaces it. The next two talks' speakers are added to the speech prompt so their names are spelled right. A talk introduced out of schedule order (on 16 November Open Standard, listed at 10:30, spoke before MoneyGram, listed at 10:20) is followed for its length plus 3 minutes without changing the delay; if it had already been recapped under the wrong slot, its recap is written again from what came after the introduction and replaces the old one. A speaker who is not the listed one is recognised by organisation ("Lamia Pardo from MoneyGram") when that organisation belongs to only one talk in the window; generic Solana names never count. Each stage heartbeat also carries the talk on now, the next talk and the delay, so the caption under the player on Watch live reads "Now · <talk>" and "Next · <time> · <talk>" (the desk's own session assignment still wins).

Announcements grow with the talk: each model check sees the items already sent for this talk with their text, and when the speaker adds real detail (numbers, dates, how it works) it sends the same item again, same id, title, quote and status, with a fuller body. The site accepts that update only while the item is still the collector's own: once an editor has saved it, or it has been withdrawn, the collector's version is ignored. Between talks nothing is transcribed; with more than 20 minutes to the next talk (lunch, overnight) the stream is disconnected and reconnects 10 minutes before it.
4. Every two chunks Claude Sonnet 5.5 checks the new speech (with the earlier speech of the same talk as context) for announcements. Each item must quote the new speech exactly, or it is dropped; titles already covered for the talk are skipped. When a talk ends (with 3+ minutes captured) one recap is written. Announcements, key points (briefings, shown as "Live notes") and recaps go out as Provisional, labelled "<Stage> · live transcript (auto)" (`publishKinds`; since 16 November briefings are listed, at Seb's request; take `briefing` out to send them to the desk as drafts again). Raw transcript chunks go to the desk.
5. Model calls never stop audio capture: a failed call is parked in `failed-jobs/` and the stage carries on. Haiku 5.5 is the fallback after a timeout, 429 or 5xx (one retry first).

Cost: Sonnet 5.5 is $2 in / $10 out per million tokens, with the instructions cached. A check with nothing to report costs about $0.003 (about $0.18 per stage-hour); the Breakpoint 2025 Jupiter keynote, dense with announcements, cost $0.11 for 12 minutes. Expect about $4 to $10 for both days. Every call is reserved against `dailyBudgetUsd` ($15) first and settled to its real cost after; `costs.csv` in the state folder lists every call. Switching `llm.model` to `claude-haiku-5-5` (about 1/20 of the cost; in the replay test it missed one item and its recap) takes effect without a restart.

Files: `collector/collect.py` (stages, jobs, desk), `collector/live.py` (YouTube, schedule, speech filters, model providers), `collector/config.breakpoint-stages.json` (event days), `collector/config.rehearsal.json` (tests), `scripts/rehearsal.mjs` (local copy of the site), `scripts/mac/` (setup, rehearsal runs, launchd jobs).

### Set up (once)

From `~/breakpoint-live/sebmontydotlink`: `bash breakpoint/scripts/mac/setup.sh 2>&1 | tee setup.log`. It installs Homebrew `ffmpeg`, `deno` (yt-dlp needs a JavaScript runtime for YouTube), `node` and `uv`, builds `breakpoint/.venv` with uv's own Python 3.12, installs `mlx-whisper` and `yt-dlp[default]`, downloads the 1.6 GB model and times a test clip. Homebrew's Python is not used for `.venv`: on macOS 26 it cannot load its XML parser (`pyexpat` needs a newer `/usr/lib/libexpat`), which breaks pip and `platform.mac_ver()`. Then add the Anthropic key with `python3 collector/setup.py`.

### Test (rehearsal, never production)

Preview and production share one database, so tests never post to a deployed site. `bash scripts/mac/rehearsal.sh MINUTES [--dry-run] [NAME]` runs the collector with `.local/rehearsal/config-NAME.json` (or `collector/config.rehearsal.json`); without `--dry-run` it also starts the local copy of the site at `http://127.0.0.1:4317/breakpoint` (real API, in-memory storage, provisional entries shown). `rehearsal.sh check [NAME]` checks the test links with yt-dlp. A replay (`simulateLive: true`, a recorded talk played at real speed) stops by itself after its recap. The collector restarts 5 s after a crash, as launchd does.

### Run it on Monday and Tuesday

```bash
cd ~/breakpoint-live/sebmontydotlink/breakpoint
bash scripts/mac/live.sh check stages    # 2-minute dry run against the live site: schedule and desk links, posts nothing
bash scripts/mac/live.sh start stages    # start, or restart if running (launchd; keeps running after Terminal closes, restarts after a crash)
bash scripts/mac/live.sh status          # both jobs, last log lines, today's model spend
bash scripts/mac/live.sh logs stages     # follow the log
bash scripts/mac/live.sh stop stages     # kill switch
```

When Solana publishes the stream links: desk (`/breakpoint#editor`), Broadcast connections, for each stage paste the YouTube link in any form (`watch?v=`, `/live/`, `youtu.be/` or `/embed/`; the site stores the embed form), tick Show player, save. If a save fails, the reason shows at the top of the desk. That one paste drives the player and the transcriber.

| Situation | What to do |
|---|---|
| A stage runs more than 2 minutes late | Edit that stage's `scheduleOffsetMinutes` in `collector/config.breakpoint-stages.json`; it applies within a minute |
| The log says "The site rejected a queued update" | The site refused that one update as invalid and gave its reason in the log line; the file is in `.local/<job>/outbox-rejected/` and everything queued after it still goes out. Fix the field and move the file back into `outbox/`, or leave it |
| The schedule is badly off | Set `sessionMode` to `"desk"` and assign the current session per stage on the desk |
| A wrong entry went out | Withdraw it from the desk with a note |
| Spend runs high | Set `llm.model` to `claude-haiku-5-5`, or lower `dailyBudgetUsd` |
| "Sign in to confirm you're not a bot" | The Mac Mini's IP was flagged; the backoff retries (15 s, 30 s, 60 s, then every 2 minutes) |
| "No supported JavaScript runtime" | `brew install deno` |
| A stage shows "stale" on the site | No heartbeat for 3 minutes: `live.sh status`, then `err.log` in `.local/stages` |
| Entries arrive as drafts | `BREAKPOINT_AUTO_PUBLISH_PROVISIONAL` is not `true` on Production, or Production was not redeployed |

Operating notes: a heartbeat older than three minutes shows as stale; the outbox and checkpoints survive restarts, so a restart never posts duplicates; failed model jobs are kept in `failed-jobs/`. The pre-November HTTPS-audio and OpenAI options still work (`audioUrl`, `transcriptionProvider` `openai` or `zai`, `llm.provider` `openai` or `zai`).

## Known limits

- Watchlists and saved events live on the visitor's device.
- Browser alerts need permission and an open tab.
- Project and session views use the newest 60 entries; Catch up pages further back.
- Luma can rate-limit; the guide then shows the last good copy or the committed snapshot and says so.
