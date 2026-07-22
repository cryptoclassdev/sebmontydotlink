import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { PERMANENT_BLOG_CATEGORIES } from '@/lib/blog/categories'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return PERMANENT_BLOG_CATEGORIES.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = PERMANENT_BLOG_CATEGORIES.find((item) => item.slug === slug)

  return category
    ? {
        title: `${category.title} blog posts`,
        description: category.description || `Blog posts about ${category.title}`,
      }
    : { title: 'Blog' }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  redirect(`/blog?category=${encodeURIComponent(slug)}`)
}
