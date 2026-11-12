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

Environment variables are listed in `.env.example`. The site builds without any of them; the MailerLite keys are only needed for the subscribe endpoint, and the Studio variables only for `/studio`.

## Studio (/studio)

The site's own article dashboard: write, schedule and publish articles and moderate comments from the browser, behind a login. Setup, daily use, security and recovery are in [docs/studio.md](docs/studio.md).

```bash
pnpm studio:migrate            # create/update the Studio's database tables (also runs before every build)
pnpm studio:import-articles    # copy content/articles/*.md into the Studio (safe to re-run)
pnpm studio:user list          # account recovery: list | reset-password <email> | make-admin <email>
pnpm studio:generate           # after changing lib/studio/db/schema.ts: write a new migration
```

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
| Studio (article dashboard) | Pages `app/studio/`, components `components/studio/`, logic and database schema `lib/studio/`, API `app/api/studio/`, migrations `drizzle/`, scripts `scripts/studio/`, login gate `proxy.ts` |
| Legacy Sanity content | The RoboStrategy post still comes from Sanity (project `bfn64pgm`) until the blog moves to the Studio; it is not being migrated. Sanity's own Studio has been removed from `/studio` |

## Change log

Newest first. One entry per pull request.

### Studio: the site's own article dashboard at /studio

