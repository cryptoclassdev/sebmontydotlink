# sebmonty.link

Seb Montgomery's personal site: a homepage hub (research, socials, referral links, projects), a blog at `/blog`, and the Skill Files library at `/skill-files`.

- Live site: https://www.sebmonty.link
- Hosting: Vercel. Every merge to `main` deploys to the live site. Every pull request gets its own Vercel preview link.

## How changes ship

Nothing reaches the live site without review.

1. Work happens on a new branch off `main`. Nobody pushes to `main` directly.
2. Every change is opened as a pull request against `main`. Vercel posts a preview link on the PR.
3. Every PR adds an entry to the **Change log** below: what changed and why, files touched, how to check it on the preview, risks, and how to roll it back. The PR description carries the same details.
4. A reviewer checks the preview and the change-log entry, then merges. Merging publishes to sebmonty.link.

## Publishing an article

Articles are Markdown files in `content/articles/`, with their images in `public/articles/<slug>/`. The full guide is [docs/publishing.md](docs/publishing.md). Check articles with `pnpm articles:check`; the same check runs on every build and stops a broken article from reaching the site.

## Run it locally

Requires Node 20.9 or newer and pnpm 8.

```bash
pnpm install
pnpm dev              # local site at http://localhost:3000; article edits reload automatically
pnpm articles:check   # check every article
pnpm typecheck        # TypeScript check; run before every PR
pnpm build            # production build; run before every PR
```

Environment variables are listed in `.env.example`. The site builds without any of them; the MailerLite keys are only needed for the subscribe endpoint.

## Where things live

| What | File |
| --- | --- |
| Articles | `content/articles/<slug>.md`, images in `public/articles/<slug>/` |
| Categories and authors | `content/categories.yml`, `content/authors.yml` |
| Article compiler and the app's article API | `lib/publishing/compile.mjs`, `lib/publishing/index.ts` |
| Homepage content (hero, socials, referral links, projects) | `components/bento-grid.tsx` |
| Homepage styles | `components/link-tree.module.css` |
| Skill Files page and its styles | `app/skill-files/page.tsx`, `components/link-hub.module.css` |
| Blog pages | `app/blog/` |
| Header and footer (shared by every page) | `components/site-header.tsx`, `components/site-footer.tsx` |
| Article components | `components/blog/` |
| Site-wide colours, page width, header, footer, blog and article styles | `app/globals.css` |
| Agent-readable copies | `/blog/<slug>.md` (`app/agent/articles/[slug]/route.ts`), `/llms.txt` (`app/llms.txt/route.ts`) |
| Breakpoint London 2026 guide (`/breakpoint`) | Source, data, tests and collector in `breakpoint/` (see `breakpoint/README.md`); built page in `public/breakpoint/`; API in `app/breakpoint/api/[...path]/route.ts` |
| Legacy Sanity content | The RoboStrategy post still comes from Sanity (project `bfn64pgm`, Studio at `/studio`) until it is migrated |

## Change log

Newest first. One entry per pull request.

### London guide: Breakpoint days first, past days greyed, Olympia on the map

