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

### Breakpoint London 2026 guide at /breakpoint

- **Date:** 13 November 2026
- **Pull request:** [#11](https://github.com/cryptoclassdev/sebmontydotlink/pull/11), branch `feat/breakpoint-guide`.
- **Status:** Ready for review. Upstash Redis, the editor token and the ingest token are set up on Vercel (13 November); storage reads `ready` on the preview.

#### What changed
1. New page at sebmonty.link/breakpoint: one place for everything at Solana Breakpoint 2026 in London. Overview with a live "Now and next" strip, the full two-stage programme (111 talks, 149 speakers, 13 tracks), the London side-events guide with a map, stage livestream slots, a Catch up feed, project watchlists and an LP Army page. Branded Seb Monty with the "Powered by validator.com" line.
2. Side events now come live from the official Breakpoint community calendar on Luma (122 listings for 2026, up from 13 in the first build), refreshed every 10 minutes, grouped by day, with search, a Free filter, availability filter and past events hidden by default. Only venues Luma shows publicly go on the map; guests-only addresses never do. If Luma is down, the page shows a committed snapshot and says so.
3. The app was first built for Cloudflare Workers. It now runs inside this Next.js site: the page is a self-contained static app in `public/breakpoint/`, the API is a Next route at `/breakpoint/api/*`, and storage for the editorial desk moved from Cloudflare R2 to Upstash Redis (connected through Vercel). Public API responses are cached at the edge (15 s live, 5 min programme) so visitors polling every 20 s do not each hit storage.
4. Fixed agenda formatting errors: "Luke Truitt - Formation" and "Irene Tse - Graticule Asset Management Asia" split into name and organisation, double spaces in two names, a stray quote mark in a Bitwise talk title, "Payward" listed as a person, and role/organisation swaps for five speakers.
5. The collector (stage audio transcription and X monitoring, Python) now points at www.sebmonty.link/breakpoint; it stays off until sources, keys and budget are set.
6. Programme refreshed against the official agenda on 13 November: 4 new talks (Cloudflare micropayments; London Calling with the Deputy Mayor of London; Superstate; a closing fireside with Michael Lewis), 11 retitled talks, 5 speaker changes, and the agenda's 13 topic tracks (filterable on the Schedule page). Talk links survive renames.
7. "Now and next" strip on the overview: what is on each stage right now (or the break/lunch), what is next, and how many side events are on at this moment. Before the conference it shows the first talk; after each day it shows the next morning's opener. Worked out in the browser from the programme, so it costs nothing to run. Add `?now=2026-11-16T14:05:00Z` to any preview URL to see it at a given moment.
8. Side events now load live from Luma on Vercel. The first preview fell back to the saved snapshot because Luma rate-limits requests that use Node's default user agent ("node"), which every server on Vercel's network shares. The API now names itself to Luma (`sebmonty.link Breakpoint guide`, with a link to the page): the same request returned 429 three times out of three with the default and 200 three times out of three with the name. `/breakpoint/api/health` now reports which events source is in use (`luma`, `snapshot` or `seed`), how many events, and why a refresh failed.

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
- Guide: 39 Node tests (API on an in-memory store and on the Upstash adapter, Luma normaliser, caching, user agent, health reporting, base path, and the storage layer against a real `redis-server`) and 9 collector tests, all passing. `tsc --noEmit` for the guide.
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
