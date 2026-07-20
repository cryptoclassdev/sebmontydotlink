import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { CategoryNav, PostCard } from '@/components/blog'
import { client } from '@/sanity/client'
import { categoriesQuery, categoryBySlugQuery, categorySlugsQuery, postsByCategoryQuery } from '@/sanity/queries'
import type { Category, Post } from '@/sanity/types'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(categorySlugsQuery).catch(() => [])
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await client.fetch<Category | null>(categoryBySlugQuery, { slug }).catch(() => null)
  return category
    ? { title: `${category.title} writing`, description: category.description || `Research about ${category.title}` }
    : { title: 'Category not found' }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [category, posts, categories] = await Promise.all([
    client.fetch<Category | null>(categoryBySlugQuery, { slug }).catch(() => null),
    client.fetch<Post[]>(postsByCategoryQuery, { slug }).catch(() => []),
    client.fetch<Category[]>(categoriesQuery).catch(() => []),
  ])
  if (!category) notFound()

  return (
    <div className="site-shell publication-category-page">
      <CategoryNav categories={categories} />
      <header>
        <Link className="publication-back-link" href="/blog"><ArrowLeft aria-hidden="true" /> All writing</Link>
        <span className="site-eyebrow">Category</span>
        <h1>{category.title}</h1>
        {category.description && <p>{category.description}</p>}
        <small>{category.postCount || posts.length} {category.postCount === 1 ? 'post' : 'posts'}</small>
      </header>
      {posts.length > 0 ? <div className="publication-category-page__posts">{posts.map((post) => <PostCard key={post._id} post={post} variant="list" />)}</div> : <div className="publication-empty"><strong>No posts here yet.</strong><p>Browse the full archive for published research.</p></div>}
    </div>
  )
}
