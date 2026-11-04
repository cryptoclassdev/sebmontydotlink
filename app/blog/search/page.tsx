import type { Metadata } from 'next'

import { SearchClient } from '@/components/blog/SearchClient'
import { PERMANENT_BLOG_CATEGORIES } from '@/lib/blog/categories'
import { getFileArticleCards } from '@/lib/publishing'

export const metadata: Metadata = {
  title: 'Search the blog',
  description: 'Search published titles and article text.',
}

export default function SearchPage() {
  return <SearchClient localPosts={getFileArticleCards()} permanentCategories={PERMANENT_BLOG_CATEGORIES} />
}
