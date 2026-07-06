# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) and Cursor IDE (https://cursor.com) when working with code in this repository.

## Project Overview

Personal link-in-bio site for Seb Montgomery (crypto content creator). Bento-grid homepage of referral links and project cards, plus a Sanity-powered blog at `/blog` and Sanity Studio at `/studio`.

This repo is synced from v0.app — expect generated components in `components/ui/` and avoid hand-editing files in ways that conflict with the v0 flow unless the user intends to stop using v0.

## Stack

Next.js **16** (App Router, Turbopack), React **19**, Tailwind CSS **v4**, TypeScript 5, Sanity v5. Tailwind v4 is **CSS-first**: there is no `tailwind.config.*` — theme tokens, `@theme`, and `@custom-variant dark` all live in `app/globals.css`, and PostCSS is wired via `@tailwindcss/postcss` in `postcss.config.mjs`.

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
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET` (defaults to `production` in `sanity/client.ts`)

## Gotchas

- **`next.config.mjs` sets `typescript.ignoreBuildErrors: true`.** Prod builds will ship even with TS errors. Run `tsc --noEmit` (or rely on your editor) before shipping — CI/build won't catch type regressions.
- **Sanity images** must come from `cdn.sanity.io` — that's the only allowed remote pattern in `next.config.mjs`. Adding other image hosts requires updating `remotePatterns`.
- **Tailwind v4, CSS-first**: don't create a `tailwind.config.*` — it won't be read. Add design tokens and utilities in `app/globals.css` (`@theme`, `:root`, `@custom-variant`).
- **Path alias**: `@/*` → repo root (e.g. `@/sanity/client`, `@/components/ui/wobble-card`, `@/lib/utils`).

## Architecture

### Routes
- `app/page.tsx` — homepage, renders `<BentoGrid />`
- `app/layout.tsx` — root layout (Inter font, metadata, skip link)
- `app/blog/` — blog listing, `[slug]`, `category/`, `search/`
- `app/studio/[[...tool]]/` — embedded Sanity Studio
- `app/api/subscribe/` — email subscription endpoint

### Component layout
- `components/bento-grid.tsx` — homepage grid (12-col desktop, 1-col mobile), owns modal state
- `components/ui/` — just three primitives: `wobble-card`, `3d-card` (`CardContainer`/`CardBody`), `cta-button`. Most cards/sections live directly under `components/` (`link-card`, `profile-section`, `social-footer`, `link-bio-page`, `theme-provider`, etc.)
- `components/icons/` — hand-rolled SVG icon components (one per brand: drift, kast, marginfi, solblaze, etc.)
- `components/blog/` — blog-only components (`PostCard`, `FeaturedPost`, `ArticleBody`, `CategoryNav`, etc.); re-exported from `components/blog/index.ts`
- `components/email-signup-modal.tsx` — dark-theme email modal
- `components/referral-grid.tsx`, `referrals-carousel.tsx` — partner referrals

### Sanity CMS
- `sanity.config.ts` — studio config, `basePath: /studio`
- `sanity/client.ts` — Sanity client + `urlFor()` image URL builder
- `sanity/queries.ts` — all GROQ queries (posts, categories, featured, search, comments, site settings). Prefer composing via the shared `postFields` fragment.
- `sanity/schemas/` — `post`, `author`, `category`, `comment`, `blockContent`, `siteSettings`
- `sanity/types.ts` — TS types matching the schemas

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
