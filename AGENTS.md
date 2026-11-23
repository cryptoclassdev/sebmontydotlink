# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) and Cursor IDE (https://cursor.com) when working with code in this repository.

## Project Overview

Personal link-in-bio site for Seb Montgomery (crypto content creator). Bento-grid homepage of referral links and project cards, plus a blog at `/blog`.

This repo is synced from v0.app — expect generated components in `components/ui/` and avoid hand-editing files in ways that conflict with the v0 flow unless the user intends to stop using v0.

## Shipping rule

Every change ships as a pull request against `main`; never push to `main` and never merge. Each PR adds an entry to the **Change log** in `README.md` (what changed and why, files touched, how to check it on the Vercel preview, risks, roll back), and the PR description carries the same details.

## Articles (Studio)

Articles are written and published in the Studio at `/studio` (see `docs/studio.md`), not by pull request. The public site reads them only through `lib/blog/source.ts` (Studio database via `lib/studio/public.ts`; Portable Text bodies rendered by `components/blog/ArticleBody.tsx`). Each article is also served as Markdown at `/blog/<slug>.md` (`lib/studio/markdown.ts`) and listed in `/llms.txt`. Draft preview uses Next.js draft mode (`app/api/studio/preview/`), and reader comments are moderated in the Studio. Public reads go through a cache tagged `studio-public` so the database can sleep between edits: any code that changes what the public site shows must call `revalidatePublicPages()` (`lib/studio/revalidate.ts`). Article bodies can hold X posts (`xPost` blocks with a saved copy of the post, `lib/studio/xpost.ts`) and chart blocks; each chart type is defined once in `lib/studio/charts.ts` (editor form, example data, publish checks), so a new chart type starts there plus a `*Figure.tsx` renderer and an entry in `components/blog/ArticleBody.tsx`.

The old Markdown publisher (`content/articles/*.md`, `lib/publishing/`, `docs/publishing.md`) is now only the source for the one-time import into the Studio and the fallback the site shows when the Studio database isn't connected (local work without `DATABASE_URL`). Don't add new articles there. Sanity has been removed; the retired RoboStrategy post redirects to `/blog`.

## Search and AI readability

Read `docs/seo.md` first. Every page's metadata goes through `pageMetadata()` in `lib/seo.ts` (own canonical, full Open Graph and X card, RSS link); never put a canonical in the root layout. Structured data: `components/seo/SiteJsonLd.tsx` (Person, WebSite on every page) and `components/seo/ArticleJsonLd.tsx` (BlogPosting, BreadcrumbList, FAQPage from question headings). `/robots.txt`, `/sitemap.xml`, `/blog/rss.xml`, `/llms.txt` and the share cards (`app/og/`, drawn in `lib/og.tsx`) build themselves from the Studio; anything new that changes what they show must be refreshed in `revalidatePublicPages()`. Studio publishes ping IndexNow in production (`lib/indexnow.ts`).

## Studio (/studio)

The site's own password-gated article dashboard (replacing Sanity). Read `docs/studio.md` first. Code: `app/studio/` (pages and server actions), `components/studio/`, `lib/studio/` (database schema `lib/studio/db/schema.ts`, sign-in `auth.ts`, data functions, `public.ts` for what the site reads), `app/api/studio/`, `scripts/studio/`, migrations `drizzle/`, login gate `proxy.ts`. Postgres via Drizzle, sign-in via Better Auth (email and password, no sign-up), images in Vercel Blob, article bodies in Portable Text edited with `@portabletext/editor` in the block shapes `components/blog/ArticleBody.tsx` renders. Every Studio page and server action must call `requireUser()` (or `requireAdmin()`). After a schema change run `pnpm studio:generate` and commit the migration.

## Stack

Next.js **16** (App Router, Turbopack), React **19**, Tailwind CSS **v4**, TypeScript 5. Tailwind v4 is **CSS-first**: there is no `tailwind.config.*` — theme tokens, `@theme`, and `@custom-variant dark` all live in `app/globals.css`, and PostCSS is wired via `@tailwindcss/postcss` in `postcss.config.mjs`.

## Commands

```bash
npm run dev      # Dev server (Turbopack)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ⚠️ Broken — script calls `eslint .`, but eslint is not installed and there's no config
```

There is **no working linter and no test runner**. `npm run lint` currently fails with `eslint: command not found`, and `npm test` doesn't exist — don't assume either does anything; confirm with the user before wiring one up. The only real pre-ship type gate is `tsc --noEmit` (see Gotchas).

## Environment

