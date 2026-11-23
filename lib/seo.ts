// Site-wide search and sharing settings: the canonical host, the profile links, and
// pageMetadata(), which gives a page its own canonical link and full share tags.
// Next.js replaces `alternates`, `openGraph` and `twitter` as a whole when a page sets them,
// so every page passes through pageMetadata() rather than setting those fields by hand.
// See docs/seo.md.
import type { Metadata } from 'next'

import type { Post } from '@/lib/blog/types'

/** The host that serves the site (www). Every canonical, sitemap and feed URL uses it. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sebmonty.link').replace(/\/$/, '')
export const SITE_NAME = 'Seb Montgomery'
export const SITE_LOCALE = 'en_GB'
export const X_HANDLE = '@SebMontgomery'

export const SITE_DESCRIPTION =
  'Independent research on crypto, Solana and AI by Seb Montgomery, co-founder of validator.com: long-form articles, agent skill files and tools I use.'

/** Seb's public profiles (the same links as the header, footer and homepage). */
export const PROFILE_LINKS = {
  x: 'https://x.com/SebMontgomery',
  youtube: 'https://www.youtube.com/@SebMontgomery',
  linkedin: 'https://www.linkedin.com/in/sebastian-montgomery-3354a245/',
  telegram: 'https://t.me/SebMontgomery',
}

export const AVATAR_PATH = '/images/brand/seb-avatar.png'

/** The 1200 x 630 card used when a page has no image of its own (app/og/site/route.tsx). */
export const SITE_SHARE_IMAGE: ShareImage = {
  url: '/og/site?v=1',
  width: 1200,
  height: 630,
  alt: 'Seb Montgomery: independent research on crypto, Solana and AI',
}

export type ShareImage = { url: string; width: number; height: number; alt: string }

/** The RSS feed link every page carries (pages replace `alternates` whole, so it is added per page). */
export const RSS_ALTERNATE = { 'application/rss+xml': [{ url: '/blog/rss.xml', title: 'Seb Montgomery: research' }] }

export function absoluteUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** Short, stable hash for cache-busting share-card URLs when their content changes. */
export function shortHash(text: string) {
  let hash = 5381
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0
  return hash.toString(36)
}

type PageMetadataInput = {
  /** Path on the site, e.g. "/blog". Becomes the canonical link and og:url. */
  path: string
  title: Metadata['title']
  description: string
  image?: ShareImage
  type?: 'website' | 'article'
  robots?: Metadata['robots']
}

/** Canonical link plus complete Open Graph and X card tags for one page. */
export function pageMetadata({ path, title, description, image = SITE_SHARE_IMAGE, type = 'website', robots }: PageMetadataInput): Metadata {
  const url = absoluteUrl(path)
  return {
    title,
    description,
    alternates: { canonical: url, types: RSS_ALTERNATE },
    robots,
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      site: X_HANDLE,
      creator: X_HANDLE,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
  }
}

export function postUrl(post: Pick<Post, 'slug'>) {
  return `${SITE_URL}/blog/${post.slug}`
}

/** The later of the publish date and the Studio's Updated date (ISO string). */
export function postModifiedAt(post: Pick<Post, 'publishedAt' | '_updatedAt'>) {
  const published = post.publishedAt ? Date.parse(post.publishedAt) : NaN
  const updated = post._updatedAt ? Date.parse(post._updatedAt) : NaN
  if (Number.isNaN(updated) || (!Number.isNaN(published) && updated <= published)) return post.publishedAt
  return post._updatedAt
}

/**
 * An article's share image: the one set in the Studio's SEO tab, else its 1200 x 630 card from
 * app/og/blog/[slug]/route.tsx. The card URL carries a hash of what the card shows, so an edited
 * headline or cover gets a new URL and X or LinkedIn fetch it again.
 */
export function articleShareImage(post: Pick<Post, 'slug' | 'title' | 'publishedAt' | 'localMainImage' | 'category' | 'seo'>): ShareImage {
  const own = post.seo?.image
  if (own?.src) return { url: own.src, width: own.width, height: own.height, alt: own.alt || post.title }
  const version = shortHash([post.title, post.localMainImage?.src, post.localMainImage?.position, post.category?.title, post.publishedAt].join('|'))
  return { url: `/og/blog/${post.slug}?v=${version}`, width: 1200, height: 630, alt: post.title }
}

/** True when the Studio's Updated date is a later day than the publish date. */
export function postWasUpdated(post: Pick<Post, 'publishedAt' | '_updatedAt'>) {
  if (!post.publishedAt || !post._updatedAt) return false
  return post._updatedAt.slice(0, 10) > post.publishedAt.slice(0, 10)
}

/** Posts that belong in the sitemap, feed and search results (not noindex, not canonical elsewhere). */
export function isIndexablePost(post: Pick<Post, 'slug' | 'seo'>) {
  if (post.seo?.noindex) return false
  const canonical = post.seo?.canonicalUrl
  return !canonical || canonical.replace(/\/$/, '') === postUrl(post) || canonical === `/blog/${post.slug}`
}

/**
 * Serialises structured data for a <script type="application/ld+json"> tag.
 * "<" is escaped so text from articles can never close the script tag.
 */
export function jsonLdString(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
