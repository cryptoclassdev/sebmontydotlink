import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/client'
import type { Post } from '@/sanity/types'
import { EngagementBar } from './EngagementBar'

interface PostCardProps {
  post: Post
  variant?: 'list' | 'grid' | 'compact'
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Within 7 days, show relative
  if (diffDays < 7) {
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  // This year, show month day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  // Different year, show full date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PostCard({ post, variant = 'grid' }: PostCardProps) {
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(400).height(250).url()
    : null

  // Compact variant for popular posts list
  if (variant === 'compact') {
    return (
      <article className="group py-3 first:pt-0 last:pb-0">
        <Link href={`/blog/${post.slug}`} className="block">
          <h4 className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
            {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
            {post.publishedAt && post.author?.name && <span>•</span>}
            {post.author?.name && <span>{post.author.name}</span>}
          </div>
          <div className="mt-2">
            <EngagementBar
              likes={post.likes}
              comments={post.commentCount}
              size="sm"
              showShare={false}
            />
          </div>
        </Link>
      </article>
    )
  }

  // List variant (horizontal layout)
  if (variant === 'list') {
    return (
      <article className="group py-5 first:pt-0 border-b border-gray-100 last:border-b-0">
        <Link href={`/blog/${post.slug}`} className="flex gap-4">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2">
              {post.title}
            </h3>
            {post.subtitle && (
              <p className="text-gray-600 mt-1 line-clamp-2 text-sm">
                {post.subtitle}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
              {post.publishedAt && post.author?.name && <span>•</span>}
              {post.author?.name && <span>{post.author.name}</span>}
            </div>
            <div className="mt-3">
              <EngagementBar
                likes={post.likes}
                comments={post.commentCount}
                size="sm"
                showShare={false}
              />
            </div>
          </div>

          {/* Thumbnail */}
          {imageUrl && (
            <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 relative rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={post.mainImage?.alt || post.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </Link>
      </article>
    )
  }

  // Grid variant (default - card layout like Substack)
  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Thumbnail */}
        {imageUrl && (
          <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3">
            <Image
              src={imageUrl}
              alt={post.mainImage?.alt || post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <h3 className="font-bold text-gray-900 group-hover:text-gray-600 transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h3>

        {post.subtitle && (
          <p className="text-gray-600 mt-1 line-clamp-2 text-sm">{post.subtitle}</p>
        )}

        {/* Meta */}
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2 text-xs text-gray-500">
          {post.publishedAt && (
            <time className="uppercase tracking-wide">
              {formatDate(post.publishedAt)}
            </time>
          )}
          {post.publishedAt && post.author?.name && (
            <span className="text-gray-300">•</span>
          )}
          {post.author?.name && <span>{post.author.name}</span>}
        </div>

        {/* Engagement */}
        <div className="mt-3">
          <EngagementBar
            likes={post.likes}
            comments={post.commentCount}
            size="sm"
            showShare={false}
          />
        </div>
      </Link>
    </article>
  )
}
