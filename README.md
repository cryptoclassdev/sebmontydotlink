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
| Homepage content (hero, socials, referral links, projects, footer) | `components/bento-grid.tsx` |
| Homepage styles | `components/link-tree.module.css` |
| Skill Files page and its styles | `app/skill-files/page.tsx`, `components/link-hub.module.css` |
| Blog pages | `app/blog/` |
| Blog header, footer and article components | `components/site-header.tsx`, `components/site-footer.tsx`, `components/blog/` |
| Blog and article styles | `app/globals.css` |
| Agent-readable copies | `/blog/<slug>.md` (`app/agent/articles/[slug]/route.ts`), `/llms.txt` (`app/llms.txt/route.ts`) |
| Legacy Sanity content | The RoboStrategy post still comes from Sanity (project `bfn64pgm`, Studio at `/studio`) until it is migrated |

## Change log

Newest first. One entry per pull request.

### Markdown article publisher: Meteora guide migrated, Papertrade article added as a draft

- **Date:** 5 November 2026
- **Pull request:** [#8](https://github.com/cryptoclassdev/sebmontydotlink/pull/8), branch `publisher/markdown-articles`
- **Status:** Draft

**What changed**
1. **New article publisher.** Articles are now Markdown files in `content/articles/`, with images in `public/articles/<slug>/`. A compiler (`lib/publishing/compile.mjs`) checks every article each time the site builds: required fields, a known category and author, every image present with alt text, safe links, and no unsupported formatting. Any problem stops the build with the file, line and fix. The old converter silently dropped anything it did not recognise.
2. **The Meteora guide moved to Markdown** (`content/articles/complete-meteora-dlmm-liquidity-course.md`). Its page is unchanged: checked against the live page, it has the same title, description, header, all 203 lines of body text, all 10 images with their alt text and captions, and all 16 links. The one-off JSON file, its converter and its hand-typed metadata file are deleted (they remain in git history).
3. **Categories and authors are plain lists** in `content/categories.yml` and `content/authors.yml`. A new DeFi category is added; Stocks and Solana are unchanged.
4. **"Papertrade Saga: The Hype, Lock & Exodus" is added as a draft** (`status: draft`). Drafts show on preview links with a "Draft" label and do not appear on the live site after this PR merges. It was converted from `papertrade-final-29Oct.docx`: every word of the body, the banner, 6 charts with their captions, 20 sources and the disclosure.
5. **Agent-readable copies.** Every Markdown article is also served as plain Markdown at `/blog/<slug>.md`, listed in a new `/llms.txt` index, and linked from its page with a `rel="alternate" type="text/markdown"` tag.
6. **Disclosure line.** An article's `disclosure` field shows in italics after the article, above Sources.
7. **Wide covers.** Covers wider than 16:9 (like the Papertrade banner) now show uncropped at the top of the article; narrower covers keep the existing 16:9 crop. An optional `cover.position` field picks which part of the cover stays visible on cards.
8. **Search page.** Split into a server page and a client component so article data is loaded on the server, not shipped to the browser. Search still covers both Markdown and Sanity posts, and now still shows matching Markdown articles if Sanity can't be reached (before, a Sanity error emptied the whole result list).
9. **Docs.** `docs/publishing.md` explains how to write, check and publish an article. `AGENTS.md` now points coding agents to it and states the PR rule. New command: `pnpm articles:check`.
10. **New packages:** `unified`, `remark-parse`, `remark-gfm` (read Markdown), `yaml` (read the article header), `image-size` (read image dimensions), `mdast-util-to-string`, and `@types/mdast` (development only).

**Not changed in this PR:** the RoboStrategy post still comes from Sanity, and Sanity Studio stays at `/studio`. Moving that post and removing Sanity is the next PR. The homepage is unchanged apart from honouring `cover.position` on its latest-post card.

**Why**
The goal set in July was to replace Sanity with an in-house publisher. Until now only one article (Meteora) used a local file, through a converter hard-wired to that article. Now publishing a post is a file plus a pull request with no code changes, articles are readable by AI agents, and content can no longer be dropped silently.

**Files touched**
- New: `content/articles/complete-meteora-dlmm-liquidity-course.md`, `content/articles/papertrade-saga.md`, `content/categories.yml`, `content/authors.yml`, `public/articles/papertrade-saga/` (banner and 6 charts), `lib/publishing/compile.mjs`, `lib/publishing/index.ts`, `lib/blog/merge-categories.ts`, `app/agent/articles/[slug]/route.ts`, `app/llms.txt/route.ts`, `app/blog/search/page.tsx` (new server page), `scripts/articles.mjs`, `docs/publishing.md`.
- Moved: the old search page became `components/blog/SearchClient.tsx`.
- Changed: `next.config.mjs` (compiles articles on dev and build; `/blog/<slug>.md` rewrite), `app/blog/[slug]/page.tsx` (reads Markdown articles; disclosure; Markdown alternate link; draft label; drafts not indexed), `components/blog/ArticleBody.tsx` (disclosure), `components/blog/ArticleLightbox.tsx` (wide covers), `components/blog/PostCard.tsx` and `FeaturedPost.tsx` (draft label, cover position), `lib/blog/catalog.ts` and `lib/blog/categories.ts` (read from the publisher), `app/page.tsx` and `components/bento-grid.tsx` (cover position on the latest-post card), `sanity/types.ts` (new optional fields), `app/globals.css` (disclosure and wide-cover styles), `package.json` and `pnpm-lock.yaml` (packages and scripts), `.gitignore` (compiled article data), `AGENTS.md`, `README.md`.
- Deleted: `data/meteora-lp-course-post.json`, `lib/blog/meteora-post.ts`, `lib/blog/meteora-metadata.ts`.

**How to check it on the preview**
1. Open `/blog/complete-meteora-dlmm-liquidity-course` on the preview and on the live site side by side: they should match.
2. Open `/blog`: Papertrade shows first, labelled "Draft · DeFi". The new DeFi filter shows only Papertrade.
3. Open `/blog/papertrade-saga`: the full banner at the top, 6 charts that open full screen when clicked, the disclosure line in italics, then the collapsed Sources box with 20 links.
4. Open `/blog/complete-meteora-dlmm-liquidity-course.md` and `/llms.txt`: plain text for AI agents.
5. Search for "papertrade" and for "meteora" on `/blog/search`: each finds its article.
6. The homepage "Latest research" card shows Papertrade on the preview, because previews include drafts. After merge, the live site keeps showing the newest published post (Meteora) until Papertrade is published.

**Checks run**
- `pnpm typecheck` and `pnpm build` pass.
- Meteora parity against the live page: identical, as described above.
- Papertrade: every word of the .docx body appears on the page, all 6 captions are present, and all 20 source links are present.
- A deliberately broken test article failed the check with all 10 problems listed by line (bad file name, missing alt text, unknown field, `#` heading, inline image, missing image, raw HTML, table, unsafe link).
- A production-mode compile (`VERCEL_ENV=production`) leaves the draft out.
- Screenshots at 375px, 768px and 1440px of the homepage, blog, DeFi filter, both Markdown articles, the RoboStrategy article and search: no horizontal overflow.
- In `pnpm dev`, editing an article updates the page without a restart.

**Risks**
- Medium. The Meteora guide now comes from a new code path. The parity check above passed.
- A broken article now stops the build, and so stops the deploy. That is intended, and the error lists the fix.
- This PR and PR #6 (security) both change `pnpm-lock.yaml`, and PR #7 also rewrites `README.md`. Whichever merges second will show a conflict. I will update this branch to resolve it, keeping every change-log entry.
- Drafts are hidden on the live site through Vercel's `VERCEL_ENV=production` setting, which Vercel sets automatically on production builds.

**Before Papertrade goes live**
Its numbers date from 27 to 29 October. Refresh them, set `status: published` and the publication `date`, and open a small follow-up PR.

**Roll back**
Revert this PR's merge commit on GitHub (the "Revert" button on the merged PR), then merge the revert PR. That restores the old Meteora files and the previous search page.
