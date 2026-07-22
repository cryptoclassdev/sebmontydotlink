import { getArticleEditorialOverride } from '@/lib/blog/editorial-overrides'
import { STATIC_BLOG_POSTS } from '@/lib/blog/meteora-post'
import type { Post } from '@/sanity/types'

export function getPostPublishedAt(post: Post) {
  return getArticleEditorialOverride(post.slug)?.publishedAt || post.publishedAt || post._updatedAt || ''
}

export function mergeBlogPosts(posts: Post[]) {
  return [...STATIC_BLOG_POSTS, ...posts]
    .filter((post, index, items) => items.findIndex((candidate) => candidate.slug === post.slug) === index)
    .sort((a, b) => new Date(getPostPublishedAt(b) || 0).getTime() - new Date(getPostPublishedAt(a) || 0).getTime())
}

export function filterBlogPosts(posts: Post[], categorySlug?: string) {
  if (!categorySlug) return posts
  return posts.filter((post) => post.category?.slug === categorySlug)
}