- **Date:** 12 November 2026
- **Pull request:** [#10](https://github.com/cryptoclassdev/sebmontydotlink/pull/10), branch `studio/core`.
- **Status:** Draft, waiting for Seb to approve the screenshots. Step 1 of 3: this PR adds the Studio only. The next PR switches the public blog to read from it; then the same code is copied to validator.com.

#### What changed
1. **A password-gated dashboard at `/studio`**, built into this site, replacing Sanity's Studio at that address. Articles will be written, scheduled and published there instead of by pull request. It looks and works like Sanity Studio: a post list beside the open document, fields grouped into Content, Details and SEO tabs, autosave, a green Publish button with the save state next to it, and revision history.
2. **Article fields** match the current Markdown articles: title, slug, deck, excerpt, publish date, updated date, category, author, cover image (alt text, caption, crop position), read time (worked out automatically unless set), disclosure, plus a feature flag and SEO fields (search title, meta description, share image, canonical URL, hide from search engines).
3. **Article body editor:** Sanity's open-source Portable Text Editor, storing the body in the same block format the blog already renders (`components/blog/ArticleBody.tsx`): paragraphs, Heading 2 to 4, quotes, bold, italic, inline code, links, bulleted and numbered lists, images with alt text, caption and credit, YouTube videos and code blocks. Pasting from Google Docs keeps headings, lists, links and bold/italic. Word count and read time update as you type.
4. **Publishing:** drafts save automatically and never change the site. Publish checks the post first (title, slug, date, category, author, cover and its alt text, alt text on every image, link formats, the YouTube link) and lists anything missing. A future date schedules the post. Editing a live post shows "Edited" until "Publish changes"; it can be discarded, unpublished or restored from revision history (a snapshot at every publish and every 10 minutes of editing). If two people save the same post, the second save is refused instead of overwriting.
5. **Media library:** images upload straight from the browser to a Vercel Blob store (JPG, PNG, WebP, GIF, AVIF up to 25 MB), with reusable alt text, caption and credit. Images used in a post can't be deleted.
6. **Comment moderation:** a public endpoint (`POST /api/studio/comments`) stores reader comments as "waiting"; the Studio's Comments page (with a count in the top bar) approves, rejects, hides, marks as spam or deletes them. The blog's comment form and the display of approved comments come with the next PR.
7. **Categories and authors** are editable in the Studio. On first setup they are copied from `content/categories.yml` and `content/authors.yml`.
8. **Logins:** one account per person, email and password, created by an admin on the Team page (there is no sign-up). Roles: admin (manages the team) and editor (everything else). The first admin is created once at `/studio/setup` with a one-time code. Each person can change their own password; admins can set a new one, which signs that person out everywhere.
9. **Importing the three Markdown articles:** `pnpm studio:import-articles` copies them (with their images) into the Studio. The RoboStrategy post is not imported, as agreed.
10. **Database:** Postgres (Neon). Tables are prefixed `studio_` and created by migrations in `drizzle/`, which `pnpm build` now applies before building (skipped when `DATABASE_URL` isn't set, so builds work before the database exists).

#### Why
Seb asked for an in-house replacement for Sanity: a dashboard at sebmonty.link/studio where every new article is posted directly, not through a PR, with three logins (Seb, Chris, Bruno) and comment moderation. validator.com gets its own separate copy later. Research and the options compared: the project doc `claude/blog-studio-research.md`.

#### Files touched
- New: `app/studio/` (pages: login, setup, posts, media, comments, categories, authors, team, account; `actions.ts`; `studio.css`), `components/studio/` (post editor, body editor, media picker and library, dialogs, top bar, team, comments, categories and authors), `lib/studio/` (database schema and client, sign-in, posts, media, comments, categories/authors, users, document rules), `app/api/studio/` (sign-in, upload tokens, public comments), `drizzle/` (first migration) and `drizzle.config.ts`, `scripts/studio/` (migrate, import articles, account recovery), `proxy.ts` (sends anyone without a Studio session to the login page), `docs/studio.md`.
- Removed: `app/studio/[[...tool]]/` (the embedded Sanity Studio).
- Changed: `package.json` and `pnpm-lock.yaml` (new packages: `better-auth`, `drizzle-orm`, `pg`, `@vercel/blob`, `@portabletext/editor`, `server-only`, and `drizzle-kit`/`@types/pg` for development; React and React DOM 19.2.0 → 19.2.9, which the editor requires; `build` runs `studio:migrate` first; new `studio:*` scripts), `.env.example` (Studio variables), `.gitignore` (local upload folder), `README.md` (this entry, a Studio section, Where things live; #9's status set to merged), `AGENTS.md` (Studio section).
- Not touched: every public page, the blog, the Markdown publisher and the articles.

#### Before this can be used (Vercel setup, once)
The full steps are in `docs/studio.md` → "One-time setup on Vercel". In short, a team owner connects a **Neon database** and a **Blob store** to the project (Production and Preview), and sets `BETTER_AUTH_SECRET`, `STUDIO_SETUP_TOKEN` and (Production) `BETTER_AUTH_URL`. Without them the site works exactly as now and `/studio` shows "The Studio isn't connected yet".

#### How to check it on the Vercel preview
1. Public pages are unchanged: homepage, `/blog`, an article, `/blog/papertrade-saga.md`, `/llms.txt`, Skill Files.
2. Open `/studio`. Without the database it shows "The Studio isn't connected yet" and names the missing settings. With the database and secrets connected to Preview: it opens "Create the admin account"; a wrong setup code is refused; create the admin, sign in (a wrong password is refused).
3. Posts → New post: type a title, press "From title", write a paragraph with bold and a link, a Heading 2, a list, insert an image (upload one), a YouTube link and a code block. "Saved just now" appears at the bottom. Press Publish: it lists what's missing (category, cover image). Add them, publish, and the badge turns "Published". Change the deck: the badge says "Edited" and the button "Publish changes". ⋯ → Revision history lists the snapshots.
4. Team → Add person (Chris, Bruno); Comments, Media, Categories, Authors pages open; the account menu signs out, after which every `/studio` page goes back to the login.
5. At phone width the post list and the editor each take the full screen, with a back arrow.

#### Checks run
- `pnpm typecheck` and `pnpm build` pass. Without `DATABASE_URL` the build skips migrations and the production server returns 200 for `/`, `/blog`, `/blog/papertrade-saga`, `/blog/papertrade-saga.md`, `/llms.txt` and `/skill-files`; `/studio` shows the "not connected" page and the comment endpoint answers "not available yet".
- With a local Postgres: migrations create the tables and copy 4 categories and 1 author; `pnpm studio:import-articles` imports the 3 articles (169, 104 and 124 blocks with their images) and a second run skips all three.
- Browser test of a production build (Playwright, Chrome, 1440 px and 390 px), every step of "How to check" above, plus: the comment endpoint returns 201, then approve and spam both work; media upload and alt-text edit; a pasted HTML snippet keeps its heading, bold, italic, link and both list types; edits survive a reload; no horizontal scrolling at 390 px; no console errors other than the deliberate wrong-password 401.
- Security checks against the production build: the 9th wrong sign-in from one address within 5 minutes returns 429; the sign-up endpoint answers `EMAIL_PASSWORD_SIGN_UP_DISABLED`; upload tokens are refused without a session; signed-out requests to any `/studio` page redirect to the login.

#### Risks
- **Build now touches the database:** when `DATABASE_URL` is set, `pnpm build` applies migrations first, and a build fails if the database can't be reached. Migrations only add `studio_` tables.
- **Sanity Studio is gone from `/studio`:** the RoboStrategy post can no longer be edited (it still shows on the blog until the next PR, which removes it as agreed).
- **New dependencies** for sign-in, the database, uploads and the editor, and a React patch update (19.2.0 → 19.2.9) that the editor needs; the whole site was rebuilt and checked.
- **Previews share data only if told to:** connect Neon with a branch per preview so preview testing never writes to the live database.

#### Roll back
Revert this PR's merge commit. The public site never depended on the Studio, so nothing else changes. The `studio_` tables and the Blob store can stay (unused) or be deleted in Vercel/Neon.

### New avatar on the X card and in the site header

- **Date:** 5 November 2026
- **Pull request:** [#9](https://github.com/cryptoclassdev/sebmontydotlink/pull/9), branch `ui/new-x-avatar`.
- **Status:** Merged by Seb on 5 November 2026 (merge commit `eacbea3`) and checked on the live site. Seb approved the before and after screenshots on 5 November 2026.

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
