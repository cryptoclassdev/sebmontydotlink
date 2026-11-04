import type { Category, Post } from '@/sanity/types'

// Pure helper (safe to use in client components): merges the permanent category list,
// categories from Sanity and post counts into one sorted list.
export function mergeCategoryLists(permanent: Category[], categories: Category[], posts: Post[]) {
  const merged = new Map<string, Category>()

  for (const category of permanent) {
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
