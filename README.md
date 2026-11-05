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
| Legacy Sanity content | The RoboStrategy post still comes from Sanity (project `bfn64pgm`, Studio at `/studio`) until it is migrated |

## Change log

Newest first. One entry per pull request.

### New article publisher, two new articles, homepage cleanup and a visual consistency pass

- **Date:** 5 November 2026
- **Pull request:** [#8](https://github.com/cryptoclassdev/sebmontydotlink/pull/8), branch `publisher/markdown-articles`. It also contains the homepage cleanup first opened as [#7](https://github.com/cryptoclassdev/sebmontydotlink/pull/7), which is closed in favour of this PR.
- **Status:** Ready for review. The visual changes were approved by Seb from before and after screenshots on 5 November 2026.

#### What changed

**A. Article publisher (replaces the one-article setup the Meteora guide used)**
1. Articles are Markdown files in `content/articles/<slug>.md`, with their images in `public/articles/<slug>/`. Publishing a post is now a file plus a pull request, with no code changes. The guide is `docs/publishing.md`.
2. A compiler (`lib/publishing/compile.mjs`) checks every article each time the site builds: required fields, a known category and author, every image present with alt text, safe links, and no unsupported formatting. Any problem stops the build and lists the file, line and fix. The old converter silently dropped anything it did not recognise. `pnpm articles:check` runs the same check by hand.
3. Categories and authors are plain lists in `content/categories.yml` and `content/authors.yml`. New categories: DeFi and Exchanges. Stocks and Solana are unchanged.
4. Agent-readable copies: every Markdown article is also served as plain Markdown at `/blog/<slug>.md`, listed in a new `/llms.txt` index, and linked from its page with a `rel="alternate" type="text/markdown"` tag.
5. An article's `disclosure` field shows in italics after the article, above Sources. Read time counts the article, not the Sources list.
6. Covers wider than 16:9 show uncropped at the top of the article; narrower covers keep the existing 16:9 crop. An optional `cover.position` field picks which part of the cover stays visible on cards (used by both new banners).
7. Drafts (`status: draft`) show on local and preview builds with a "Draft" label and are never built into the live site.
8. The search page is split into a server page and a client component, so article data stays on the server. It searches Markdown and Sanity posts, and now still shows matching Markdown articles if Sanity can't be reached (before, a Sanity error emptied the whole result list).
9. `AGENTS.md` points coding agents to the publishing guide and states the pull-request rule.

**B. Articles**
1. **The Meteora guide moved to Markdown** (`content/articles/complete-meteora-dlmm-liquidity-course.md`). Its page is unchanged: checked against the live page, it has the same title, description, all 203 lines of body text, all 10 images with their alt text and captions, and all 16 links. The only difference is the byline fix in C5. The old JSON file, its converter and its hand-typed metadata file are deleted (they remain in git history).
2. **"How Binance Absorbed the Biggest Hack in Crypto" is published** (`content/articles/binance-hack-6-3-billion.md`, Exchanges category, dated 5 November 2026). Converted from `binance-hack-6-3-billion-3.0.docx`: the author's pre-publish note at the top is removed and the highlighting is dropped; the body text is unchanged. It has the banner, 7 charts with their captions, 56 sources and the validator.com disclosure. It goes live when this PR merges.
3. **"Papertrade Saga: The Hype, Lock & Exodus" is added as a draft** (`content/articles/papertrade-saga.md`, DeFi category). Converted from `papertrade-final-29Oct.docx`: the full body, the banner, 6 charts with their captions, 20 sources and the disclosure. It shows on the preview but stays off the live site until a follow-up PR publishes it.

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
- The Binance and Papertrade articles are the next two posts.
- Fogees Hub was asked to be removed, the project images were cropping out the brand names and Seb's name, and the page width, header and footer differed between pages.

#### Files touched
- **New:** `content/articles/` (3 articles), `content/categories.yml`, `content/authors.yml`, `public/articles/binance-hack-6-3-billion/` (banner and 7 charts), `public/articles/papertrade-saga/` (banner and 6 charts), `lib/publishing/compile.mjs`, `lib/publishing/index.ts`, `lib/blog/merge-categories.ts`, `components/blog/SearchClient.tsx`, `app/agent/articles/[slug]/route.ts`, `app/llms.txt/route.ts`, `scripts/articles.mjs`, `docs/publishing.md`.
- **Changed:** `next.config.mjs` (compiles articles on dev and build; `/blog/<slug>.md` rewrite), `app/blog/[slug]/page.tsx` (Markdown articles, disclosure, Markdown alternate link, draft label and noindex, byline groups), `app/blog/search/page.tsx` (now a server page), `app/page.tsx` and `components/bento-grid.tsx` (shared header and footer, Fogees Hub removed, cover position), `app/skill-files/page.tsx` (shared header and footer), `components/site-header.tsx`, `components/site-footer.tsx`, `components/blog/ArticleBody.tsx`, `components/blog/ArticleLightbox.tsx`, `components/blog/PostCard.tsx`, `components/blog/FeaturedPost.tsx`, `components/link-tree.module.css`, `components/link-hub.module.css`, `app/globals.css`, `lib/blog/catalog.ts`, `lib/blog/categories.ts`, `sanity/types.ts`, `package.json`, `pnpm-lock.yaml`, `.gitignore`, `AGENTS.md`, `README.md`.
- **Deleted:** `data/meteora-lp-course-post.json`, `lib/blog/meteora-post.ts`, `lib/blog/meteora-metadata.ts`, `public/fogees-mockup.png`, `public/fogees-icon.png`, `public/fogees-logo.png`.

#### How to check it on the preview
Open the Vercel preview link on this PR (it needs a login to the `webdesign-sebmonty` Vercel team).
1. **Homepage:** the new header and footer, Projects with two full mockups and no Fogees Hub, and "All posts" on the same row as "From the blog" on a phone.
2. **`/blog`:** the Binance article first, Papertrade labelled "Draft · DeFi" (preview only), and the DeFi and Exchanges filters. On a phone, the category row fades at the right edge.
3. **`/blog/binance-hack-6-3-billion`:** the full banner, 7 charts that open full screen, the disclosure line in italics, then the collapsed Sources box with 56 links.
4. **`/blog/complete-meteora-dlmm-liquidity-course`:** side by side with the live page, it should match (apart from the tidier byline on phones).
5. **`/blog/complete-meteora-dlmm-liquidity-course.md`, `/blog/binance-hack-6-3-billion.md` and `/llms.txt`:** plain text for AI agents.
6. **`/skill-files` on a phone:** the stacked skill card and the aligned "Back to the hub".
7. **Any page:** the header and footer are the same everywhere, and the logo stays in the same place when you move between pages.
8. **Search** on `/blog/search` for "binance", "papertrade" and "meteora": each finds its article.

#### Checks run
- `pnpm typecheck` and `pnpm build` pass; the Vercel preview build succeeds.
- Meteora guide: identical to the live page in title, description, body text, images, captions and links; the byline differs only by the removed stray "·".
- Binance and Papertrade: every word of each .docx body appears on the page, with all chart captions and all source links. The Binance author's note does not appear.
- A deliberately broken test article failed the check with every problem listed by line.
- A production-mode build (`VERCEL_ENV=production`) leaves the Papertrade draft out.
- Screenshots of 7 pages at 375px, 768px and 1440px: no sideways scrolling anywhere, and every page uses the same page edges.
- Before and after screenshots of every visual change were reviewed and approved by Seb on 5 November 2026.

#### Risks
- **Medium.** The blog now reads articles through a new code path, and the header and footer change on every page. The checks above cover both.
- A broken article now stops the build, and so stops the deploy. That is intended, and the error lists the fix.
- The Binance article is dated 5 November 2026. If this merges on a later day, update `date:` in its file first.
- Security PR #6 also changes `pnpm-lock.yaml`. Whichever of the two merges second will show a conflict in that file, and the branch needs updating before it can merge.
- Drafts are hidden on the live site through Vercel's `VERCEL_ENV=production`, which Vercel sets automatically on production builds.

#### Before Papertrade goes live
Its numbers date from 27 to 29 October. Refresh them, set `status: published` and the publication `date`, and open a small follow-up PR.

#### Roll back
Revert this PR's merge commit on GitHub (the "Revert" button on the merged PR), then merge the revert PR. That restores the previous homepage, header, footer, Meteora files and search page, and removes the two new articles.
