import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { urlFor } from '@/sanity/client'
import type { Post } from '@/sanity/types'

type PostCardProps = { post: Post; variant?: 'list' | 'grid' | 'compact' }

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function PostCard({ post, variant = 'grid' }: PostCardProps) {
  const imageUrl = post.mainImage ? urlFor(post.mainImage).width(900).height(600).fit('crop').auto('format').url() : null
  return (
    <article className={`publication-card publication-card--${variant}`}>
      <Link href={`/blog/${post.slug}`}>
        {imageUrl && (
          <div className="publication-card__image">
            <Image src={imageUrl} alt={post.mainImage?.alt || ''} fill sizes={variant === 'list' ? '180px' : '(min-width: 900px) 30vw, calc(100vw - 40px)'} className="object-cover" />
          </div>
        )}
        <div className="publication-card__copy">
          <span className="publication-kicker">{post.category?.title || 'Research'}</span>
          <h3>{post.title}</h3>
          {variant !== 'compact' && <p>{post.excerpt || post.subtitle}</p>}
          <div className="publication-meta">
            <span>{formatDate(post.publishedAt || post._updatedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime || 5} min read</span>
          </div>
        </div>
        <ArrowUpRight className="publication-card__arrow" aria-hidden="true" />
      </Link>
    </article>
  )
}
