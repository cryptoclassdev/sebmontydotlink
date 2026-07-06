import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/client'
import type { Post } from '@/sanity/types'
import { EngagementBar } from './EngagementBar'

interface FeaturedPostProps {
  post: Post
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(800).height(500).url()
    : null

  return (
    <article className="group">
      <Link href={`/blog/${post.slug}`} className="grid md:grid-cols-2 gap-6 md:gap-8">
        {/* Image - Left side */}
        {imageUrl && (
          <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={post.mainImage?.alt || post.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content - Right side */}
        <div className="flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors leading-tight">
            {post.title}
          </h2>

          {post.subtitle && (
            <p className="text-lg text-gray-600 mt-2">{post.subtitle}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            {post.publishedAt && (
              <time className="uppercase tracking-wide">
                {formatDate(post.publishedAt)}
              </time>
            )}
            {post.publishedAt && post.author?.name && (
              <span className="text-gray-300">•</span>
            )}
            {post.author?.name && (
              <span className="text-gray-600">{post.author.name}</span>
            )}
          </div>

          {/* Engagement */}
          <div className="mt-4">
            <EngagementBar
              likes={post.likes}
              comments={post.commentCount}
              size="sm"
              showShare={false}
            />
          </div>
        </div>
      </Link>
    </article>
  )
}
