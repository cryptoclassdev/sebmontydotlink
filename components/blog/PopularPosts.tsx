import Link from 'next/link'
import type { Post } from '@/sanity/types'
import { PostCard } from './PostCard'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'

interface PopularPostsProps {
  posts: Post[]
  variant?: 'horizontal' | 'vertical'
}

export function PopularPosts({ posts, variant = 'horizontal' }: PopularPostsProps) {
  if (!posts?.length) return null

  if (variant === 'vertical') {
    return (
      <div className="divide-y divide-gray-100">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} variant="compact" />
        ))}
      </div>
    )
  }

  // Horizontal scrollable carousel (like Substack's Most Popular)
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Most Popular
        </h3>
        <Link
          href="/blog?sort=top"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {posts.map((post) => (
          <div key={post._id} className="flex-shrink-0 w-64">
            <PostCard post={post} variant="compact" />
          </div>
        ))}
      </div>
    </div>
  )
}
