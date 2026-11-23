import { SearchClient } from '@/components/blog/SearchClient'
import { getCategories, getPostCards } from '@/lib/blog/source'
import { pageMetadata } from '@/lib/seo'

// Kept out of search results (it has no content of its own), but crawlers follow its links.
export const metadata = pageMetadata({
  path: '/blog/search',
  title: 'Search the blog',
  description: 'Search article titles, summaries, categories and authors on the blog.',
  robots: { index: false, follow: true },
})

export const revalidate = 60

export default async function SearchPage() {
  const posts = await getPostCards()
  const categories = await getCategories(posts)
  return <SearchClient posts={posts} categories={categories} />
}
