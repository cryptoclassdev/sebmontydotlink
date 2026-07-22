import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { CategoryNav, FeaturedPost, PostCard } from '@/components/blog'
import { filterBlogPosts, mergeBlogPosts } from '@/lib/blog/catalog'
import { mergeBlogCategories } from '@/lib/blog/categories'
import { client } from '@/sanity/client'
import { categoriesQuery, postsQuery } from '@/sanity/queries'
import type { Category, Post } from '@/sanity/types'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Independent research on crypto, markets, and the products reshaping finance.',
}

export const revalidate = 60

type SearchParams = { category?: string }

async function getData(categorySlug?: string) {
  const [sanityPosts, sanityCategories] = await Promise.all([
    client.fetch<Post[]>(postsQuery).catch(() => []),
    client.fetch<Category[]>(categoriesQuery).catch(() => []),
  ])

  const allPosts = mergeBlogPosts(sanityPosts)
  const categories = mergeBlogCategories(sanityCategories, allPosts)
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
