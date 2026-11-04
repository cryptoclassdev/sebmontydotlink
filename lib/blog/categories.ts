import { mergeCategoryLists } from '@/lib/blog/merge-categories'
import { FILE_CATEGORIES } from '@/lib/publishing'
import type { Category, Post } from '@/sanity/types'

/** Categories from content/categories.yml; always listed, even before they have posts. */
export const PERMANENT_BLOG_CATEGORIES: Category[] = FILE_CATEGORIES

export function mergeBlogCategories(categories: Category[], posts: Post[]) {
  return mergeCategoryLists(PERMANENT_BLOG_CATEGORIES, categories, posts)
}