- **Date:** 16 November 2026
- **Pull request:** [#32](https://github.com/cryptoclassdev/sebmontydotlink/pull/32), branch `feat/london-guide-days`.
- **Status:** Ready for review. Page only; goes live on merge. Nothing to change on the Mac Mini.
- **Why:** Seb asked for the London guide's day filter to lead with the Breakpoint days, for the days already over to look finished but stay clickable, and for the map to show where Breakpoint itself is.

#### What changed
1. Day filter order is now Upcoming, All week, Mon 16, Tue 17, Wed 18, then Mon 9 to Sun 15. Before, the days ran Mon 9 to Wed 18, so the Breakpoint days sat at the far right.
2. A day that is over (London time) is greyed out and carries the tooltip "This day is over". It is still a normal button: clicking it lists that day's events and shows them on the map. Today that greys Mon 9 to Sun 15; tomorrow Mon 16 greys too, and stays in its place on the left.
3. The map always shows a marker labelled "Breakpoint · Olympia London" at the centre of the Olympia site (51.4966, -0.2103), whichever day or filter is chosen. From zoom 14 the site itself (Olympia Grand and Olympia National, the outline OpenStreetMap gives) is shaded with a dashed border. Clicking the marker, or the new pin button in the map controls, centres the map on Olympia at street level.
4. The map zooms much further: up to zoom 18 (it stopped at 15, where a single building is a few pixels), so the halls and the streets around them are readable. Besides the + and - buttons, a double-click zooms in, and a trackpad pinch (or ctrl/cmd + wheel) zooms in and out; a plain wheel still scrolls the page.
5. In Upcoming, events already under way are grouped first under "Happening now" (with a live dot and the note that each card shows when it ends). Before, a multi-day event that began on Wednesday 11 November led the list under the heading "Wednesday 11 November", which read as a past day.
6. Event cards: a multi-day event now reads "11 NOV UNTIL 18 NOV" (was "11 NOV TO 18 NOV"), with the true last day; a single-day event that is running reads "ON NOW · UNTIL 21:00".

#### Files touched
- `breakpoint/src/main.tsx`, `breakpoint/src/style.css`, `public/breakpoint/` (rebuilt), `README.md`

#### How to check it
On the Vercel preview, open `/breakpoint#events`: the chips read Upcoming, All week, Mon 16, Tue 17, Wed 18, then the greyed Mon 9 to Sun 15. Click a greyed day: its events list and its pins appear. The map shows the "Breakpoint · Olympia London" marker in west London; click it, then zoom in with + until the Olympia halls are labelled inside the shaded outline. The list under the map starts with "Happening now".

#### Checks run
- `npm test` in `breakpoint/` (69 JS tests, 93 Python tests), `tsc --noEmit`, page build.
- Local preview with the production feed: chip order and greying as above; clicking Thu 12 listed its 2 events and showed its pin; the Olympia marker stayed on the map throughout; the pin button plus two zoom-ins reached zoom 18 with Olympia Grand and Olympia National labelled inside the outline; Upcoming opened with "Happening now" (10 events) ahead of Monday 16 November. Also checked at phone width (375 px): the chips scroll sideways with the Breakpoint days first.

#### Risks
- The Olympia label can overlap event pins clustered around the venue at low zoom; it is drawn on top so it stays readable, and zooming in separates them.
- The outline is the whole Olympia site, not the specific hall Breakpoint uses.
- Deeper zoom loads more OpenStreetMap tiles per visit. Pinch zoom on a touch screen is not implemented; the buttons and double-tap work there.
- At phone width the Olympia marker sits at the left edge of the default map view (the map is centred on central London); it is visible, and one drag or a tap on it brings it to the middle.

#### Roll back
Revert this PR.

### Breakpoint: a picture on every coverage card (stage livestream stills, X post pictures), opt-in

- **Date:** 16 November 2026
- **Pull request:** [#30](https://github.com/cryptoclassdev/sebmontydotlink/pull/30), branch `claude/breakpoint-desk-visuals-847210`, based on #29 (`claude/breakpoint-card-visuals-ac5833`); merge #29 first.
- **Status:** Ready for review. Capture is off until switched on on the Mac Mini (steps in `breakpoint/README.md`, "Pictures on coverage cards"). Merging gives every card its cover straight away; stills start only once capture is on.
- **Why:** Seb wants a visual attached to each item "From the desk", ideally a frame of the stage feed at the moment the note was made.

#### What changed
1. **Collector, stage stills** (`"frames"` in `collector/config.breakpoint-stages.json`, off). For each transcribed 30-second chunk a separate thread takes one frame of the same YouTube stream (480p video format, ffmpeg, live edge), shrinks it to a 640 px WebP of 6 to 15 KB and keeps it for 6 hours. A note gets the still of the chunk its excerpt was heard in; a recap gets one from a third of the way into the talk. Failures skip the picture, never the note, and never hold up audio. Signed stream URLs are never logged.
2. **Collector, X pictures** (`"xMedia"` in `collector/config.breakpoint-x.json`, off). The post's own photo or video still from `pbs.twimg.com` (never a link-preview card), read from the twitterapi.io result the monitor already gets: no extra API calls.
3. **Storage and API.** Pictures go to the existing Upstash database as their own ingest payload (`media`, WebP or JPEG checked from the bytes, at most 150 KB) and are served at `/breakpoint/api/media/<id>` with a one-year immutable cache. Entries carry `image: {id, kind, at, credit}`; an image whose bytes were never stored is dropped. An `attach` ingest operation adds a picture to an already published entry only when it has none and an editor has not removed one. Expected size for both days: 3 to 6 MB.
4. **Page.** Cards show the picture with a "Livestream · 13:02" or "@handle on X" tag: on top on phones and in narrow lists, a left column on wide cards (with the speakers column kept on the right on the widest). The detail view shows it larger with its time; "Straight from X" posts show theirs. The desk's entry editor shows it with "Remove picture".
5. **A visual on every card, now.** A card with no stored picture, or one that fails to load, gets a cover from verified assets already in the repo (PR #29's logos and avatars): the tagged projects' and named speakers' companies' logos, else the named speakers' photos (the posting account's picture for X), else the stage name. It needs no stored image, so every entry already published shows one as soon as this deploys, with capture still off. No generated or stock imagery.
6. **With #26 (merged via #29).** Posts from X on cards are #26's embed (author, text, photos, video): that embed is their visual, so they get no stored picture or cover, and the detail view shows #26's "The post" rather than a separate still. #26 already loads X media straight from `pbs.twimg.com`, so this PR's X picture capture (`xMedia`) only adds a stored copy for "Straight from X": leave it off unless that copy is wanted. Owner-added speaker photos from #26 also take priority in the covers.
7. **Backfill** (`collector/backfill_frames.py`, dry run unless `--send`). Stills for notes published before capture was on, from the stream's DVR (YouTube keeps the last hour of a live stream) or, after the day, from the recording.

#### Files touched
- `breakpoint/collector/live.py`, `collect.py`, `xwatch.py`, `backfill_frames.py` (new), `config.breakpoint-stages.json`, `config.breakpoint-x.json`, `scripts/mac/setup.sh` (adds Pillow)
- `breakpoint/server/api.mjs`, `breakpoint/server/core.mjs`
- `breakpoint/src/main.tsx`, `breakpoint/src/style.css`, `public/breakpoint/` (built page)
- `breakpoint/tests/api.test.mjs`, `breakpoint/tests/test_frames.py` (new), `breakpoint/README.md`, `README.md`

#### How to check it on the Vercel preview
Preview and production share one database and capture is off, so every card shows its cover (logos, faces or stage name) and no stills yet: check Overview, Catch up and a session popup in light and dark and at phone width. `/breakpoint/api/media/f00000000000000000000000000000000` answers 404. The pictures themselves were checked on the local rehearsal copy (screenshots in the PR).

#### Risks
- **Rights.** The stills are frames of the Solana Foundation's YouTube broadcast, republished as thumbnails on a commercial-adjacent page. Short, credited stills used to illustrate news coverage are a common practice, but YouTube's terms do not grant a licence to copy frames, and this has not been cleared with the Foundation. Get their OK before turning `frames` on, or keep it off. X pictures belong to the posting account and are shown with a link to the post.
- Wide shots, slides and holding slates appear as often as the speaker; the editor can remove any picture.
- Upstash holds the bytes base64-encoded in JSON (a third larger); fine at this size, not for video.

#### Roll back
Turn `frames` and `xMedia` off in the configs (no restart needed), or revert this PR. Entries keep an `image` field the old page ignores.

### Breakpoint: speakers' faces, X handles and company logos; richer coverage cards

- **Date:** 16 November 2026
- **Pull request:** [#29](https://github.com/cryptoclassdev/sebmontydotlink/pull/29), branch `claude/breakpoint-card-visuals-ac5833`.
- **Status:** Ready for review. Page, data and scripts only; the collector and X monitor are unchanged.
- **Why:** Every speaker showed as grey initials ("MW") with no X handle or company logo, and the live-note cards were a label, a headline and grey text with most of the card empty.

#### What changed
1. **Profile pictures, stored once.** `scripts/fetch-x-avatars.py` reads each verified account's picture through twitterapi.io, resizes it to 96 x 96 WebP and saves it in `breakpoint/assets/avatars/` (229 files, 1 MB; sources and dates in `assets/avatars/SOURCES.md`). `scripts/build.mjs` copies them to `/breakpoint/avatars/`. The page never loads X image URLs.
2. **Linking.** `scripts/link-x-accounts.py` joins `data/x-accounts.json` to `seed.json`: speakers by name, organisations by normalised name or a short alias list with reasons (Marinade Labs, Pyth, Akash, Reflect Money, Fiserv Digital Asset Services, WisdomTree Onchain, Solana / Solana Labs, plus Ramp and Fidelity Digital Asset Management, which `x-accounts.json` already ties to those talks). It writes `xHandle`, `xUrl` and `avatar` on speakers, an `organizations` map and an `xAvatars` list; `/api/static` passes them on.
3. **New accounts, picture only.** 20 organisations and 6 speakers that had no account were checked on 16 Nov (the organisation's own site links the account, or a verified profile's name and website match) and added to `data/x-accounts-pictures.json` with the reason for each. The X monitor does not read that file, so it watches the same accounts as before. @MayorofLondon was left out because its picture is the Mayor himself, not the speaker; Bloomberg News, R3 and Invesco were not confirmed.
4. **Faces everywhere a speaker appears:** session popup, live-note detail, Speakers grid (with the company logo pinned to the photo and the handle in the footer), speaker popup, and "Straight from X" avatars. No verified account means initials, never a guess.
5. **Coverage cards (`NewsCard`):** a kind pill (green dot for live notes), stage and time on top, a balanced headline, and an "On stage" column with each speaker's photo, linked @handle, role and company logo; the person the note names comes first. Narrow cards (two-column lists, dialogs, phones) stack the people under the headline. Project chips show the project logo where there is one. Excerpts end on a word. A note shows the session's speakers only when it names one of them (or it is the talk's summary), so a note filed under the wrong talk never shows the wrong faces.
6. Kobra `Avatar` (`src/components/ui/avatar.tsx`, Base UI) for the photos.
7. **Merged with #26.** Posts from X on cards show #26's embed (no separate "Posted by" column); talk recaps keep this PR's Speakers column instead of #26's face byline; #26's owner-added speaker photos take priority in the faces; Straight from X uses the stored avatar, then the embed's, then the initial; the entry detail shows both the speaker list and #26's post embed.

#### Coverage
- Speakers: 116 of 149 have a verified X handle, 114 a picture (@ruh_gw uses X's default picture; @mrstoad returns "user not found"). Still initials: Alexandra Lang, Annabel Spring, Arizona Muse, Carlos Matilla, Cate Clancy, Christian Rau, Dan Phillips, David Vatchev, Fig Gowen, George Ruhana, Harriet Browning, Hester Serafini, Howard Dawber OBE, Igor Voloshin, Irene Tse, Jasmine Jia, Jerome Oei, John Hallahan, John Timoney, Kathrin Hamilton, Kathy Kriskey, Lucas Harris, Michael Lewis, Nikou Asgari, PJ Bain, Patrick Corker, Rowland Berry, Scott Lucas, Sir Nicholas Lyons, Sol Campbell, Stephen Gardner, Stephen Whyman, Steven Wager, Sue Gray, Val Wotton.
- Organisations (as written on the agenda): 104 of 128 have an account, 102 a logo. No logo: Allfunds, Baroness Gray of Tottenham, Bitwise, Bloomberg News, Cyber Capital, Energy Substantiation, FairClub, Fasanara Capital, Forma, Formation Securities, Former Premier League Player / Golbal360 and Sol Media, Frontier/1, Graticule Asset Management Asia (GAMA), IO Builders, Invesco, Mayor of London, Multicoin, New York Life Investment Management, Open Standard, PEAK6 / Clocked., Powerus, R3, Soilonic, Star, StrataMedia, The Rest Is Classified.
- @BitwiseInvest and @multicoincap return "user not found" on twitterapi.io today; the X monitor follows both, so it gets nothing from them. Worth checking their handles separately.

#### Screenshot in the card (assessed, not built)
Feasible, but not with the collector as it is. It asks yt-dlp for an audio-only format and records audio chunks, so it never sees video. It would need to: resolve a low video format (360p) for the same stream; when a note is made, grab one frame with ffmpeg at the note's position (live YouTube keeps a few hours of DVR, so seeking back the 1 to 2 minutes the note takes is possible); resize to about 640 px WebP (around 30 KB); and store it somewhere that serves images. Upstash holds JSON only, so that means Vercel Blob or similar plus a new ingest field and a desk control to drop a bad frame. Expect wide shots or slides as often as the speaker, and the stream belongs to the Solana Foundation, so a frame per note is a rights question as much as an engineering one. A day of work plus a storage decision; too much to add during the conference.

#### Files touched
- `breakpoint/src/main.tsx`, `breakpoint/src/style.css`, `breakpoint/src/components/ui/avatar.tsx`
- `breakpoint/scripts/fetch-x-avatars.py`, `breakpoint/scripts/link-x-accounts.py` (new), `breakpoint/scripts/build.mjs`, `breakpoint/scripts/import-agenda.py` (usage line)
- `breakpoint/server/api.mjs` (`/api/static` adds `organizations` and `xAvatars`)
- `breakpoint/data/seed.json`, `breakpoint/data/x-accounts-pictures.json` (new), `breakpoint/assets/avatars/` (new)
- `public/breakpoint/` (built page and avatars), `README.md`

#### How to check it
On the Vercel preview at `/breakpoint`: Watch live shows each live note with the speaker's photo, @handle and company logo beside the headline (Kamino notes show Michael Weisz and the Kamino logo). Schedule, then any Kamino session, shows the speaker list with photos. Schedule, Speakers shows the grid with faces. Overview, Straight from X shows account pictures. Switch the theme and check on a phone width.

#### Checks run
- `tsc --noEmit`, `npm run build`, 59 Node tests and 82 Python tests pass.
- Screenshots of the session popup, a live-note card, the Speakers grid, X posts and a phone width in light and dark from a local copy (this branch's page and seed, live entries read from production).

#### Risks
- A profile picture can change after it was taken; rerun `fetch-x-avatars.py --refresh <handle>`.
- Some speakers' verified "account" on the official speakers page is their company's account (Andrew Fox shows the Powerus logo); that is what the official page links.
- `import-agenda.py` keeps the new speaker fields, but run `link-x-accounts.py` after any re-import.

#### Roll back
Revert this PR. The live feed and collector are unaffected either way.
### Backpack's BP token on the Watchlist

- **Date:** 16 November 2026
- **Pull request:** [#31](https://github.com/cryptoclassdev/sebmontydotlink/pull/31), branch `feat/backpack-bp-token`.
- **Status:** Ready for review. Data, one test and docs only; goes live on merge. Nothing to change on the Mac Mini.
- **Why:** Seb pointed out that Backpack has a token, but its Watchlist card showed no ticker or price.

#### What changed
1. Backpack's entry in `breakpoint/data/seed.json` now carries the ticker `BP`, the mint address `BPxxfRCXkUVhig4HS1Lh7kZqV6SPJhzfEk4x6fVBjPCy`, the page it was verified on (`mintSourceUrl`) and a note. The existing price code picks up any project with a ticker and a verified mint, so the Backpack card now shows `$BP` with the USD price and 24h change, and Source health counts 6 tokens instead of 5.
2. The mint comes from Backpack's own Learn page, "What Is BP? Backpack's Official Token Ticker and Contract Address Explained" (published 17 March 2026, updated 9 October 2026). Jupiter lists the same address as verified (name Backpack, symbol BP) and prices it. Third-party sites show other addresses for tokens named Backpack; they were not used.
3. No page, style or collector code changed.

#### Files touched
- `breakpoint/data/seed.json`, `breakpoint/tests/prices.test.mjs`, `breakpoint/README.md`, `README.md`

#### How to check it
On the Vercel preview, open `/breakpoint#projects`: the Backpack card shows `$BP` and a price with its 24h change, like Kamino and Jupiter. `/breakpoint#watch`, Source health: "Jupiter prices for 6 tokens".

#### Checks run
- `npm test` in `breakpoint/` (the price test now expects Backpack among the priced projects).
- Jupiter's Price API v3 returns a price for the mint (about $0.83 on 16 November 2026, about $2.8M liquidity).
- Local preview with the production feed and this seed: the Backpack card showed `$BP $0.8258 +0.4% 24h`.

#### Risks
- If Jupiter stops pricing BP, the card shows no price (never an estimate); nothing else changes.
- Token prices are context, not a signal; the Watchlist already says so.

#### Roll back
Revert this PR. The Backpack card returns to having no ticker or price.
### Breakpoint: the official validator.com logo in "Powered by"

- **Date:** 16 November 2026
- **Pull request:** [#28](https://github.com/cryptoclassdev/sebmontydotlink/pull/28), branch `fix/validator-logo`.
- **Status:** Ready for review. Breakpoint page only (`/breakpoint`). Seb approved the block in a local preview.
- **Why:** The sidebar's "Powered by" block set "validator.com" as plain bold text, which is not the validator.com logo. Seb asked for the official lockup (three blocks and the wordmark) and validator.com's own tagline.

#### What changed
1. **Logo:** the official tricolour lockup exported as SVG from the "Brand Kits - Validator" Figma file (Assets page, "Logos New": light node 2001:2104, dark node 2001:2140), with Figma's own outlined wordmark, cropped to the logo and otherwise unedited. Colours: navy `#1A1A40`, blue `#3295EB`, orange `#EC5228`. In dark mode it uses the kit's dark version (white first block, white wordmark).
2. **Size:** the logo spans the sidebar's width: about 169 x 14 px on a full-width window, 140 x 12 px at the narrowest sidebar. The small arrow after it is gone; the whole logo is the link to validator.com, labelled "opens in a new tab" for screen readers.
3. **Tagline:** "Safe and Trusted Staking" (from the same Figma file) sits under the logo in bold, replacing "Independent coverage. Connected to the source." The "POWERED BY" label stays.
4. **Sidebar scroll:** the sidebar now scrolls when the window is shorter than its contents. Before, it was fixed with no scroll, so on short windows the bottom of the sidebar, including this block, was cut off.
5. Sources and the standalone light and dark SVGs are in `breakpoint/assets/brand/`.

#### Files touched
- `breakpoint/src/components/validator-logo.tsx` (new), `breakpoint/src/main.tsx`, `breakpoint/src/style.css`
- `breakpoint/assets/brand/SOURCES.md`, `validator-lockup-light.svg`, `validator-lockup-dark.svg` (new)
- `public/breakpoint/app.js`, `public/breakpoint/style.css`, `public/breakpoint/index.html` (rebuilt)
- `README.md`

#### How to check it
On the Vercel preview, open `/breakpoint` on a desktop-width window and look at the bottom of the left sidebar: "POWERED BY", the validator.com logo, then "Safe and Trusted Staking". Switch to dark mode with the moon button: the first block and the wordmark turn white. Clicking the logo opens validator.com in a new tab. Make the window short (under about 850 px tall): the sidebar scrolls and the block is reachable at its bottom. On a phone the sidebar is hidden, as before.

#### Checks run
- `npm run typecheck` and `npm test` in `breakpoint/`.
- In a browser, light and dark, at 1280, 1100, 900 and 800 px wide, at short heights and at phone width: the logo fits each sidebar width and is never cut off. Side by side with the Figma export at 1x and 2x it matches. At the narrowest sidebar (175 px, windows 700 to 960 px wide) the tagline wraps to two lines.

#### Risks
- The live validator.com header draws its blocks in slightly different colours (a lighter cyan and a more purple navy, in CSS). This uses the Figma brand kit's colours, as Seb approved.
- PR #29 changes the same import lines in `breakpoint/src/main.tsx`, this change log and the built files in `public/breakpoint/`; whichever merges second needs a rebase and a rebuild (`npm run build` in `breakpoint/`).

#### Roll back
Revert this PR.

### Catch up: posts from X as embeds, faces on talk recaps

- **Date:** 16 November 2026
- **Pull request:** [#26](https://github.com/cryptoclassdev/sebmontydotlink/pull/26), branch `feat/catchup-x-embeds`.
- **Status:** Ready for review. Page, API and page security policy; goes live on merge. Nothing to change on the Mac Mini.
- **Why:** Seb asked for the Catch up cards to look more like the tweet embeds in our Discord dashboard, and, if possible, for talk summaries to show the speakers.

#### What changed
1. Every card whose source is a post on X now shows the post the way Discord embeds it: avatar, name, verified badge, @handle, the text with working links, mentions and cashtags, photos, a link preview, a quoted post, and the post time. The card keeps the desk headline above it; the post replaces the summary paragraph (the summary is still in Full details). The Full details dialog shows the post in full in place of the source excerpt.
2. Videos and GIFs show their poster with the duration and play inside the card. X's video server refuses requests that name another site, so the page fetches the video without a referrer when the reader presses play. Videos over 3 minutes, or any that fail, open on X instead.
3. Data comes from X's public embed endpoint (the one behind publish.twitter.com embeds): no key and no cost. The server fetches each post once, keeps it in storage as `tweets/<id>.json`, and adds it to the entry as `embed` in `/breakpoint/api/live` and `/feed`. At most 12 new posts are fetched per request (2.5 s timeout); a post X does not return is retried after 10 minutes; stored posts are re-checked every 6 hours (so a deletion shows). Entries themselves are not changed.
4. If X does not answer, the card draws the same layout from what the X monitor stored (account name, handle, post text) with an initials avatar. A post deleted since is marked as deleted.
5. Talk summaries show who gave the talk: overlapping initials avatars in a colour per speaker, the company logo badge where we have it, names, company, and the talk title and stage. Clicking it opens the talk.
6. Straight from X on the Overview (#25) also gets the embed: its cards show the account's real avatar. `/api/live` attaches embeds to `entries` and `xPosts` in one lookup.
7. Speaker photos: optional. A photo added at `breakpoint/assets/speakers/<speaker-id>.webp` replaces that speaker's initials after a rebuild (see the README there). None are included.
8. Page security policy (`next.config.mjs`, `/breakpoint` only): images from `pbs.twimg.com`, fetches from `video.twimg.com`, and `blob:` media.

#### Files touched
- `breakpoint/server/tweets.mjs` (new), `breakpoint/server/api.mjs`, `app/breakpoint/api/[...path]/route.ts`
- `breakpoint/src/xpost.tsx` (new), `breakpoint/src/main.tsx`, `breakpoint/src/seb.css`, `breakpoint/scripts/build.mjs`, `public/breakpoint/` (rebuilt)
- `breakpoint/tests/tweets.test.mjs`, `breakpoint/tests/fixtures/x/` (new: six real embed responses)
- `breakpoint/assets/speakers/README.md`, `breakpoint/README.md`, `next.config.mjs`, `README.md`

#### How to check it
On the Vercel preview, open `/breakpoint#catchup` and pick From X: each card shows the post with avatar, text and media. Press play on a video card; it plays in place. Open Full details on an X card: the post shows in full. Pick Talk summaries: each card shows the speakers and the talk. `/breakpoint/api/live` shows `embed` on X entries.

#### Checks run
- Rebased on main after #24 and #25; main merged in again after #27 (only this change-log section overlapped). `npm test` in `breakpoint/` (66 JS tests including 7 new, 80 Python tests), `tsc --noEmit` for the page, page build.
- Local preview with the production feed passed through the new embed step, in Chrome at desktop, phone and dark mode: all 13 X posts in the feed got embeds (photo, video, link preview and quoted posts all render); a video played in the card under the new security policy with no policy errors; with embeds switched off, the fallback cards render; Straight from X shows real avatars and `#catchup?kind=social` opens on From X. A real deleted post (Solana's first Western Union post, reposted a minute later) shows the deleted note.

#### Risks
- X's embed endpoint is unofficial and could change or stop. Then cards fall back to the stored text; nothing else breaks (an embed failure never fails `/live`).
- The preview and production share the Upstash database, so previewing this branch writes `tweets/<id>.json` records. They are a cache in the final format and harmless.
- Readers' browsers load avatars and media from X's servers (`pbs.twimg.com`), and `video.twimg.com` when they press play.
- Cards with media are taller, so the two-column grid has more uneven rows.

#### Roll back
Revert this PR. Stored `tweets/` records are then unused and can stay.

### X reposts make one card; an offline stream is not shown as an error

- **Date:** 16 November 2026
- **Pull request:** [#27](https://github.com/cryptoclassdev/sebmontydotlink/pull/27), branch `fix/x-reposts`.
- **Status:** Ready for review. Collector, tests and docs only; on the Mac Mini after `bash scripts/mac/live.sh start x`, `start stages` and `start lparmy`.
- **Why:** At 11:17 and 11:18 @solana posted its Western Union post twice, and both showed in "Straight from X" (#25). Separately, when LP Army's stream paused after its morning session, Source health told readers "Reconnecting to the stream" in error red.

#### What changed
1. **X monitor:** a post whose text matches one the same account posted in the last 300 kept posts (ignoring links, punctuation, case and spacing) is skipped. Claude moved the earlier Western Union copy back to draft by hand at 11:25 UTC.
2. **Stages:** "is not live" now reads "Stream offline; waiting for it to come back" and "will begin in" reads "Stream starts soon", both as ready, not error. Real failures still read "Reconnecting to the stream".

#### Files touched
- `breakpoint/collector/xwatch.py`, `breakpoint/collector/collect.py`
- `breakpoint/tests/test_xwatch.py`, `breakpoint/tests/test_live.py`
- `README.md`

#### How to check it
On the live site: Straight from X shows each post once; Watch live, Source health, LP Army reads "Stream offline; waiting for it to come back" while its stream is paused.

#### Checks run
- 82 Python tests and 59 Node tests. New tests: two identical posts in one check make one card and a repost in a later check is skipped; offline and scheduled streams report ready, other failures still report an error.

#### Risks
- An account that deliberately posts the same text twice (a reminder, say) shows it once.

#### Roll back
Revert this PR and restart the jobs with `start`.

### Collector: talks out of schedule order, organisation introductions, X triage repair

- **Date:** 16 November 2026
- **Pull request:** [#24](https://github.com/cryptoclassdev/sebmontydotlink/pull/24), branch `fix/xwatch-items-repair`.
- **Status:** Ready for review. Collector, tests and docs only; on the Mac Mini after `bash scripts/mac/live.sh start stages` and `bash scripts/mac/live.sh start x`.
- **Why:** On day 1 the Main Stage ran Open Standard (listed 10:30) before MoneyGram (listed 10:20), and MoneyGram's speaker was not the one listed. Detection only looked forward and only by speaker name, so the MoneyGram slot recapped Open Standard's talk and the next recap mixed both. Claude repaired those items by hand at 11:05 (two recaps rewritten, five items moved to the right talk, the Zelle recap cleaned). Separately, the X monitor's triage failed four times because Claude Haiku sent its list as text that was not valid JSON.

#### What changed
1. **Out-of-order talks:** an introduction for a talk listed earlier than the current one makes the collector follow that talk for its length plus 3 minutes, leaving the delay unchanged; the next forward introduction ends that and shifts the delay as before. If the talk was already recapped under the wrong slot, it is reopened: its new recap covers only what came after the introduction and is sent as an update that replaces the old recap (unless an editor has saved it).
2. **Organisation introductions:** "introduce to the stage <name> from MoneyGram" counts for the MoneyGram talk when that organisation (5+ letters, not a generic Solana name) belongs to only one talk in the window.
3. **X triage repair** (made directly on the Mac Mini at 10:53 UTC in another session; this PR brings it into the repo unchanged): a list sent as text is parsed leniently (raw line breaks inside strings, text around the list, a list without its brackets, an object holding it, or a double-encoded string), a malformed answer is asked again once in the same check (`xTriageRetries`, default 1), and a failure note gives the text length and error position, never the content.

#### Files touched
- `breakpoint/collector/live.py`, `breakpoint/collector/collect.py`, `breakpoint/collector/xwatch.py`
- `breakpoint/tests/test_live.py`, `breakpoint/tests/test_xwatch.py`
- `breakpoint/README.md`, `README.md`

#### How to check it
On the Mac Mini: `bash scripts/mac/live.sh logs stages` shows "out of schedule order; following it until HH:MM" when it happens; X checks stop logging "Triage response has no items list".

#### Checks run
- 80 Python tests and 55 Node tests. New tests: organisation introductions (and generic names ignored); an earlier-listed talk is followed without changing the delay, its recap reopened, then a forward introduction resumes the schedule with the new delay; a followed talk ends after its length plus 3 minutes; the triage text forms are recovered and a malformed answer is retried once (tests from the Mac Mini fix).

#### Risks
- A cue followed by the name of an earlier talk's organisation, said in passing, could make the collector follow that talk for one slot; the next introduction or the slot's end ends it.

#### Roll back
Revert this PR and restart both jobs with `start`.

### Sidebar sections open in a new browser tab

- **Date:** 16 November 2026
- **Pull request:** [#23](https://github.com/cryptoclassdev/sebmontydotlink/pull/23), branch `feat/sidebar-new-tabs`.
- **Status:** Ready for review. Page only; goes live on merge.
- **Why:** Seb asked for the sidebar sections (Overview, Watch live, Catch up, Schedule, London guide, Watchlist) to open in a new tab instead of replacing the page, so a stream playing on Watch live keeps running.

#### What changed
1. Desktop sidebar links open their section in a new browser tab (`target="_blank"`, `rel="noopener"`).
2. Kept as it was: the phone's bottom bar still switches sections in place, since new tabs are awkward on a phone; buttons inside pages ("Watch the stages", "Full programme") also stay in place.

#### Files touched
- `breakpoint/src/main.tsx`, `public/breakpoint/` (rebuilt)
- `README.md`

#### How to check it
On the live site after merge, desktop: click Catch up in the sidebar; it opens in a new tab and the original tab (for example Watch live with a playing stream) stays as it was.

#### Checks run
- `tsc --noEmit`, page build.

#### Risks
- Readers who click around a lot collect tabs.

#### Roll back
Revert this PR.

### Watch a talk from its card; Now and next follows the stage's delay

- **Date:** 16 November 2026
- **Pull request:** [#22](https://github.com/cryptoclassdev/sebmontydotlink/pull/22), branch `feat/watch-from-session`.
- **Status:** Ready for review. Page only; goes live on merge.
- **Why:** Seb clicked "On now" on the Overview, got the talk's card, and had no way to the live stream from there. The same block also showed the published slot ("Zelle Goes Global, until 10:50") while the Main Stage was running 9 minutes late on an earlier talk.

#### What changed
1. **Talk card:** a "Watch live now" button when the stage's audio is live on this talk, otherwise "Watch the <stage> stream", whenever that stage has a player on the desk. It closes the card and opens Watch live on that stage.
2. **Watch live** opens on the stage named in the link (`#watch?stage=royal`), also when already open.
3. **Overview, Now and next:** uses the talk the Mac hears on each stage and shifts the published times by the stage's reported delay ("ON NOW · UNTIL 10:59 · 9 MIN LATE", next talk time shifted too).

#### Files touched
- `breakpoint/src/main.tsx`, `breakpoint/src/style.css`, `public/breakpoint/` (rebuilt)
- `README.md`

#### How to check it
On the live site after merge: Overview, click the Main Stage "On now" card: the card shows "Watch live now" and opens Watch live on the Main Stage. The On now card names the same talk as the Watch live caption.

#### Checks run
- `tsc --noEmit`, page build.

#### Risks
- With no heartbeat (Mac off), Now and next falls back to the published times, as before.

#### Roll back
Revert this PR.

### Session summaries stand out and get their own list on Watch live

- **Date:** 16 November 2026
- **Pull request:** [#21](https://github.com/cryptoclassdev/sebmontydotlink/pull/21), branch `feat/session-summaries-panel`.
- **Status:** Ready for review. Page and API; goes live on merge.
- **Why:** Seb asked for session summary cards to stand apart from the live notes, and for a list of all summaries on the right of the page for readers who only want the recaps, including after many talks have passed.

#### What changed
1. **Summary cards** have a light green tint and border (with a matching eyebrow), in light and dark mode, wherever cards show.
2. **Watch live, right column:** a "Session summaries" panel above Source health lists every talk recap, newest first, with stage and time; each opens the full recap.
3. **API:** recaps get their own index (`summary-index/`), and `/api/live` returns `summaries` (up to 80, withdrawn ones left out), so the list keeps the morning's recaps after the latest-60 feed has filled with live notes. Recaps saved before this change are picked up from the feed.
4. **LP Army caption:** with no published schedule, the caption shows "Now · <what the stage is transcribing>" from its status instead of "No session currently assigned".

#### Files touched
- `breakpoint/server/api.mjs`, `breakpoint/src/main.tsx`, `breakpoint/src/style.css`, `public/breakpoint/` (rebuilt)
- `breakpoint/tests/api.test.mjs`
- `README.md`

#### How to check it
On the live site after merge: Watch live shows "Session summaries" at the top of the right column with the welcome recap; summary cards in Live notes have the green tint; the LP Army caption reads "Now · LP Army (Meteora), Breakpoint day 1".

#### Checks run
- 55 Node tests (new: a recap stays in `summaries` after 62 newer items push it out of the feed, and drops out when withdrawn), `tsc --noEmit`, page build.

#### Risks
- None for data: one extra index key per recap.

#### Roll back
Revert this PR.

### Cards show "Full details" instead of review labels

- **Date:** 16 November 2026
- **Pull request:** [#20](https://github.com/cryptoclassdev/sebmontydotlink/pull/20), branch `feat/cards-full-details`.
- **Status:** Ready for review. Page only; goes live on merge.
- **Why:** Seb asked for no review labels on the public cards ("Provisional", "Source checked" and the like); the status stays on the desk, and readers get a "Full details" link instead.

#### What changed
1. News cards: the status badge in the top-right corner is replaced by a "Full details" link that opens the item; the arrow next to the title is gone (the title still opens it).
2. Item details: the status and novelty labels are gone.
3. Kept on purpose: a "Corrected" or "Withdrawn" label still shows, on the card and in the details, so a retracted claim never reads as current. The editor desk still lists every status.

#### Files touched
- `breakpoint/src/main.tsx`, `breakpoint/src/style.css`, `public/breakpoint/` (rebuilt)
- `README.md`

#### How to check it
On the Vercel preview: Overview, Catch up and Watch live cards show "Full details" at the top right and no "Provisional" badge; opening one shows no status labels. The desk (`#editor`) still shows Draft, Provisional and Source checked.

#### Checks run
- `tsc --noEmit`, page build, 53 Node tests.

#### Risks
- Readers can no longer tell an automatic item from one an editor checked; every item still names its source ("live transcript (auto)" or the X account).

#### Roll back
Revert this PR.

### Key points go live; Watch live shows the talk now and next; announcements gain detail as the talk goes on

- **Date:** 16 November 2026
- **Pull request:** [#19](https://github.com/cryptoclassdev/sebmontydotlink/pull/19), branch `feat/watch-now-and-next` (built on PR #18, which it includes).
- **Status:** Ready for review. The page and API change go live on merge; the collector part on the Mac Mini when the stages job restarts (`bash scripts/mac/live.sh start stages`).
- **Why:** On day 1 Seb saw "No session currently assigned" under the Main Stage player although the Mac knew the talk, and the first Main Stage announcement ("Solana moves from Mainnet Beta to Mainnet 1.0") was written from its first minute, ending "No technical details, dates or protocol changes were given", while the numbers (stake, transactions, Alpenglow finality) came a minute later.

#### What changed
0. **Key points go live:** at Seb's request (16 November, "I don't want drafts"), briefings can be listed in `publishKinds` and publish as Provisional like announcements; they show as "Live notes" cards. Both stage configs now list them (Main Stage and Royal Exchange: announcement, briefing, summary; LP Army: announcement, briefing). A briefing is written as one key point: its title is the point itself.
1. **Now and next on Watch live:** the stage heartbeat carries `sessionId`, `nextSessionId` and `delayMinutes` (validated by the API; other heartbeats unchanged). The caption under the player shows "Now · <talk>" while audio is live and "Next · <time> · <talk>", the time shifted by the stage's delay, with "(running N min late)". A session assigned on the desk still wins.
2. **Announcements gain detail:** the model sees the items already sent for this talk with their body. When the speaker adds real detail, it returns that item with `updates` set to its title and a complete body; the collector re-sends the same item (same id, title, quote, status and time) with the fuller body and takeaways, flagged `update: true`.
3. **The site accepts such an update only from the collector, only for its own item:** never after an editor has saved it (entries now record `lastEditor`) and never once withdrawn. A plain retry is still a duplicate.
4. **Prompt:** never write what was not said ("no details were given"); an updated body may run to 900 characters.

#### Files touched
- `breakpoint/collector/collect.py`, `breakpoint/collector/config.breakpoint-stages.json`, `breakpoint/collector/config.breakpoint-lparmy.json`, `breakpoint/server/api.mjs`, `breakpoint/src/main.tsx`, `public/breakpoint/` (rebuilt)
- `breakpoint/tests/test_live.py`, `breakpoint/tests/api.test.mjs`
- `breakpoint/README.md`, `README.md`

#### How to check it
On the Vercel preview, Watch live, Main Stage: once the Mac's stages job runs this version, the caption reads "Now · <talk>" and "Next · <time> · <talk>" (preview and production share storage, so the live heartbeat shows there too). On the live site after merge, an announcement card's text grows when the speaker adds detail, keeping its time and Provisional badge; `bash scripts/mac/live.sh logs stages` shows "Updated with new detail: <title>".

#### Checks run
- 73 Python tests, 53 Node tests, `tsc --noEmit`, page build. New tests: key points publish as Provisional when briefings are listed; heartbeat with now, next and delay stored and returned, bad ids and delays refused, other sources unchanged; a later chunk updates the same item (same id, title, quote, status) and the stored copy; the API accepts the collector's update to its own item, keeps the status, treats a plain retry as a duplicate, and ignores updates after an editor save or a withdrawal.

#### Risks
- An update rewrites a card's text while people read it; the title, quote and time stay the same.
- Old collectors keep working: they send no update flag and no extra heartbeat fields.

#### Roll back
Revert this PR. Updated cards keep their latest text; the caption returns to the desk assignment only.

### Stage transcription follows the room: speaker introductions shift the schedule

- **Date:** 16 November 2026
- **Pull request:** [#18](https://github.com/cryptoclassdev/sebmontydotlink/pull/18), branch `feat/stage-schedule-from-intros`.
- **Status:** Ready for review. Collector, tests and docs only; the website is unchanged. Takes effect on the Mac Mini when the stages job restarts (`bash scripts/mac/live.sh start stages`).
- **Why:** Seb asked for the talk to be recognised from the transcript, since every talk starts with its speaker being introduced. On day 1 the Main Stage stream was still on "Breakpoint will begin shortly" at 10:04 for a 10:00 start, and many talks are 5 to 10 minutes long, so a fixed schedule would credit announcements to the wrong talk.

#### What changed
1. After each transcribed chunk (with the end of the previous one), the collector looks for an introduction: a cue ("please welcome", "give it up for", "joined by", "next up", "our next" and similar) followed within about 70 characters by the name of a scheduled speaker on that stage, or by their surname if it has 5+ letters. Accents and punctuation are ignored, and names count as heard when they sound close enough (Whisper wrote "Lily Lu and Rachel Connors" for Lily Liu and Rachel Conlan at 10:09 on day 1): a similarity of 0.8 overall, with the first name and surname each close on their own. If several speakers are named, the last one wins ("thank you A, and please welcome B").
2. Only talks on that stage within 45 minutes of now (after the current shift) count, and never a talk earlier than the current one. The moment of the introduction becomes that talk's start: the stage's offset is set to the difference (if it changes by 2 minutes or more), so this talk and the following ones line up. Logged as "Heard <speaker> introduced"; the live status on Watch live adds "running N min behind schedule".
3. The learned offset is kept in the stage's checkpoint for the day and survives a restart. Editing `scheduleOffsetMinutes` by hand replaces it.
4. The speakers of the next two talks are added to the Whisper prompt so their names are transcribed correctly when they are introduced.

#### Files touched
- `breakpoint/collector/live.py`, `breakpoint/collector/collect.py`
- `breakpoint/tests/test_live.py`
- `breakpoint/README.md`, `README.md`

#### How to check it
Nothing changes on the Vercel preview. On the Mac Mini after `bash scripts/mac/live.sh start stages`: `bash scripts/mac/live.sh logs stages` shows "Heard ... introduced" lines as talks begin, and Watch live, Source health, Main Stage reads "Live transcript: <talk> · running N min behind schedule" when the stage is late.

#### Checks run
- 69 Python tests and 49 Node tests. New tests: introductions found with full names, long surnames and accents; passing mentions, earlier talks, far-off talks and 4-letter surnames alone ignored; the last introduced speaker wins; an 8-minute-late introduction moves this talk and the next, shows in the status, survives a restart, ignores a 1-minute change, and gives way to a manual offset; recovered chunks do not move the schedule.

#### Risks
- A cue followed by a scheduled speaker's name in passing (for example "next up we'll hear from ...", said early) can shift the schedule to that talk too soon; the 45-minute window, the forward-only rule and the 2-minute threshold limit this, and the next real introduction corrects it. A misheard name means no shift, which is today's behaviour.
- A wrong shift can be overridden at once by setting `scheduleOffsetMinutes` in `collector/config.breakpoint-stages.json` (applies within a minute).

#### Roll back
Revert this PR and restart the stages job with `start`. A learned offset left in the checkpoint is ignored by the old code.

### Event-day fixes: a rejected update no longer holds up the rest; the desk accepts any YouTube link; LP Army job

- **Date:** 16 November 2026
- **Pull request:** [#17](https://github.com/cryptoclassdev/sebmontydotlink/pull/17), branch `fix/collector-outbox-rejects`.
- **Status:** Ready for review. The collector part has run on the Mac Mini since 08:04 UTC on 16 November (both jobs restarted); the desk part changes the site's API and goes live on merge.
- **Why:** On 15 November at 17:06 UTC the X monitor queued a long Solana weekly recap whose excerpt was 4,000 characters in Python but 4,003 in JavaScript, which counts each emoji twice. The site answered 400 (excerpt too long). The outbox sends in a fixed order and stopped at the first failure, so the 15 updates queued after it (Solflare Private Mode, Meteora DLMM Pro, Reflect Build and others) waited about 15 hours, and every X check reported "X check failed" because the poll's own send hit the same item. On 16 November at 07:41 UTC Claude trimmed that excerpt on the Mac Mini and the queue emptied within seconds. The same flaw would have stopped stage announcements during the event.

#### What changed
1. **Outbox:** sends oldest first. An update the site rejects as invalid (HTTP 400, 413 or 422) is moved to `outbox-rejected/` with a log line giving the site's reason, and the rest carry on. Network, sign-in and server errors still keep the update for a retry.
2. **Field limits:** every entry is trimmed to the site's limits (title 180, body 10,000, excerpt 4,000 and so on) counted the way JavaScript counts, before it is queued.
3. **Clearer errors:** a rejection from the site now shows the site's own reason (for example "Invalid excerpt"); a failed request names the host and the error type instead of "Provider request failed". Keys and provider bodies are still never logged.
4. **X monitor status:** a problem sending to the site no longer marks the X check as failed; the main loop retries and reports it.
5. **Desk, Broadcast connections:** any YouTube link (`watch?v=`, `/live/`, `youtu.be/`, `/shorts/`, the mobile site) is stored in its `/embed/` form. On 16 November the LP Army `/live/` link Seb pasted was refused, with the error shown at the top of the desk, out of view.
6. **`live.sh`:** `stop` waits until launchd has removed the job, and `start` retries for a few seconds, because `stop x && start x` started nothing on 16 November (launchd was still removing the old job). `start` alone already restarts a running job. Not yet copied to the Mac Mini; to be checked there after the event.
7. **LP Army (optional third job):** `collector/config.breakpoint-lparmy.json` and `bash scripts/mac/live.sh start lparmy` transcribe the LP Army stream (Meteora) from its desk link. It is not in the published schedule, so it runs one fixed session per day (`lparmy-day1`; change `sessionId` to `lparmy-day2` on Tuesday, which also sends day 1's recap to the desk). Announcements publish as Provisional; recaps go to the desk as drafts. Budget $8 a day. Copied to the Mac Mini on 16 November; started only if Seb says so.

#### Files touched
- `breakpoint/collector/collect.py`, `breakpoint/collector/xwatch.py`, `breakpoint/collector/config.breakpoint-lparmy.json` (new), `breakpoint/server/core.mjs`, `breakpoint/scripts/mac/live.sh`
- `breakpoint/tests/test_collector.py`, `breakpoint/tests/test_xwatch.py`, `breakpoint/tests/api.test.mjs`
- `breakpoint/README.md` (troubleshooting row, desk links, restart), `README.md`

#### How to check it
On the Vercel preview: open the desk, paste `https://www.youtube.com/live/<VIDEO_ID>` for a stage and save (preview and production share storage, so use the LP Army row with its current video, then check it reads `https://www.youtube.com/embed/<VIDEO_ID>` after a refresh). On the Mac Mini: `bash scripts/mac/live.sh status` shows both jobs running, and Watch live, Source health, "X monitoring" reads "Watching 208 accounts on X".

#### Checks run
- 64 Python tests and 49 Node tests. New tests: a rejected update is set aside while the next one is sent and a 503 keeps the queue; text with emoji is trimmed to the limit in UTF-16 units; an X check still succeeds and reports live when the site cannot be reached; six YouTube link forms become the embed link, and other hosts and paths are still refused. `bash -n` on `live.sh` (launchd itself cannot run here).
- On the Mac Mini after the restart at 08:04 UTC: the first X search published 1 item with an empty outbox.

#### Risks
- An update set aside is not retried automatically. The log line names the file and the reason; it can be fixed and moved back into `outbox/`.

#### Roll back
Revert this PR and restart both jobs with `start`. The outbox format is unchanged; stored embed links stay valid.

### X monitor: search every 10 minutes

- **Date:** 15 November 2026
- **Pull request:** [#16](https://github.com/cryptoclassdev/sebmontydotlink/pull/16), branch `feat/x-monitor-10-min`.
- **Status:** Ready for review. Collector and docs only; the website is unchanged. The new interval applies on the Mac Mini when the X monitor restarts.
- **Why:** Seb asked to search X every 10 minutes instead of every 2 to cut spend. In its first 16 hours the monitor made about 300 searches an hour, counted at a cautious $0.003 each (about $0.90 an hour against its $30 daily cap), so a busy event day could have hit the cap and stopped it. At 10 minutes it makes about 1,600 searches a day instead of about 7,200: counted at about $5 a day, and the real twitterapi.io charge (mostly empty searches at $0.00015 each) falls to well under $1 a day.

#### What changed
1. `pollSeconds` for the X monitor goes from 120 to 600.
2. The site marks a source stale after 3 minutes without a heartbeat. The collector now repeats the X monitor's last status every minute between searches, so Source health keeps showing "Watching 208 accounts on X" instead of "No recent heartbeat".

#### Files touched
- `breakpoint/collector/collect.py`, `breakpoint/collector/config.breakpoint-x.json`
- `breakpoint/tests/test_collector.py`
- `breakpoint/README.md`, `README.md`

#### How to check it
Nothing changes on the Vercel preview. On the Mac Mini, after `bash scripts/mac/live.sh start x`, the log prints one "X: ... new posts" line every 10 minutes, and on the site (Watch live, Source health) "X monitoring" stays on "Watching 208 accounts on X" with a green dot between searches.

#### Checks run
- 61 Python tests and 48 Node tests. New test: the last status is repeated after 60 seconds and not before, a failed send does not cause a burst of retries, and the X config polls every 600 seconds.

#### Risks
- A post can take up to 10 minutes to reach the site (it was up to 2). Stage announcements are not affected; they come through live transcription within 1 to 2 minutes.
- Paging is unchanged at 3 pages (60 posts) per batch of accounts per search. If more than 60 original posts from one batch land within 10 minutes, the oldest are missed; unlikely with replies and reposts excluded.

#### Roll back
Set `pollSeconds` back to 120 in `breakpoint/collector/config.breakpoint-x.json` and restart the X monitor (`bash scripts/mac/live.sh stop x`, then `start x`). The repeated heartbeat is harmless at any interval.

### Live transcription of the Breakpoint stages (Mac Mini), one AI provider

- **Date:** 15 November 2026
- **Pull request:** [#15](https://github.com/cryptoclassdev/sebmontydotlink/pull/15), branch `feat/breakpoint-live-transcription`.
- **Status:** Ready for review. Collector, scripts and docs only; the website is unchanged. The collector runs on the Mac Mini, so Monday does not depend on the merge.
- **Why:** Seb chose to transcribe the official YouTube stage streams on the Mac Mini (YouTube blocks datacenter IPs) and publish announcements and per-talk recaps live, with one Anthropic key instead of Z.ai and OpenAI.

#### What changed
1. **YouTube audio:** each stage reads its embed link from the desk (or a test URL), resolves audio with yt-dlp before every ffmpeg start, never logs signed URLs, re-resolves after 4 hours at a session boundary and backs off on errors (15 s, 30 s, 60 s, then 2 minutes). Replays of recorded talks (`simulateLive`) play at real speed and stop after their recap.
2. **Local transcription:** mlx-whisper large-v3-turbo with a per-talk glossary; silence, Whisper hallucinations, repetition loops and prompt echoes are dropped; common name misspellings are fixed. Z.ai and OpenAI speech remain options.
3. **Sessions from the schedule:** the current talk per stage comes from `/api/bootstrap` in Europe/London time, with per-stage offsets that apply without a restart; idle between talks, disconnected over long gaps.
4. **Model provider switch:** Anthropic (Sonnet 5.5 for stages, Haiku 5.5 as fallback and for the X monitor), Z.ai or OpenAI; one retry then the fallback on timeout, 429 or 5xx; reservations settled to real cost; `costs.csv`. Claude 5.5 specifics: no `temperature`; Haiku answers through a forced tool call, Sonnet (which rejects forcing) through `tool_choice` auto with a strict schema and minimal thinking; any model that rejects forcing is switched automatically. Provider error reasons are shown, never keys.
5. **Bug fixes from the old collector:** the same claim could be published up to four times (overlapping windows): checks now see only new speech plus context, get the talk's already-covered titles and are deduplicated locally. One bad model answer used to retry the same paid call every 15 s and stop that stage's audio: invalid items are now dropped one by one, failed jobs are parked in `failed-jobs/`, and model calls run on their own thread per stage.
6. **Publishing:** announcements and recaps as Provisional ("<Stage> · live transcript (auto)"), discussion notes as desk drafts, raw transcripts to the desk.
7. **Testing tools:** `--dry-run`, `scripts/rehearsal.mjs` (the real API with in-memory storage and the built page on 127.0.0.1:4317), `scripts/mac/rehearsal.sh` (named runs, auto-restart after a crash), `scripts/mac/setup.sh` (uv's Python 3.12, since Homebrew's cannot load pyexpat on macOS 26), `scripts/mac/live.sh` (launchd start, stop, status, logs and a dry-run check for both jobs).
8. **X monitor:** sorts posts with Claude Haiku 5.5 (`xTriageProvider: "anthropic"`) using the same Anthropic key; the OpenAI-compatible path (GLM) still works.

#### Files touched
- `breakpoint/collector/collect.py`, `live.py` (new), `xwatch.py`, `run.py`, `setup.py`, `config.breakpoint-stages.json` (new), `config.rehearsal.json` (new), `config.breakpoint-x.json`
- `breakpoint/scripts/rehearsal.mjs` (new), `breakpoint/scripts/mac/setup.sh`, `rehearsal.sh`, `live.sh` (new)
- `breakpoint/tests/test_live.py` (new), `test_collector.py`, `test_xwatch.py`
- `breakpoint/README.md`, `README.md`, `.gitignore`

#### How to check it
Nothing changes on the Vercel preview. On the Mac Mini: `bash scripts/mac/live.sh check stages` reads the live schedule and desk links and posts nothing; before the links are pasted both stages say "Waiting for the stream link on the desk".

#### Checks run
- 60 Python tests (on Python 3.13, 3.9 and the Mac Mini copy) and 48 Node tests. New tests cover the session picker (before, inside and after a talk, overlaps, offsets, lunch gap, London time), embed and page URL parsing, excerpt normalising, title dedupe, junk and loop filters, name fixes, provider parsers, forced and auto tool calls, fallback, failed-job parking, the replay end, config reload and `--dry-run`.
- On the Mac Mini (M4, macOS 26.2): 30-second chunks transcribe in about 2 s. Replay of the Breakpoint 2025 Jupiter keynote: Sonnet found 11 announcements with exact quotes, no duplicates and a correct recap for $0.11; Haiku found 10 for $0.006 but lost one item and the recap to misquotes. One-hour soak on two live streams (a SpaceX news stream and a Fortnite stream) through the local rehearsal site: 256 chunks at a median 1.8 s each; 127 Sonnet checks for $0.37 (about $0.18 per stage-hour) with no false announcements on non-Solana talk; after a 60-second Wi-Fi cut the dropped stream reconnected by itself within 8 s; after `kill -9` the collector restarted in 5 s, recovered the unfinished chunk on each stage and was transcribing again within 30 s; no duplicates, no failed jobs, empty outbox; peak memory steady at about 1.76 GB for the whole hour. Speech to page: 13 s median and 44 s at most after the chunk holding the announcement ends, plus up to about 35 s of site cache and page refresh.

#### Risks
- The model can misjudge. Every published item is Provisional, quotes the speech exactly and links to the stream; withdraw it from the desk, or drop `announcement` from `publishKinds` to send everything to the desk.
- YouTube can flag the Mac Mini's IP ("confirm you're not a bot"); the backoff keeps retrying without hammering. Schedule drift is handled by offsets or by switching to desk-assigned sessions.

#### Roll back
`bash scripts/mac/live.sh stop stages` stops transcription at once; published items can be withdrawn from the desk. To undo the code, revert this PR (the X monitor would go back to Z.ai GLM).

### X monitor: sort posts with Z.ai GLM 5.2

- **Date:** 14 November 2026
- **Pull request:** [#14](https://github.com/cryptoclassdev/sebmontydotlink/pull/14), branch `feat/breakpoint-x-glm`.
- **Status:** Ready for review. Only the collector on the Mac Mini changes; the website is unaffected.
- **Why:** Seb has a Z.ai GLM key, not an OpenAI key. The X monitor's AI step was hard-wired to OpenAI.

#### What changed
1. The AI step now calls any OpenAI-compatible chat endpoint set in the config: `xTriageApiUrl`, `xTriageModel`, `xTriageKeyEnv` and optional `xTriageExtraBody`. `config.breakpoint-x.json` uses Z.ai's API with `glm-5.2` and thinking turned off for speed.
2. If the provider rejects an optional field (HTTP 400), the call is retried once without it, so a model that does not accept "thinking off" still works.
3. Replies wrapped in code fences are read correctly; anything that is not JSON is still rejected.
4. Key setup asks for the Z.ai API key (stored as `ZAI_API_KEY`, the same name the planned live-transcription process uses for its GLM fallback, so the key is entered once) instead of an OpenAI key. It must be a pay-as-you-go key; the GLM Coding Plan quota does not cover this use. The `--check-x` dry run names the model and, if the AI call fails, says so.
5. The per-call budget reservation rises from $0.01 to $0.02 to match GLM 5.2's prices; the $30 daily cap is unchanged.

#### Files touched
- `breakpoint/collector/xwatch.py`, `collect.py`, `run.py`, `setup.py`, `config.breakpoint-x.json`
- `breakpoint/tests/test_xwatch.py`, `breakpoint/README.md`, `README.md`

#### How to check it
Nothing changes on the site. On the Mac Mini after updating: `python3 collector/run.py --config collector/config.breakpoint-x.json --check-x` ends with "AI triage OK (glm-5.2)".

#### Checks run
- 27 Python tests (4 new: GLM-style endpoint with extra fields and fenced JSON, retry without rejected fields, non-JSON rejected, shipped config) on Python 3.13 and on Python 3.9 (the version macOS ships); 48 Node tests unchanged and passing.

#### Risks
- Z.ai's handling of `thinking` for `glm-5.2` is not confirmed without a key; the retry covers a rejection, and the dry run shows any other error before anything is published.

#### Roll back
Revert this PR, or point `xTriageApiUrl`, `xTriageModel` and the key back to OpenAI in the config.

### X monitor for Breakpoint alpha

- **Date:** 14 November 2026
- **Pull request:** [#13](https://github.com/cryptoclassdev/sebmontydotlink/pull/13), branch `feat/breakpoint-x-monitor`.
- **Status:** Ready for review. Goes live only once the Mac Mini runs the monitor and `BREAKPOINT_AUTO_PUBLISH_PROVISIONAL` is `true` on Vercel; merging alone changes almost nothing on the site.
- **Why:** Seb decided against live transcription. Instead the guide embeds the official YouTube streams and tracks what every company and speaker with a talk posts on X, so real announcements reach the site within minutes.

#### What changed
1. A new X monitor in the collector (`breakpoint/collector/xwatch.py`). Every 2 minutes it searches X through twitterapi.io for new posts from 208 accounts, skipping replies and retweets. A small OpenAI model sorts each post: alpha (launch, partnership, token news, funding, approval, milestone) is published as Provisional, quoting the post word for word with a link; maybe goes to the editor desk as a draft; routine posts are dropped.
2. Posts are tied to the account's talk when posted within 24 hours of it, and to a project when the account or the post names one, so they show on the talk and the project as well as the overview and Catch up.
3. The account list (`breakpoint/data/x-accounts.json`): 121 speaker accounts linked on the official Breakpoint speakers page (saved in `breakpoint/research/speakers-x-2026-11-14.json`) and 87 company accounts, each linked from the company's own website or checked on its X profile. Guesses that led to the wrong account were left out.
4. Spending limits: every paid request is reserved against a daily cap before it is made ($30 a day, worst case); expected real spend is about $1 to $3 a day. Posts are only marked done after their result is queued for the site, so a failed AI call retries instead of losing posts.
5. Site: announcements that came from X are labelled "ANNOUNCEMENT · VIA X", and the Catch up "From X" filter now includes them.
6. Key setup asks for the twitterapi.io key (instead of an X API token) alongside the ingest token, editor token and OpenAI key, in masked windows. A `--check-x` test run reports what it finds and publishes nothing.
7. The guide's operating notes (`breakpoint/README.md`) describe the Mac Mini setup step by step.

#### Files touched
- `breakpoint/collector/xwatch.py` (new), `breakpoint/collector/config.breakpoint-x.json` (new), `breakpoint/collector/collect.py`, `run.py`, `setup.py`
- `breakpoint/data/x-accounts.json` (new), `breakpoint/research/speakers-x-2026-11-14.json` (new)
- `breakpoint/src/main.tsx`, `public/breakpoint/` (rebuilt)
- `breakpoint/tests/test_xwatch.py` (new), `breakpoint/tests/api.test.mjs`
- `breakpoint/README.md`, `README.md`

#### How to check it on the Vercel preview
1. The site looks the same as now; there is nothing new to see until the monitor runs.
2. `/breakpoint#catchup`, "From X" filter: still works (shows nothing yet).
3. After the merge and the Mac Mini setup: Watch live, Source health shows "X monitoring · Watching 208 accounts on X", and new items appear on the overview within a few minutes of a qualifying post.

#### Checks run
- 14 new Python tests for the monitor (account file and query sizes, alpha/maybe/skip handling, strangers, replies and retweets ignored, no duplicates across passes, search window and overlap, page limit, failed AI calls keep posts for retry, AI output validation, budget gate, talk window) plus the 9 existing collector tests; 48 Node tests including a new one proving X entries are accepted from the collector, public only with `AUTO_PUBLISH_PROVISIONAL`, and keep their talk link.
- `tsc --noEmit` for the guide; site `tsc --noEmit` and `pnpm build`.

#### Risks
- The AI can misjudge a post. Every published item is labelled Provisional, quotes the post exactly and links to it; Seb can withdraw it from the desk, or set `publishProvisional` to `false` to send everything to the desk first.
- twitterapi.io is a third-party service, not X itself. If it fails, the monitor reports an error in Source health and retries; the rest of the site is unaffected.
- A company may post from an account not on the list; it can be added to `data/x-accounts.json` with its source.

#### Roll back
Stop the monitor on the Mac Mini (Ctrl+C) and set `BREAKPOINT_AUTO_PUBLISH_PROVISIONAL` back to `false`. To undo the code, revert this PR; published items can be withdrawn from the desk.

### Live token prices and real project logos on the Breakpoint guide

- **Date:** 13 November 2026
- **Pull request:** [#12](https://github.com/cryptoclassdev/sebmontydotlink/pull/12), branch `feat/breakpoint-token-prices`.
- **Status:** Ready for review. Works without any new setting; an optional free Jupiter key raises the rate limit.
- **Why:** Seb asked for live token prices (the plan had a market slot that was never built) and for the real project logos in place of the placeholder letters and drawings.

#### What changed
1. The guide shows live prices for the five Breakpoint projects with a token: KMNO, JUP, MET, JTO and SOL. Each shows the USD price and 24h change, from Jupiter's Price API, refreshed about every 30 seconds.
2. Where prices appear: a new "Token prices" panel on the overview, the three project cards on the overview, every card on the Projects page, and the project briefing (which also shows the mint address with links to its verified source and Solscan). The Watch live page's source status gains a "Token prices" row.
3. Each mint address was checked against the project's own source before being added to the programme data: Jupiter's token docs (JUP), Jito's launch post (JTO), Meteora's tokenomics page (MET), Kamino's app (KMNO), and SOL's native mint as used in Jupiter's own price example. Projects without a verified mint get no price.
4. Honest failure states: if Jupiter stops answering, the last prices stay for up to 10 minutes marked "Last prices", then the prices disappear instead of showing old numbers. Prices being live never counts as stage coverage being live (the Watch live dot and the overview coverage line still only react to stages and X).
5. The Projects page notice that said "Market prices are not connected yet" now states the price source and time, and that prices are context, not a trading signal.
6. All nine projects show their logo instead of a placeholder letter or drawing: Kamino, Jupiter, Meteora, Jito, Solana, Backpack, Helius, Sunrise and Ledger. Each logo is the profile picture on the project's official, verified X account (accounts confirmed from the project's own website where it links one; listed in `breakpoint/assets/logos/SOURCES.md`). They are stored with the guide as 96 px WebP files (under 7 KB in total), so no outside image host is involved.
7. Backpack, Helius, Sunrise (sunrise.xyz, Wormhole Labs' asset gateway) and Ledger now link to their official websites in the project briefing.

#### Files touched
- `breakpoint/server/prices.mjs` (new): Jupiter fetch, validation, 30 s cache, stale handling, market status
- `breakpoint/server/api.mjs`: `/api/live` carries `prices` and a real `market` status
- `app/breakpoint/api/[...path]/route.ts`: passes `JUPITER_API_KEY` (optional) to the price loader
- `breakpoint/data/seed.json`: `mintAddress` and `mintSourceUrl` for the five projects; websites for the other four; Kamino's note updated
- `breakpoint/src/main.tsx`, `breakpoint/src/seb.css`: price panel, price tags, mint line, status row, logo marks
- `breakpoint/assets/logos/` (new): nine logos and `SOURCES.md`; `breakpoint/scripts/build.mjs` copies them to `public/breakpoint/logos/`
- `public/breakpoint/` (rebuilt), `breakpoint/tests/prices.test.mjs` (new), `breakpoint/README.md`, `.env.example`, `README.md`

#### How to check it on the Vercel preview
1. `/breakpoint`: the right column has a "Token prices" panel with five rows and a line saying when Jupiter last updated them. The three project cards under "Projects to keep in view" show a price.
2. `/breakpoint#projects`: Kamino, Jupiter, Meteora, Jito and Solana cards show price and 24h change; Backpack, Helius, Sunrise and Ledger show none.
3. Open Kamino: price beside $KMNO, "Mint KMNo…o9sS" with "Verified source" and "Solscan" links.
4. `/breakpoint#watch`: Source health lists "Token prices · Jupiter prices for 5 tokens" with a green dot; the stage rows still say "Awaiting connection".
5. `/breakpoint/api/live`: `prices.source` is `jupiter` and `health.market.state` is `live`.
6. Logos: every card on `/breakpoint#projects` shows the same picture as the project's X profile (Jito is the green "Jito" wordmark, Helius is orange on black, Ledger is white on black), also in dark mode, in the sidebar after following a project, and in the Token prices panel.

#### Checks run
- Guide: 47 Node tests (7 new for prices: target selection, validation, caching, user agent and key header, stale then empty on failure, market status, `/api/live` output) and 9 collector tests, all passing. `tsc --noEmit` for the guide.
- Site: `tsc --noEmit` and `pnpm build` pass.
- Production build run locally against the real Jupiter API: all five prices returned; screenshots at 1440 px and 390 px of the overview panel, project cards, Projects page, project briefing and source status, plus the logos in light mode, dark mode and the sidebar. No broken images and no console errors.

#### Risks
- Jupiter's keyless access has a low rate limit shared by IP address. Requests are cached (30 s in the function, 15 s at the CDN), so the site makes a few calls a minute. If it is ever rate-limited, the prices go stale and then disappear; the rest of the page is unaffected. Adding a free `JUPITER_API_KEY` in Vercel removes this risk.
- Prices are for context. The page states the source and time and does not present them as signals.

- The logos are third-party trademarks, used only to identify each project next to its own name.

#### Roll back
Revert this PR. The guide returns to "Market prices are not connected yet" and the placeholder marks; nothing else depends on these files.

### Breakpoint London 2026 guide at /breakpoint

- **Date:** 13 November 2026
- **Pull request:** [#11](https://github.com/cryptoclassdev/sebmontydotlink/pull/11), branch `feat/breakpoint-guide`.
- **Status:** Merged on 13 November 2026. Live at www.sebmonty.link/breakpoint, with Upstash Redis, the editor token and the ingest token set up on Vercel.

#### What changed
1. New page at sebmonty.link/breakpoint: one place for everything at Solana Breakpoint 2026 in London. Overview with a live "Now and next" strip, the full two-stage programme (111 talks, 149 speakers, 13 tracks), the London side-events guide with a map, stage livestream slots, a Catch up feed, project watchlists and an LP Army page. Branded Seb Monty with the "Powered by validator.com" line.
2. Side events now come live from the official Breakpoint community calendar on Luma (122 listings for 2026, up from 13 in the first build), refreshed every 10 minutes, grouped by day, with search, a Free filter, availability filter and past events hidden by default. Only venues Luma shows publicly go on the map; guests-only addresses never do. If Luma is down, the page shows a committed snapshot and says so.
3. The app was first built for Cloudflare Workers. It now runs inside this Next.js site: the page is a self-contained static app in `public/breakpoint/`, the API is a Next route at `/breakpoint/api/*`, and storage for the editorial desk moved from Cloudflare R2 to Upstash Redis (connected through Vercel). Public API responses are cached at the edge (15 s live, 5 min programme) so visitors polling every 20 s do not each hit storage.
4. Fixed agenda formatting errors: "Luke Truitt - Formation" and "Irene Tse - Graticule Asset Management Asia" split into name and organisation, double spaces in two names, a stray quote mark in a Bitwise talk title, "Payward" listed as a person, and role/organisation swaps for five speakers.
5. The collector (stage audio transcription and X monitoring, Python) now points at www.sebmonty.link/breakpoint; it stays off until sources, keys and budget are set.
6. Programme refreshed against the official agenda on 13 November: 4 new talks (Cloudflare micropayments; London Calling with the Deputy Mayor of London; Superstate; a closing fireside with Michael Lewis), 11 retitled talks, 5 speaker changes, and the agenda's 13 topic tracks (filterable on the Schedule page). Talk links survive renames.
7. "Now and next" strip on the overview: what is on each stage right now (or the break/lunch), what is next, and how many side events are on at this moment. Before the conference it shows the first talk; after each day it shows the next morning's opener. Worked out in the browser from the programme, so it costs nothing to run. Add `?now=2026-11-16T14:05:00Z` to any preview URL to see it at a given moment.
8. Side events now load live from Luma on Vercel. The first preview fell back to the saved snapshot because Luma rate-limits requests that use Node's default user agent ("node"), which every server on Vercel's network shares. The API now names itself to Luma (`sebmonty.link Breakpoint guide`, with a link to the page): the same request returned 429 three times out of three with the default and 200 three times out of three with the name. `/breakpoint/api/health` now reports which events source is in use (`luma`, `snapshot` or `seed`), how many events, and why a refresh failed.
9. Editor and collector tokens ignore spaces and line breaks around them, on the login form and in the Vercel variable. A token copied from Terminal with a trailing space or newline was rejected as "Editor or collector authentication required".

#### Files touched
- `breakpoint/` (new): page source, server logic, data, collector, scripts, tests, `README.md`
- `public/breakpoint/` (new, built output): `index.html`, `app.js`, `style.css`, `icon.svg`
- `app/breakpoint/api/[...path]/route.ts` (new)
- `next.config.mjs`: rewrite `/breakpoint` to the static page; security headers (CSP) for the guide's page and assets
- `app/globals.css`: two `@source not` lines so the site's Tailwind build ignores the guide's files (checked: no guide classes in the site CSS)
- `tsconfig.json`: exclude `breakpoint/` from the site typecheck (the guide has its own)
- `.gitignore`, `.vercelignore`, `.env.example`, `README.md` (this entry and a row in "Where things live")

#### How to check it on the Vercel preview
1. Open `/breakpoint` on the preview. The overview loads with "122 side events" (or more) in the hero.
2. London guide: day chips from Mon 9 to Wed 18, map pins only for public venues, search "padel" or a host name, open an event and use Add to calendar.
3. Schedule: 111 sessions on Mon 16 and Tue 17; pick "The AI Stack" in the track filter (10 talks); open a session and a speaker. Then open `/breakpoint?now=2026-11-16T14:05:00Z`: the Now and next strip shows the UK debate on Main Stage and "Star" on Royal Exchange.
4. Phone width: bottom tab bar, avatar top left, map drags.
5. `/breakpoint/api/live` returns JSON with `storage: "ready"`.
6. `/breakpoint/api/health` shows `"events":{"source":"luma", ...}` with `"error":null`. `snapshot` means Luma could not be reached and the error says why.
7. The homepage and blog look unchanged.

#### Before merging (Vercel project settings, about 5 minutes)
1. Storage tab: create an Upstash Redis store (free plan is fine to start) and connect it to this project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. Environment variables: add `BREAKPOINT_EDITOR_TOKEN` and `BREAKPOINT_INGEST_TOKEN`, each a different value from `openssl rand -hex 32`. Keep them in a password manager.
3. Redeploy the preview, then log in at `/breakpoint#editor` with the editor token.

#### Checks run
- Guide: 40 Node tests (API on an in-memory store and on the Upstash adapter, Luma normaliser, caching, user agent, health reporting, token whitespace, base path, and the storage layer against a real `redis-server`) and 9 collector tests, all passing. `tsc --noEmit` for the guide.
- Site: `pnpm typecheck` and `pnpm build` pass.
- Production server run locally: headless Chrome at 1440 px and 390 px across overview, London guide, event dialog and schedule, with no console errors.

#### Risks
- Luma rate-limits heavy callers. The API asks Luma at most every 10 minutes per server instance, under its own user agent, and falls back to the last good copy or the snapshot. If Luma ever rate-limits the named agent too, the page keeps working from the snapshot and `/breakpoint/api/health` shows the reason.
- The page is a separate app with its own stylesheet; it cannot change the rest of the site's styling.
- Upstash usage rises with live coverage during 15 to 17 November; edge caching keeps it to a few reads per minute per region.

#### Roll back
Revert the merge commit. Nothing outside `/breakpoint` depends on these files.

### New avatar on the X card and in the site header

- **Date:** 5 November 2026
- **Pull request:** [#9](https://github.com/cryptoclassdev/sebmontydotlink/pull/9), branch `ui/new-x-avatar`.
- **Status:** Ready for review. Seb approved the before and after screenshots on 5 November 2026.

#### What changed
1. The cartoon avatar next to @SebMontgomery in the homepage "Find me online" card is replaced with the new illustration Seb supplied (the same desk scene, with the new figure on the shelf).
2. The site header logo uses the same file, so it changes too and stays matched with the X card.
3. The supplied image is 1920 × 1920 and shows the whole desk. It is cropped to head and shoulders, the same framing as the old avatar, because the avatar shows at 40 to 64 pixels and the face would be too small in the full scene. It is saved at 400 × 400, the same size as the old file (216 KB, was 282 KB).

#### Files touched
- `public/images/brand/seb-avatar.png` (replaced; same name and size, so no code changes)
- `README.md` (this entry; the #8 entry's status is updated to merged)

#### How to check it on the Vercel preview
1. Open the preview homepage. The "Find me online" card shows the new avatar next to @SebMontgomery.
2. The small logo at the top left of every page (homepage, blog, an article, Skill Files) shows the same new avatar.
3. Check at phone width as well: the avatar is sharp and the face fills the frame.

#### Checks run
- `pnpm build` passes.
- Before and after screenshots of the X card (desktop and phone) and the header logo, compared against the live site; the new avatar loads in both places with no layout change.

#### Risks
- Very low. One image file is swapped under the same name and size, with no code changes.
- Browsers and Vercel's image cache may show the old avatar for a short time after the merge, until their cached copies expire.

#### Roll back
Revert this PR, or restore `public/images/brand/seb-avatar.png` from `main` before the merge.

### New article publisher, two new articles, homepage cleanup and a visual consistency pass

- **Date:** 5 November 2026
- **Pull request:** [#8](https://github.com/cryptoclassdev/sebmontydotlink/pull/8), branch `publisher/markdown-articles`. It also contains the homepage cleanup first opened as [#7](https://github.com/cryptoclassdev/sebmontydotlink/pull/7), which is closed in favour of this PR.
- **Status:** Merged on 5 November 2026 and checked on the live site the same day: every page loads with no broken images or errors at phone, tablet and desktop widths, and the article text matches the approved version. The visual changes were approved by Seb from before and after screenshots, and Seb approved releasing both new articles with this PR.

#### What changed

**A. Article publisher (replaces the one-article setup the Meteora guide used)**
1. Articles are Markdown files in `content/articles/<slug>.md`, with their images in `public/articles/<slug>/`. Publishing a post is now a file plus a pull request, with no code changes. The guide is `docs/publishing.md`.
2. A compiler (`lib/publishing/compile.mjs`) checks every article each time the site builds: required fields, a known category and author, every image present with alt text, safe links, and no unsupported formatting. Any problem stops the build and lists the file, line and fix. The old converter silently dropped anything it did not recognise. `pnpm articles:check` runs the same check by hand.
3. Categories and authors are plain lists in `content/categories.yml` and `content/authors.yml`. New categories: DeFi and Exchanges. Stocks and Solana are unchanged.
4. Agent-readable copies: every Markdown article is also served as plain Markdown at `/blog/<slug>.md`, listed in a new `/llms.txt` index, and linked from its page with a `rel="alternate" type="text/markdown"` tag.
5. An article's `disclosure` field shows in italics after the article, above Sources. Read time counts the article, not the Sources list.
6. Covers wider than 16:9 show uncropped at the top of the article; narrower covers keep the existing 16:9 crop. An optional `cover.position` field picks which part of the cover stays visible on cards (used by both new banners).
7. Drafts (`status: draft`) show on local and preview builds with a "Draft" label and are never built into the live site. Neither new article is a draft.
8. The search page is split into a server page and a client component, so article data stays on the server. It searches Markdown and Sanity posts, and now still shows matching Markdown articles if Sanity can't be reached (before, a Sanity error emptied the whole result list).
9. `AGENTS.md` points coding agents to the publishing guide and states the pull-request rule.

**B. Articles**
1. **The Meteora guide moved to Markdown** (`content/articles/complete-meteora-dlmm-liquidity-course.md`). Its page is unchanged: checked against the live page, it has the same title, description, all 203 lines of body text, all 10 images with their alt text and captions, and all 16 links. The only difference is the byline fix in C5. The old JSON file, its converter and its hand-typed metadata file are deleted (they remain in git history).
2. **"How Binance Absorbed the Biggest Hack in Crypto" is published** (`content/articles/binance-hack-6-3-billion.md`, Exchanges category, dated 5 November 2026). Converted from `binance-hack-6-3-billion-3.0.docx`: the author's pre-publish note at the top is removed and the highlighting is dropped; the body text is unchanged. It has the banner, 7 charts with their captions, 56 sources and the validator.com disclosure. It goes live when this PR merges.
3. **"Papertrade Saga: The Hype, Lock & Exodus" is published** (`content/articles/papertrade-saga.md`, DeFi category, dated 5 November 2026). Converted from `papertrade-final-29Oct.docx`: the full body, the banner, 6 charts with their captions, 20 sources and the disclosure. Its figures are as of 27 to 29 October 2026, as written in the article. It goes live when this PR merges.

**C. Homepage cleanup and visual consistency**
1. Fogees Hub (Co-founder) is removed from the homepage Projects section, and its three images are deleted.
2. Project cards show each mockup in full at its natural 16:9 shape. Before, the validator.com card showed only "ator.com" and the thecommunication.link image cut off the "Seb Monty" header. Two columns on desktop and tablet, one on phones.
3. One page width and side margin everywhere: 1180px wide on desktop, 32px side margins on tablets, 16px on phones. Before, the homepage, blog and Skill Files each used different values, so the page shifted sideways between them.
4. Homepage, Latest research card: "All posts" stays on the heading row on phones instead of dropping onto its own line.
5. Article byline on phones: author on one line, date and read time on the next, with no stray "·" left at a line end.
6. Skill Files on phones: the card stacks (icon and arrow on top, text at full width, dates side by side), and "Back to the hub" lines up with the page edge.
7. Blog on phones: the category row fades at the right edge, and the last category scrolls fully into view.
8. One header on every page: logo and name, Blog, Skill Files and search, with the current section underlined. The name now also shows on phones. The homepage and Skill Files headers are replaced; on the blog, the Home link is replaced by Skill Files (the logo goes home).
9. One footer on every page: name, tagline, Blog, Skill Files, X, YouTube, Telegram, LinkedIn and Email, plus the copyright and "Research, not financial advice." The homepage and Skill Files footers are replaced.
10. The site's colour tokens are now defined site-wide, so the shared header and footer look the same outside the blog.

**D. Packages**
Added: `unified`, `remark-parse`, `remark-gfm` (read Markdown), `yaml` (read the article header), `image-size` (read image dimensions), `mdast-util-to-string`, and `@types/mdast` (development only). Nothing removed or upgraded.

**Not changed in this PR:** the RoboStrategy post still comes from Sanity, and Sanity Studio stays at `/studio`. Moving that post and removing Sanity is the next PR.

#### Why
- July's goal was to replace Sanity with an in-house publisher, but only the Meteora guide used a local file, through a converter hard-wired to that one article. Now any article is a file and a pull request, articles are readable by AI agents, and content can no longer be dropped silently.
- The Binance and Papertrade articles are the next two posts, released together.
- Fogees Hub was asked to be removed, the project images were cropping out the brand names and Seb's name, and the page width, header and footer differed between pages.

#### Files touched
- **New:** `content/articles/` (3 articles), `content/categories.yml`, `content/authors.yml`, `public/articles/binance-hack-6-3-billion/` (banner and 7 charts), `public/articles/papertrade-saga/` (banner and 6 charts), `lib/publishing/compile.mjs`, `lib/publishing/index.ts`, `lib/blog/merge-categories.ts`, `components/blog/SearchClient.tsx`, `app/agent/articles/[slug]/route.ts`, `app/llms.txt/route.ts`, `scripts/articles.mjs`, `docs/publishing.md`.
- **Changed:** `next.config.mjs` (compiles articles on dev and build; `/blog/<slug>.md` rewrite), `app/blog/[slug]/page.tsx` (Markdown articles, disclosure, Markdown alternate link, draft label and noindex, byline groups), `app/blog/search/page.tsx` (now a server page), `app/page.tsx` and `components/bento-grid.tsx` (shared header and footer, Fogees Hub removed, cover position), `app/skill-files/page.tsx` (shared header and footer), `components/site-header.tsx`, `components/site-footer.tsx`, `components/blog/ArticleBody.tsx`, `components/blog/ArticleLightbox.tsx`, `components/blog/PostCard.tsx`, `components/blog/FeaturedPost.tsx`, `components/link-tree.module.css`, `components/link-hub.module.css`, `app/globals.css`, `lib/blog/catalog.ts`, `lib/blog/categories.ts`, `sanity/types.ts`, `package.json`, `pnpm-lock.yaml`, `.gitignore`, `AGENTS.md`, `README.md`.
- **Deleted:** `data/meteora-lp-course-post.json`, `lib/blog/meteora-post.ts`, `lib/blog/meteora-metadata.ts`, `public/fogees-mockup.png`, `public/fogees-icon.png`, `public/fogees-logo.png`.

#### How to check it on the preview
Open the Vercel preview link on this PR (it needs a login to the `webdesign-sebmonty` Vercel team).
1. **Homepage:** the new header and footer, Projects with two full mockups and no Fogees Hub, and "All posts" on the same row as "From the blog" on a phone.
2. **`/blog`:** the Binance article first, then Papertrade and the Meteora guide, and the DeFi and Exchanges filters. On a phone, the category row fades at the right edge.
3. **`/blog/binance-hack-6-3-billion` and `/blog/papertrade-saga`:** the full banner, the charts (7 and 6) that open full screen, the disclosure line in italics, then the collapsed Sources box (56 and 20 links).
4. **`/blog/complete-meteora-dlmm-liquidity-course`:** side by side with the live page, it should match (apart from the tidier byline on phones).
5. **`/blog/binance-hack-6-3-billion.md`, `/blog/papertrade-saga.md`, `/blog/complete-meteora-dlmm-liquidity-course.md` and `/llms.txt`:** plain text for AI agents.
6. **`/skill-files` on a phone:** the stacked skill card and the aligned "Back to the hub".
7. **Any page:** the header and footer are the same everywhere, and the logo stays in the same place when you move between pages.
8. **Search** on `/blog/search` for "binance", "papertrade" and "meteora": each finds its article.

#### Checks run
- `pnpm typecheck` and `pnpm build` pass; the Vercel preview build succeeds.
- Meteora guide: identical to the live page in title, description, body text, images, captions and links; the byline differs only by the removed stray "·".
- Binance and Papertrade: every word of each .docx body appears on the page, with all chart captions and all source links. The Binance author's note does not appear.
- A deliberately broken test article failed the check with every problem listed by line.
- Draft handling was tested while Papertrade was still a draft: a production-mode build (`VERCEL_ENV=production`) left it out. With both articles published, a production-mode build includes all three articles.
- Screenshots of 7 pages at 375px, 768px and 1440px: no sideways scrolling anywhere, and every page uses the same page edges.
- Before and after screenshots of every visual change were reviewed and approved by Seb on 5 November 2026.

#### Risks
- **Medium.** The blog now reads articles through a new code path, and the header and footer change on every page. The checks above cover both.
- A broken article now stops the build, and so stops the deploy. That is intended, and the error lists the fix.
- Both new articles are dated 5 November 2026. If this merges on a later day, update `date:` in both files first.
- Security PR #6 also changes `pnpm-lock.yaml`. Whichever of the two merges second will show a conflict in that file, and the branch needs updating before it can merge.
- Drafts are hidden on the live site through Vercel's `VERCEL_ENV=production`, which Vercel sets automatically on production builds.

#### Roll back
Revert this PR's merge commit on GitHub (the "Revert" button on the merged PR), then merge the revert PR. That restores the previous homepage, header, footer, Meteora files and search page, and removes the two new articles.
