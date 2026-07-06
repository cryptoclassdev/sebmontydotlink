# Sanity Blog Design

**Date:** 2026-01-24
**Status:** Implemented
**Updated:** 2026-01-25 (expanded specification)

## Overview

A modern, content-focused blog built with **Next.js 16+ App Router** and **Sanity CMS**. The design emphasizes readability, clean typography, and minimal visual clutter. Blog pages live at `/blog` with their own layout, separate from the bento grid homepage.

### Tech Stack
- **Framework**: Next.js 16+ (App Router, Server Components)
- **CMS**: Sanity v3 (headless)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Rich Text**: @portabletext/react
- **Images**: next/image + Sanity CDN

### Key Decisions
- **Accent color**: White/neutral (minimal, no colored accents)
- **Authors**: Multiple authors supported (guest posts, team)
- **Categories**: Crypto-focused (DeFi, Trading, NFTs, Staking, News, Tutorials)
- **Sidebar**: All three sections (Popular Posts, Categories, About)
- **Navigation**: Minimal back arrow only (no full navbar)
- **Mobile cards**: Show small thumbnails (not hidden)
- **Featured post**: Falls back to most recent if none marked featured
- **Search**: Included in initial implementation
- **Comments**: Included with moderation
- **Table of Contents**: Not needed

---

## 1. Route Structure

```
/blog                      → Blog homepage (featured + recent posts)
/blog/[slug]               → Individual post detail page
/blog/category/[slug]      → Posts filtered by category
/blog/search               → Full-text search page (client-side)
/studio                    → Sanity Studio (existing catch-all)
```

### Route Details

| Route | Type | Features |
|-------|------|----------|
| `/blog` | Server Component | Featured post hero, recent posts list, sidebar (popular posts, categories, about) |
| `/blog/[slug]` | Server Component + SSG | Full article with PortableText, author bio, back navigation |
| `/blog/category/[slug]` | Server Component + SSG | Category header with description, filtered post list, post count |
| `/blog/search` | Client Component | Real-time search with 300ms debounce, category browse |

---

## 2. Sanity CMS Schemas

### 2.1 Post Schema (`sanity/schemas/post.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Required, post title |
| `subtitle` | string | Deck/description shown below title |
| `slug` | slug | Auto-generated from title |
| `excerpt` | text | Short preview text (3 rows) |
| `mainImage` | image | Hero image with hotspot + alt text |
| `author` | reference | Reference to author document |
| `category` | reference | Primary category reference |
| `categories` | array of strings | Tags for additional categorization |
| `publishedAt` | datetime | Publication date |
| `isFeatured` | boolean | Featured post flag (default: false) |
| `readTime` | number | Minutes to read |
| `likes` | number | Like count (default: 0) |
| `commentCount` | number | Comment count (read-only) |
| `body` | blockContent | Rich content body |

### 2.2 Category Schema (`sanity/schemas/category.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Required, category name |
| `slug` | slug | Auto-generated from title |
| `description` | text | Category description |
| `color` | string | Hex color code for badge |
| `order` | number | Display order in navigation |

### 2.3 Author Schema (`sanity/schemas/author.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Required, author name |
| `slug` | slug | Auto-generated from name |
| `image` | image | Author avatar with hotspot |
| `bio` | text | Author biography |
| `xHandle` | string | X/Twitter handle without @ |

### 2.4 Block Content Schema (`sanity/schemas/blockContent.ts`)

Rich text array supporting:
- **Block types**: normal, h2, h3, h4, blockquote
- **Lists**: bullet, numbered
- **Marks**: strong, em, code, link (with href)
- **Custom blocks**:
  - Image with alt text and caption
  - Code block with language selection (typescript, javascript, python, rust, solidity, bash, json)

### 2.5 Comment Schema (`sanity/schemas/comment.ts`) — Optional

| Field | Type | Description |
|-------|------|-------------|
| `post` | reference | Required, linked post |
| `author` | string | Commenter name |
| `email` | string | Commenter email |
| `content` | text | Comment body (max 2000 chars) |
| `createdAt` | datetime | Timestamp |
| `parentComment` | reference | For nested replies |
| `likes` | number | Comment likes |
| `isApproved` | boolean | Moderation flag |

### 2.6 Site Settings Schema (`sanity/schemas/siteSettings.ts`)

| Field | Type | Description |
|-------|------|-------------|
| `publicationName` | string | Blog/publication name |
| `tagline` | string | Short tagline |
| `description` | text | About the publication |
| `subscriberCount` | number | Subscriber count |
| `logo` | image | Publication logo |
| `socialLinks` | object | twitter, instagram, youtube URLs |

---

## 3. GROQ Queries (`sanity/queries.ts`)

### Reusable Post Fields
```groq
_id, title, subtitle, "slug": slug.current, excerpt, mainImage,
publishedAt, isFeatured, readTime, likes, commentCount, categories,
"category": category->{title, "slug": slug.current},
"author": author->{name, image, xHandle, "slug": slug.current}
```

### Query Reference

