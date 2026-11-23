import 'server-only'

import { cache } from 'react'

import { mergeCategoryLists } from '@/lib/blog/merge-categories'
import type { Category, Post } from '@/lib/blog/types'
import { FILE_ARTICLES, FILE_CATEGORIES, getFileArticleMarkdown } from '@/lib/publishing'
import { isDatabaseConfigured } from '@/lib/studio/db'
import { studioArticleMarkdown } from '@/lib/studio/markdown'
import { getLiveStudioPosts, getStudioCategories, getStudioDraftPost } from '@/lib/studio/public'

// The one place the public site reads articles from.
// With the Studio's database connected, articles come from the Studio (docs/studio.md).
// Without it (local work, or before the database is set up) the site falls back to the
// Markdown files in content/articles/, so it never shows an empty blog.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sebmonty.link').replace(/\/$/, '')

function byDateDesc(a: Post, b: Post) {
  return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
}

const markdownPosts = () => FILE_ARTICLES.map((post) => ({ ...post, source: 'markdown' as const })).sort(byDateDesc)

/** Every live article, newest first, with bodies. */
export const getAllPosts = cache(async (): Promise<Post[]> => {
  if (!isDatabaseConfigured()) return markdownPosts()
  try {
    return await getLiveStudioPosts()
  } catch (error) {
    console.error('[blog] could not read articles from the Studio database; showing the Markdown articles', error)
    return markdownPosts()
  }
})

/** Article cards without bodies, small enough to send to the browser. */
export async function getPostCards(): Promise<Post[]> {
  return (await getAllPosts()).map(({ body: _body, ...card }) => card)
}

export async function getPost(slug: string): Promise<Post | null> {
  return (await getAllPosts()).find((post) => post.slug === slug) ?? null
}

/** A Studio draft, for signed-in editors previewing it (draft mode). */
export async function getDraftPreview(slug: string): Promise<Post | null> {
  if (!isDatabaseConfigured()) return null
  return getStudioDraftPost(slug)
}

/** Categories with post counts; categories with no posts yet are still listed. */
export async function getCategories(posts?: Post[]): Promise<Category[]> {
  const list = posts ?? (await getAllPosts())
  let categories = FILE_CATEGORIES
  if (isDatabaseConfigured()) {
    try {
      categories = await getStudioCategories()
    } catch {
      // keep the Markdown categories
    }
  }
  return mergeCategoryLists(categories, [], list)
}

/** The plain-Markdown copy of an article for AI agents, or null. */
export async function getArticleMarkdown(slug: string): Promise<string | null> {
  const post = await getPost(slug)
  if (!post) return null
  if (post.source === 'markdown') return getFileArticleMarkdown(slug)
  return studioArticleMarkdown(post, SITE_URL)
}

/** Posts to suggest under an article: same category first, then the newest. */
export async function getRelatedPosts(post: Post, count = 3): Promise<Post[]> {
  const others = (await getAllPosts()).filter((item) => item._id !== post._id)
  const sameCategory = others.filter((item) => item.category?.slug && item.category.slug === post.category?.slug)
  return [...sameCategory, ...others.filter((item) => !sameCategory.includes(item))].slice(0, count)
}

/** The homepage's "Latest research" card: the featured article if one is set, else the newest. */
export async function getHomepagePost(): Promise<Post | null> {
  const posts = await getAllPosts()
  return posts.find((post) => post.isFeatured) ?? posts[0] ?? null
}
