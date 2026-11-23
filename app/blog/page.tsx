import Link from 'next/link'
import { Search } from 'lucide-react'

import { CategoryNav, FeaturedPost, PostCard } from '@/components/blog'
import { filterBlogPosts } from '@/lib/blog/catalog'
import { getCategories, getPostCards } from '@/lib/blog/source'
import { pageMetadata } from '@/lib/seo'

// /blog?category=... keeps /blog as its canonical, so filtered views don't compete with it.
export const metadata = pageMetadata({
  path: '/blog',
  title: 'Blog',
  description: 'Long-form research on crypto markets, exchanges, DeFi and Solana by Seb Montgomery, with dated figures and a linked Sources list in every article.',
})

export const revalidate = 60

type SearchParams = { category?: string }

async function getData(categorySlug?: string) {
  const allPosts = await getPostCards()
  const categories = await getCategories(allPosts)
  const activeCategory = categories.some((category) => category.slug === categorySlug) ? categorySlug : undefined
  const filteredPosts = filterBlogPosts(allPosts, activeCategory)

  return {
    activeCategory,
    categories,
    leadPost: filteredPosts[0] || null,
    posts: filteredPosts.slice(1),
  }
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { category } = await searchParams
  const { activeCategory, categories, leadPost, posts } = await getData(category)

  return (
    <>
      <header className="publication-intro site-shell">
        <div>
          <h1>Blog</h1>
          <p>Long-form research, sharp explainers, and practical notes from crypto markets.</p>
        </div>
        <Link className="site-button site-button--quiet" href="/blog/search"><Search aria-hidden="true" /> Search the archive</Link>
      </header>

      <div className="publication-category-dock">
        <div className="site-shell">
          <CategoryNav categories={categories} activeCategory={activeCategory} />
        </div>
      </div>

      <div className="site-shell publication-content">
        {leadPost && (
          <section aria-labelledby="latest-story-title">
            <FeaturedPost post={leadPost} headingId="latest-story-title" />
          </section>
        )}

        {posts.length > 0 && (
          <section className="publication-archive" aria-labelledby="more-stories-title">
            <div className="site-section-heading">
              <div>
                <span className="site-eyebrow">Archive</span>
                <h2 id="more-stories-title">More stories</h2>
              </div>
            </div>
            <div className="publication-archive__grid">
              {posts.map((post) => <PostCard key={post._id} post={post} variant="grid" />)}
            </div>
          </section>
        )}

        {!leadPost && (
          <div className="publication-empty">
            <strong>No stories here yet.</strong>
            <p>Choose All to see every published story.</p>
          </div>
        )}
      </div>
    </>
  )
}
