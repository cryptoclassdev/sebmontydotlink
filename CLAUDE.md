# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal link-in-bio website for Seb Montgomery (crypto content creator). Features a bento grid layout with referral links, project showcases, social icons, modals, and a Sanity-powered blog.

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint
npm run start    # Production server
```

## Tech Stack

- **Next.js 16** with App Router and Turbopack
- **React 19**
- **Tailwind CSS 4** with `@tailwindcss/postcss` and `tw-animate-css`
- **Framer Motion 12** for animations
- **Radix UI** full primitive suite for accessibility
- **Sanity CMS** for blog content management
- **TypeScript** (strict mode)
- **Vercel Analytics** for tracking

## Architecture

### Page Structure
- `app/page.tsx` - Main entry point, renders `<BentoGrid />`
- `app/layout.tsx` - Root layout with Inter font, metadata, viewport config, skip link
- `app/globals.css` - Design tokens (spacing, colors, shadows) and component classes
- `app/blog/page.tsx` - Blog listing page
- `app/blog/[slug]/page.tsx` - Individual blog post page
- `app/studio/[[...tool]]/` - Sanity Studio admin interface

### Component Organization
- `components/bento-grid.tsx` - Main layout component (12-column desktop, single-column mobile), manages modal state
- `components/ui/` - Reusable UI primitives:
  - `modal.tsx` - Focus-trapped modal with ESC close
  - `wobble-card.tsx` - Hover tilt effect wrapper
  - `3d-card.tsx` - 3D perspective card (`CardContainer`/`CardBody`)
  - `floating-dock.tsx` - Social links dock
  - `cta-button.tsx` - Animated CTA with spinning border, shimmer, and glow
  - `aceternity-input.tsx` - Styled input component
  - `label.tsx` - Form label component
- `components/icons/` - SVG icon components (drift, email, grass, infinex, kast, linkedin, marginfi, marinade, solblaze, substack, telegram, uprock, whales-market, x, youtube, at)
- `components/email-signup-modal.tsx` - Dark theme modal for email collection
- `components/referral-grid.tsx` - Partner referral links grid
- `components/portable-text.tsx` - Sanity portable text renderer

### Sanity CMS Setup
- `sanity.config.ts` - Sanity configuration (projectId from env, basePath: `/studio`)
- `lib/sanity.ts` - Sanity client, image URL builder, query helpers (`getPosts`, `getPost`, `getPostSlugs`)
- `sanity/schemas/` - Content schemas (post)
- Environment variables: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`

### Design System (defined in globals.css)

#### Spacing (4px base unit)
- `--space-1`: 4px - icon gaps, tight elements
- `--space-2`: 8px - inline spacing, small gaps
- `--space-3`: 16px - card gaps, component spacing
- `--space-4`: 24px - internal card padding
- `--space-5`: 32px - section breathing room
- `--space-6`: 48px - major section breaks

#### Border Radius
- `--radius-sm`: 8px - small elements, badges
- `--radius-md`: 12px - buttons, inputs
- `--radius-lg`: 16px - cards, containers
- `--radius-xl`: 24px - hero cards, large sections
- `--radius-full`: 9999px - circular elements

#### Transitions
- `--transition-fast`: 150ms cubic-bezier(0.23, 1, 0.32, 1)
- `--transition-base`: 200ms
- `--transition-slow`: 300ms
- `--transition-bounce`: 400ms cubic-bezier(0.34, 1.56, 0.64, 1)

#### Colors (OKLCH-based)
- Light mode: Off-white/cream palette (`oklch(0.98 0.005 90)` background)
- Dark mode: Deep midnight blue (`oklch(0.1 0.025 270)` background)
- Card backgrounds with transparency and backdrop blur

#### Component CSS Classes
- `.bento-card` - Base card with gradient background, backdrop blur, shadow, hover lift
- `.bento-card-link` - Clickable card variant with active state
- `.bento-icon` - Circular icon container with foreground background
- `.bento-social-btn` - Social button with hover scale and lift
- `.bento-badge` - Pill badge with shimmer hover effect
- `.cta-border-spin` - Spinning border animation (4s)
- `.cta-shimmer` - Shimmer effect (2.5s)
- `.cta-glow-pulse` - Pulsing glow (2s)

### Key Patterns
- All cards use `WobbleCard` wrapper for hover tilt effect
- Profile card uses `CardContainer`/`CardBody` for 3D perspective
- Modals handle focus trap, ESC close, body scroll lock
- Responsive: mobile-first with `lg:` breakpoint for desktop 12-column grid
- Dark background (`#0a0a0a`) with animated star particles
- Reduced motion support via `@media (prefers-reduced-motion)`
- Staggered entrance animations using Framer Motion variants

### Animation System
- Container variants: staggerChildren 0.06s, delayChildren 0.15s
- Item variants: spring animation (stiffness: 400, damping: 28, mass: 0.8)
- Background stars: varied pulse animations (2.8s - 5.5s duration)

## Path Aliases

```typescript
@/* -> ./*  // e.g., @/components/ui/modal
```

## Styling Conventions

- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Prefer Tailwind classes over inline styles
- Light cards: `bg-[#f1f1f1] rounded-[1.75rem] border-[2.5px] border-white`
- Dark cards: `bg-[#1a1a1a] border-[2.5px] border-white/20`
- Page background: `bg-[#0a0a0a]`
- Text opacity: `text-black/60` for secondary, `text-black/80` for body
- Hover states: `hover:border-white/40` for light cards, `hover:border-white/35` for dark
- Active states: `active:scale-[0.98]` for touch feedback