Required env vars (see `.env.example`):
- Studio: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`, `STUDIO_SETUP_TOKEN` (first admin), optional `BETTER_AUTH_URL`. Without `DATABASE_URL` the site still builds, the blog shows the Markdown articles and `/studio` says it isn't connected.

## Gotchas

- **`next.config.mjs` sets `typescript.ignoreBuildErrors: true`.** Prod builds will ship even with TS errors. Run `tsc --noEmit` (or rely on your editor) before shipping — CI/build won't catch type regressions.
- **Remote images** for `next/image` must come from the Vercel Blob store (`*.public.blob.vercel-storage.com`), the only remote pattern in `next.config.mjs`. Adding other image hosts requires updating `remotePatterns`.
- **Tailwind v4, CSS-first**: don't create a `tailwind.config.*` — it won't be read. Add design tokens and utilities in `app/globals.css` (`@theme`, `:root`, `@custom-variant`).
- **Path alias**: `@/*` → repo root (e.g. `@/lib/blog/source`, `@/components/ui/wobble-card`, `@/lib/utils`).

## Architecture

### Routes
- `app/page.tsx` — homepage, renders `<BentoGrid />`
- `app/layout.tsx` — root layout (Inter font, metadata, skip link)
- `app/blog/` — blog listing, `[slug]`, `category/`, `search/`
- `app/studio/` — the Studio (article dashboard; see docs/studio.md)
- `app/api/subscribe/` — email subscription endpoint

### Component layout
- `components/bento-grid.tsx` — homepage grid (12-col desktop, 1-col mobile), owns modal state
- `components/ui/` — just three primitives: `wobble-card`, `3d-card` (`CardContainer`/`CardBody`), `cta-button`. Most cards/sections live directly under `components/` (`link-card`, `profile-section`, `social-footer`, `link-bio-page`, `theme-provider`, etc.)
- `components/icons/` — hand-rolled SVG icon components (one per brand: drift, kast, marginfi, solblaze, etc.)
- `components/blog/` — blog-only components (`PostCard`, `FeaturedPost`, `ArticleBody`, `CategoryNav`, etc.); re-exported from `components/blog/index.ts`
- `components/email-signup-modal.tsx` — dark-theme email modal
- `components/referral-grid.tsx`, `referrals-carousel.tsx` — partner referrals

### Blog data
- `lib/blog/source.ts` — the only place pages read articles, categories, related posts and Markdown copies
- `lib/blog/types.ts` — shared `Post`, `Author`, `Category` and Portable Text types
- `lib/studio/public.ts`: Studio queries for live posts, draft previews and approved comments (cached; see docs/studio.md)

### Design system (defined in `app/globals.css`)

Spacing (4px base): `--space-1`…`--space-6` (4/8/16/24/32/48px).

Radii: `--radius-sm/md/lg/xl/full` (8/12/16/24/9999).

Transitions: `--transition-fast` 150ms, `-base` 200ms, `-slow` 300ms, `-bounce` 400ms cubic-bezier(0.34, 1.56, 0.64, 1).

Colors are OKLCH. Light mode: off-white/cream. Dark mode: deep midnight blue. Page background is `#0a0a0a` (hard-coded, not tokenized).

Component classes: `.bento-card`, `.bento-card-link`, `.bento-icon`, `.bento-social-btn`, `.bento-badge`, `.cta-border-spin`, `.cta-shimmer`, `.cta-glow-pulse`.

### Styling conventions
- Use `cn()` from `lib/utils.ts` for conditional classes.
- Prefer Tailwind over inline styles.
- Light cards: `bg-[#f1f1f1] rounded-[1.75rem] border-[2.5px] border-white`
- Dark cards: `bg-[#1a1a1a] border-[2.5px] border-white/20`
- Text opacity: `text-black/60` secondary, `text-black/80` body
- Hover borders: `hover:border-white/40` (light), `hover:border-white/35` (dark)
- Touch feedback: `active:scale-[0.98]`

### Patterns
- Every card is wrapped in `WobbleCard` for hover tilt; the profile card uses `CardContainer`/`CardBody` for 3D perspective.
- The one modal, `components/email-signup-modal.tsx`, traps focus, closes on ESC, restores focus to the previously-focused element on close, and locks body scroll (`document.body.style.overflow`). There is no generic `ui/modal` primitive — mirror this component's pattern instead of rolling your own.
- Responsive is mobile-first with a single `lg:` breakpoint for the 12-col desktop grid.
- Respect `prefers-reduced-motion` — existing animations already gate on it in `globals.css`.

### Animation defaults (Framer Motion)
- Containers: `staggerChildren: 0.06`, `delayChildren: 0.15`.
- Items: spring `{ stiffness: 400, damping: 28, mass: 0.8 }`.
- Match these when adding new entrance animations so timing stays consistent.
