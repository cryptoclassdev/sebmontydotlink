import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { CategoryNav, FeaturedPost, PostCard } from '@/components/blog'
import { client } from '@/sanity/client'
import { categoriesQuery, featuredPostQuery, postsQuery } from '@/sanity/queries'
import type { Category, Post } from '@/sanity/types'

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Independent research on crypto, markets, and the products reshaping finance.',
}

export const revalidate = 60

type SearchParams = { sort?: string }

async function getData(sort = 'latest') {
  const [featuredPost, allPosts, categories] = await Promise.all([
    client.fetch<Post | null>(featuredPostQuery).catch(() => null),
    client.fetch<Post[]>(postsQuery).catch(() => []),
    client.fetch<Category[]>(categoriesQuery).catch(() => []),
  ])
  const remaining = allPosts.filter((post) => post._id !== featuredPost?._id)
  if (sort === 'top') remaining.sort((a, b) => (b.likes || 0) - (a.likes || 0))
  if (sort === 'discussions') remaining.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0))
  return { featuredPost, posts: remaining, categories }
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { sort } = await searchParams
  const { featuredPost, posts, categories } = await getData(sort)

  return (
    <>
      <header className="publication-intro site-shell">
        <div>
          <span className="site-eyebrow">Independent publication</span>
          <h1>Writing</h1>
          <p>Long-form research, sharp explainers, and practical notes from crypto markets.</p>
        </div>
        <Link className="site-button site-button--quiet" href="/blog/search"><Search aria-hidden="true" /> Search the archive</Link>
      </header>

      {categories.length > 0 && <div className="site-shell"><CategoryNav categories={categories} /></div>}

      <div className="site-shell publication-content">
        {featuredPost && (
          <section aria-labelledby="featured-post-title">
            <div className="site-section-heading site-section-heading--compact">
              <span className="site-eyebrow">Featured research</span>
            </div>
            <FeaturedPost post={featuredPost} />
          </section>
        )}

        <section className="publication-archive" aria-labelledby="latest-posts-title">
          <div className="site-section-heading">
            <div>
              <span className="site-eyebrow">Archive</span>
              <h2 id="latest-posts-title">Latest stories</h2>
            </div>
          </div>
          {posts.length > 0 ? (
            <div className="publication-archive__grid">
              {posts.map((post) => <PostCard key={post._id} post={post} variant="grid" />)}
            </div>
          ) : (
            <div className="publication-empty">
              <strong>The first piece is live.</strong>
              <p>More research will appear here as it is published.</p>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
