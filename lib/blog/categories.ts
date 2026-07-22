import { METEORA_CATEGORY } from '@/lib/blog/meteora-metadata'
import type { Category, Post } from '@/sanity/types'

export const STOCKS_CATEGORY: Category = {
  _id: 'built-in-category-stocks',
  title: 'Stocks',
  slug: 'stocks',
  description: 'Public companies, listed products, and the markets around them.',
  postCount: 0,
}

export const PERMANENT_BLOG_CATEGORIES = [STOCKS_CATEGORY, METEORA_CATEGORY]

export function mergeBlogCategories(categories: Category[], posts: Post[]) {
  const merged = new Map<string, Category>()

  for (const category of PERMANENT_BLOG_CATEGORIES) {
    merged.set(category.slug, { ...category, postCount: 0 })
  }

  for (const category of categories) {
    merged.set(category.slug, { ...merged.get(category.slug), ...category, postCount: 0 })
  }

  for (const post of posts) {
    const postCategory = post.category
    if (!postCategory?.slug) continue
    const slug = postCategory.slug
    const category = merged.get(slug) || postCategory
    merged.set(slug, { ...category, postCount: (merged.get(slug)?.postCount || 0) + 1 })
  }

  return [...merged.values()].sort((a, b) => {
    const order = ['stocks', 'solana']
    const aIndex = order.indexOf(a.slug)
    const bIndex = order.indexOf(b.slug)
    if (aIndex === -1 && bIndex === -1) return a.title.localeCompare(b.title)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })
}
