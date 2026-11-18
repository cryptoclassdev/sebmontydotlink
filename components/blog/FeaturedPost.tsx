import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import type { Post } from '@/lib/blog/types'

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function FeaturedPost({ post, headingId = 'featured-post-title' }: { post: Post; headingId?: string }) {
  const imageUrl = post.localMainImage?.src || null
  const imageAlt = post.localMainImage?.alt || ''
  return (
    <article className="publication-feature">
      <Link href={`/blog/${post.slug}`}>
        {imageUrl && (
          <div className="publication-feature__image">
            <Image src={imageUrl} alt={imageAlt} fill priority sizes="(min-width: 900px) 50vw, calc(100vw - 40px)" className="object-cover" style={post.localMainImage?.position ? { objectPosition: post.localMainImage.position } : undefined} />
          </div>
        )}
        <div className="publication-feature__copy">
          <span className="publication-kicker">{post.status === 'draft' ? 'Draft · ' : ''}{post.category?.title || 'Research'}</span>
          <h2 id={headingId}>{post.title}</h2>
          <p>{post.subtitle || post.excerpt}</p>
          <div className="publication-meta">
            <span>{formatDate(post.publishedAt || post._updatedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime || 5} min read</span>
          </div>
          <span className="publication-read-link">Read the story <ArrowUpRight aria-hidden="true" /></span>
        </div>
      </Link>
    </article>
  )
}
