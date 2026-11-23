import type { Metadata } from 'next'

import { SearchClient } from '@/components/blog/SearchClient'
import { getCategories, getPostCards } from '@/lib/blog/source'

export const metadata: Metadata = {
  title: 'Search the blog',
  description: 'Search published titles and article text.',
}

export const revalidate = 60

export default async function SearchPage() {
  const posts = await getPostCards()
  const categories = await getCategories(posts)
  return <SearchClient posts={posts} categories={categories} />
}
