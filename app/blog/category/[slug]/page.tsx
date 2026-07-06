import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { client } from '@/sanity/client'
import {
  categoryBySlugQuery,
  postsByCategoryQuery,
  categorySlugsQuery,
  categoriesQuery,
} from '@/sanity/queries'
import type { Post, Category } from '@/sanity/types'
import { PostCard, CategoryNav } from '@/components/blog'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(categorySlugsQuery)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await client.fetch<Category>(categoryBySlugQuery, { slug })

  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: `${category.title} | Blog | Seb Montgomery`,
    description: category.description || `Posts about ${category.title}`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params

  const [category, posts, allCategories] = await Promise.all([
    client.fetch<Category>(categoryBySlugQuery, { slug }),
    client.fetch<Post[]>(postsByCategoryQuery, { slug }),
    client.fetch<Category[]>(categoriesQuery),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Category Navigation */}
      <CategoryNav categories={allCategories} />

      {/* Category Header */}
      <header className="mt-8 mb-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" weight="bold" />
          <span className="text-sm">All Posts</span>
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {category.title}
        </h1>

        {category.description && (
          <p className="text-white/60 mt-3 max-w-2xl">{category.description}</p>
        )}

        <p className="text-white/40 text-sm mt-4">
          {category.postCount} {category.postCount === 1 ? 'post' : 'posts'}
        </p>
      </header>

      {/* Posts */}
      <div className="max-w-3xl">
        {posts && posts.length > 0 ? (
          <div className="divide-y divide-white/10">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-white/50">No posts in this category yet.</p>
        )}
      </div>
    </div>
  )
}