| Query | Purpose |
|-------|---------|
| `postsQuery` | All posts ordered by date |
| `postBySlugQuery` | Single post with full body |
| `featuredPostQuery` | Featured post for hero |
| `recentPostsQuery` | Recent 10 posts (excluding featured) |
| `popularPostsQuery` | Top 5 posts by likes |
| `postsByCategoryQuery` | Posts filtered by category slug |
| `categoriesQuery` | All categories with post counts |
| `searchPostsQuery` | Full-text search across title, excerpt, body |
| `postSlugsQuery` | All post slugs for SSG |
| `categorySlugsQuery` | All category slugs for SSG |

---

## 4. Design Tokens & Styling

### 4.1 Blog Color Palette (add to globals.css)

```css
:root {
  /* Blog-specific tokens - minimal white/neutral palette */
  --blog-bg-primary: #0a0a0a;           /* Main background (matches site) */
  --blog-bg-secondary: #111111;         /* Card/section backgrounds */
  --blog-accent: rgba(255, 255, 255, 0.9);  /* White accent (links, hover) */
  --blog-accent-muted: rgba(255, 255, 255, 0.6);  /* Muted accent */
  --blog-text-primary: #ffffff;         /* Main text */
  --blog-text-secondary: rgba(255, 255, 255, 0.7);  /* Secondary text */
  --blog-text-muted: rgba(255, 255, 255, 0.5);      /* Timestamps, meta */
  --blog-border: rgba(255, 255, 255, 0.1);          /* Subtle dividers */
}
```

### 4.2 Article Body Styles (add to globals.css)

```css
.article-body {
  font-family: Georgia, Charter, 'Times New Roman', serif;
  font-size: 20px;
  line-height: 1.6;
  color: var(--blog-text-primary);
}

.article-body p { margin-bottom: 1.5em; }
.article-body h2 { font-size: 28px; font-weight: 600; margin-top: 2em; margin-bottom: 0.75em; }
.article-body h3 { font-size: 22px; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
.article-body blockquote { border-left: 3px solid var(--blog-accent); padding-left: 1.5rem; font-style: italic; }
.article-body a { color: var(--blog-accent); text-decoration: underline; opacity: 0.9; }
.article-body a:hover { opacity: 1; }
.article-body code { background: rgba(255, 255, 255, 0.1); padding: 0.2em 0.4em; border-radius: 4px; }
.article-body pre { background: #1a1a2e; padding: 1rem; border-radius: 8px; overflow-x: auto; }
```

---

## 5. Component Specifications

### 5.1 Blog Homepage Layout

```
┌─────────────────────────────────────────────────────────┐
│  [←]                         Blog                       │
├─────────────────────────────────────────────────────────┤
│  Category Tabs: [All] [DeFi] [Trading] [NFTs] ...       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │     FEATURED POST (or most recent if none)       │   │
│  │     [Image 16:9] [Category Badge]                │   │
│  │     [Title - Large] [Subtitle]                   │   │
│  │     [Author Avatar] [Name] [Date] [Read Time]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├────────────────────────────────┬────────────────────────┤
│  RECENT POSTS                  │  SIDEBAR               │
│  ┌──────────────────────────┐  │  Popular Posts         │
│  │ [Thumb] Title            │  │  1. Post Title         │
│  │         Excerpt...       │  │  2. Post Title         │
│  │         Author · Date    │  │  ...                   │
│  └──────────────────────────┘  │                        │
│  ...                           │  Categories            │
│                                │  • DeFi (12)           │
│                                │  • Trading (8)         │
│                                │                        │
│                                │  About                 │
│                                │  Publication info...   │
└────────────────────────────────┴────────────────────────┘

Mobile: Single column, small thumbnails visible on cards
```

### 5.2 Post Detail Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Blog                                         │
├─────────────────────────────────────────────────────────┤
│  [Category Badge]                                       │
│  POST TITLE (text-3xl md:text-4xl lg:text-5xl)         │
│  Subtitle (text-xl text-white/70)                      │
│  [Avatar] Author Name · Jan 15, 2025 · 5 min read      │
│  [Featured Image 16:9]                                  │
│  ─────────────────────────────────────────────────────  │
│  Article body (.article-body class)                    │
│  ─────────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  AUTHOR BIO BOX                                  │   │
│  │  [Avatar] Name · Bio · [@xhandle]               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 5.3 Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| `PostCard` | `components/blog/PostCard.tsx` | Post list item with thumbnail |
| `FeaturedPost` | `components/blog/FeaturedPost.tsx` | Featured post hero |
| `CategoryNav` | `components/blog/CategoryNav.tsx` | Category tabs navigation |
| `PopularPosts` | `components/blog/PopularPosts.tsx` | Sidebar popular posts list |
| `ArticleBody` | `components/blog/ArticleBody.tsx` | PortableText renderer |
| `AuthorBio` | `components/blog/AuthorBio.tsx` | Author info box |
| `SearchInput` | `components/blog/SearchInput.tsx` | Search with debounce |
| `CategoryBadge` | `components/blog/CategoryBadge.tsx` | Styled category link |

---

## 6. File Structure

