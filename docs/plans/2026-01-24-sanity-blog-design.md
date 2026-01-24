# Sanity Blog Design

**Date:** 2026-01-24
**Status:** Approved, pending implementation

## Overview

Standalone blog functionality for sebmonty.link powered by Sanity CMS. Blog pages live at `/blog` with their own layout, separate from the bento grid homepage. Sanity Studio accessible at `/studio` for content management.

## Requirements

- Standalone blog pages at `/blog`
- Adaptive light/dark mode based on user preference
- Full-featured content: title, date, featured image, categories/tags, author, read time, SEO fields, related posts, table of contents
- Embedded images and YouTube videos within blog content
- Sanity Studio at `/studio` within the site

---

## 1. Sanity Schema & Configuration

### Post Schema (`sanity/schemas/post.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Required, post title |
| `slug` | slug | Auto-generated from title |
| `featuredImage` | image | Hero image with alt text |
| `publishedAt` | datetime | Publication date |
| `author` | object | Name and avatar |
| `categories` | array of strings | Tags/categories |
| `excerpt` | text | Short preview text |
| `body` | portable text | Rich content (see below) |
| `seoDescription` | text | Meta description |
| `ogImage` | image | Open Graph image override |

### Body Content Blocks

- Headings (h2, h3, h4)
- Paragraphs, lists, blockquotes, links
- **Image blocks** — with caption and alt text
- **YouTube embed blocks** — paste URL, renders responsive player

### Configuration (`sanity.config.ts`)

```typescript
// Project ID from NEXT_PUBLIC_SANITY_PROJECT_ID
// Dataset: production
// Plugins: visionTool for GROQ testing
// Schema: post type
```

---

## 2. Sanity Client & Helpers

### Client Setup (`lib/sanity.ts`)

- Sanity client with project ID, dataset, API version from env
- `imageUrlBuilder` for optimized image URLs with transformations

### Query Helpers

| Function | Purpose |
|----------|---------|
| `getPosts()` | List all posts for `/blog` listing |
| `getPost(slug)` | Single post by slug |
| `getPostSlugs()` | All slugs for static generation |
| `getRelatedPosts(categories, currentSlug)` | Posts sharing categories |

### Portable Text Components (`components/portable-text.tsx`)

Custom renderers for:
- **Headings** — with anchor IDs for table of contents
- **Images** — Next.js Image with blur placeholder
- **YouTube embeds** — responsive 16:9 iframe
- **Links** — external links open in new tab

---

## 3. Blog Pages

### Blog Listing (`app/blog/page.tsx`)

- Fetches all posts via `getPosts()`
- Grid layout of post cards:
  - Featured image thumbnail
  - Title, excerpt, date
  - Categories as badges
  - Estimated read time
- Sorted by `publishedAt` descending
- SEO metadata for listing page

### Individual Post (`app/blog/[slug]/page.tsx`)

- Static generation with `generateStaticParams()`
- Fetches post via `getPost(slug)`
- Layout:
  - Hero: featured image, title, date, author, read time
  - Table of contents (generated from headings)
  - Body content via portable text renderer
  - Categories/tags section
  - Related posts at bottom
- Full SEO: dynamic meta title, description, OG image
- Back to blog link

### Blog Layout (`app/blog/layout.tsx`)

- Shared wrapper for blog routes
- Dark/light mode via `next-themes`
- Navigation header with link back to homepage
- Max-width container for readability

---

## 4. Sanity Studio

### Studio Route (`app/studio/[[...tool]]/page.tsx`)

- Uses `next-sanity` NextStudio component
- Catch-all route for all studio paths
- Client-side only rendering (`'use client'`)

### Studio Layout (`app/studio/[[...tool]]/layout.tsx`)

- Minimal layout without site chrome
- Full viewport for studio interface
- Metadata: `robots: noindex` to prevent indexing

### Styling

- Sanity's default theme
- Isolated from site styles

---

## 5. Theming & Styling

### Theme Provider

- Add `next-themes` ThemeProvider to root layout
- `attribute="class"` for Tailwind dark mode
- `defaultTheme="system"` respects user preference

### Blog Styles

- `@tailwindcss/typography` plugin for prose styling
- Dark mode: `prose-invert` variant
- Custom styles for:
  - YouTube embeds (16:9 aspect ratio)
  - Image captions
  - Table of contents (sticky sidebar on desktop)
  - Category badges matching site design tokens

### Responsive Behavior

- **Mobile:** single column, TOC collapsed/hidden
- **Desktop:** content with sticky TOC sidebar

---

## 6. File Structure

```
├── sanity.config.ts                    # Sanity configuration
├── sanity/
│   └── schemas/
│       ├── index.ts                    # Schema exports
│       └── post.ts                     # Post schema
├── lib/
│   └── sanity.ts                       # Client, image builder, queries
├── components/
│   └── portable-text.tsx               # Custom block renderers
├── app/
│   ├── layout.tsx                      # Add ThemeProvider
│   ├── blog/
│   │   ├── layout.tsx                  # Blog layout with nav
│   │   ├── page.tsx                    # Post listing
│   │   └── [slug]/
│   │       └── page.tsx                # Individual post
│   └── studio/
│       └── [[...tool]]/
│           ├── layout.tsx              # Minimal studio layout
│           └── page.tsx                # Studio component
└── .env.local                          # Sanity project ID & dataset
```

---

## 7. Dependencies

**To install:**
- `@tailwindcss/typography` — prose styling for article content
- `next-themes` — dark/light mode switching

**Already installed:**
- `sanity` (5.5.0)
- `next-sanity` (12.0.14)
- `@sanity/client` (latest)
- `@sanity/image-url` (2.0.3)
- `@sanity/vision` (5.5.0)

---

## 8. Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

---

## Implementation Notes

1. User must have a Sanity project created at sanity.io/manage
2. After implementation, run `npm run dev` and visit `/studio` to set up content
3. Create at least one test post to verify the blog listing and individual pages work
4. Table of contents requires parsing headings from portable text content
