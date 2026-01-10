# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal link-in-bio website for Seb Montgomery (crypto content creator). Single-page bento grid layout with referral links, social icons, and modals.

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
- **Tailwind CSS 4** with `@tailwindcss/postcss`
- **Framer Motion** for animations
- **Radix UI** primitives for accessibility
- **TypeScript** (strict mode)

## Architecture

### Page Structure
- `app/page.tsx` - Single entry point, renders `<BentoGrid />`
- `app/layout.tsx` - Root layout with Inter font, metadata, skip link
- `app/globals.css` - Design tokens (spacing, colors, shadows) and component classes

### Component Organization
- `components/bento-grid.tsx` - Main layout component (12-column grid), manages modal state
- `components/ui/` - Reusable UI primitives (modal, wobble-card, 3d-card, floating-dock)
- `components/icons/` - SVG icon components (each exports a single icon)
- `components/email-signup-modal.tsx` - Dark theme modal for email collection
- `components/referral-grid.tsx` - Partner referral links grid

### Design System (defined in globals.css)
- **Spacing**: 4px base unit (--space-1 through --space-6)
- **Border radius**: --radius-sm (8px) to --radius-xl (24px)
- **Card background**: `#f1f1f1` for light cards, `#111` for dark modals
- **Border standard**: 2.5px white borders on cards
- **Transitions**: --transition-fast (150ms), --transition-base (200ms)

### Key Patterns
- All cards use `WobbleCard` wrapper for hover tilt effect
- Profile card uses `CardContainer`/`CardBody` for 3D perspective
- Modals handle focus trap, ESC close, body scroll lock
- Responsive: mobile-first with `lg:` breakpoint for desktop grid
- Reduced motion support via `@media (prefers-reduced-motion)`

## Path Aliases

```typescript
@/* -> ./*  // e.g., @/components/ui/modal
```

## Styling Conventions

- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Prefer Tailwind classes over inline styles
- Cards: `bg-[#f1f1f1] rounded-[1.75rem] border-[2.5px] border-white`
- Dark modals: `bg-[#111] border border-white/[0.08]`
- Text opacity: `text-black/70` for secondary, `text-black/80` for readable body