```
├── sanity.config.ts                    # Sanity configuration
├── sanity/
│   ├── schemas/
│   │   ├── index.ts                    # Schema exports
│   │   ├── post.ts                     # Post schema
│   │   ├── category.ts                 # Category schema
│   │   ├── author.ts                   # Author schema
│   │   ├── blockContent.ts             # Rich text schema
│   │   ├── comment.ts                  # Comment schema (optional)
│   │   └── siteSettings.ts             # Site settings schema
│   ├── queries.ts                      # GROQ queries
│   └── client.ts                       # Sanity client + urlFor
├── components/
│   └── blog/
│       ├── PostCard.tsx
│       ├── FeaturedPost.tsx
│       ├── CategoryNav.tsx
│       ├── PopularPosts.tsx
│       ├── ArticleBody.tsx
│       ├── AuthorBio.tsx
│       ├── SearchInput.tsx
│       └── CategoryBadge.tsx
├── app/
│   ├── globals.css                     # Add blog design tokens
│   ├── blog/
│   │   ├── layout.tsx                  # Blog layout with nav
│   │   ├── page.tsx                    # Blog homepage
│   │   ├── [slug]/
│   │   │   └── page.tsx                # Post detail
│   │   ├── category/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # Category archive
│   │   └── search/
│   │       └── page.tsx                # Search page (client)
│   └── studio/
│       └── [[...tool]]/                # Existing Sanity Studio
└── .env.local                          # Sanity project ID & dataset
```

---

## 7. Image Sizes Reference

| Usage | Dimensions | Aspect Ratio |
|-------|-----------|--------------|
| Featured Post Hero | 1200 × 675 | 16:9 |
| Post List Thumbnail (md) | 256 × 192 | 4:3 |
| Post List Thumbnail (lg) | 384 × 256 | 3:2 |
| Article Images | 800 × 450 | 16:9 |
| Author Avatar (small) | 32 × 32 | 1:1 |
| Author Avatar (medium) | 40 × 40 | 1:1 |
| Author Avatar (large) | 80 × 80 | 1:1 |

---

## 8. Dependencies

**To install:**
- `@portabletext/react` — Portable text rendering

**Already installed:**
- `sanity` (5.5.0)
- `next-sanity` (12.0.14)
- `@sanity/client` (latest)
- `@sanity/image-url` (2.0.3)
- `@sanity/vision` (5.5.0)

---

## 9. Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

---

## 10. Implementation Checklist

### Phase 1: Setup & CMS
- [ ] Create `sanity.config.ts` configuration
- [ ] Create all Sanity schemas (post, category, author, blockContent, comment, siteSettings)
- [ ] Create schema index export
- [ ] Create Sanity client with `urlFor` helper
- [ ] Create GROQ queries file
- [ ] Configure `next.config.ts` for Sanity images

### Phase 2: Styling
- [ ] Add blog color palette to `globals.css`
- [ ] Add `.article-body` styles to `globals.css`

### Phase 3: Components
- [ ] `PostCard` component
- [ ] `FeaturedPost` component
- [ ] `CategoryNav` component
- [ ] `PopularPosts` component
- [ ] `ArticleBody` (PortableText renderer)
- [ ] `AuthorBio` component
- [ ] `SearchInput` component
- [ ] `CategoryBadge` component

### Phase 4: Pages
- [ ] Blog layout (`app/blog/layout.tsx`)
- [ ] Blog homepage (`app/blog/page.tsx`)
- [ ] Post detail page (`app/blog/[slug]/page.tsx`)
- [ ] Category page (`app/blog/category/[slug]/page.tsx`)
- [ ] Search page (`app/blog/search/page.tsx`)

### Phase 5: Polish
- [ ] Implement static generation (`generateStaticParams`)
- [ ] Add SEO metadata to all pages
- [ ] Test responsive design
- [ ] Verify all hover effects and transitions
- [ ] Add loading states

---

## 11. Verification

1. Run `npm run dev` and visit `/studio` to create sample content
2. Create at least one author, 2-3 categories, and 3-5 posts (one featured)
3. Verify `/blog` shows featured post hero and recent posts grid
4. Verify `/blog/[slug]` shows full article with author bio
5. Verify `/blog/category/[slug]` filters posts correctly
6. Verify `/blog/search` finds posts by title/content
7. Test on mobile and desktop viewports

---

## Implementation Notes

- Blog uses dark theme matching the main site (`#0a0a0a` background)
- Use existing design tokens from `globals.css` where possible
- **White/neutral accent** — no colored accents, use opacity for hover states
- **Mobile**: single column layout, small thumbnails visible on post cards
- **Desktop**: two-column layout with sticky sidebar (Popular, Categories, About)
- **Navigation**: Minimal back arrow only (no text, no full navbar)
- **Featured post logic**: Query for `isFeatured == true`, fallback to most recent
- **Categories**: Crypto-focused (DeFi, Trading, NFTs, Staking, News, Tutorials)
- **Comments**: Full system with moderation (`isApproved` field)
- All interactive elements should have hover/focus states
- Reduced motion support via existing `@media (prefers-reduced-motion)`
