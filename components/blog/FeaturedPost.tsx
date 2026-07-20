import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { urlFor } from '@/sanity/client'
import type { Post } from '@/sanity/types'

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function FeaturedPost({ post }: { post: Post }) {
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1400).height(900).fit('crop').auto('format').url()
    : null
  return (
    <article className="publication-feature">
      <Link href={`/blog/${post.slug}`}>
        {imageUrl && (
          <div className="publication-feature__image">
            <Image src={imageUrl} alt={post.mainImage?.alt || ''} fill priority sizes="(min-width: 900px) 50vw, calc(100vw - 40px)" className="object-cover" />
          </div>
        )}
        <div className="publication-feature__copy">
          <span className="publication-kicker">{post.category?.title || 'Research'}</span>
          <h2 id="featured-post-title">{post.title}</h2>
          <p>{post.subtitle || post.excerpt}</p>
          <div className="publication-meta">
            <span>{formatDate(post.publishedAt || post._updatedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime || 5} min read</span>
          </div>
          <span className="publication-read-link">Read the feature <ArrowUpRight aria-hidden="true" /></span>
        </div>
      </Link>
    </article>
  )
}
