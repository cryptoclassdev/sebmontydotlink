import type { Post } from '@/lib/blog/types'

export function getPostPublishedAt(post: Post) {
  return post.publishedAt || post._updatedAt || ''
}

export function filterBlogPosts(posts: Post[], categorySlug?: string) {
  if (!categorySlug) return posts
  return posts.filter((post) => post.category?.slug === categorySlug)
}
