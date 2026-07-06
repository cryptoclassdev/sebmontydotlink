'use client'

import { Heart, ChatCircle, ArrowsClockwise, ShareNetwork } from '@phosphor-icons/react'

interface EngagementBarProps {
  likes?: number
  comments?: number
  restacks?: number
  onLike?: () => void
  onComment?: () => void
  onRestack?: () => void
  onShare?: () => void
  showShare?: boolean
  size?: 'sm' | 'md'
}

export function EngagementBar({
  likes = 0,
  comments = 0,
  restacks = 0,
  onLike,
  onComment,
  onRestack,
  onShare,
  showShare = true,
  size = 'md',
}: EngagementBarProps) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const gap = size === 'sm' ? 'gap-3' : 'gap-4'
  const buttonPadding = size === 'sm' ? 'p-1' : 'p-1.5'

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Likes */}
      <button
        onClick={onLike}
        className={`flex items-center gap-1.5 ${buttonPadding} text-gray-500 hover:text-red-500 transition-colors group`}
        aria-label={`Like (${likes})`}
      >
        <Heart
          className={`${iconSize} group-hover:fill-red-500`}
          weight="regular"
        />
        {likes > 0 && <span className={textSize}>{likes}</span>}
      </button>

      {/* Comments */}
      <button
        onClick={onComment}
        className={`flex items-center gap-1.5 ${buttonPadding} text-gray-500 hover:text-gray-900 transition-colors`}
        aria-label={`View comments (${comments})`}
      >
        <ChatCircle className={iconSize} weight="regular" />
        {comments > 0 && <span className={textSize}>{comments}</span>}
      </button>

      {/* Restacks */}
      <button
        onClick={onRestack}
        className={`flex items-center gap-1.5 ${buttonPadding} text-gray-500 hover:text-green-600 transition-colors`}
        aria-label={`Restack (${restacks})`}
      >
        <ArrowsClockwise className={iconSize} weight="regular" />
        {restacks > 0 && <span className={textSize}>{restacks}</span>}
      </button>

      {/* Share */}
      {showShare && (
        <button
          onClick={onShare}
          className={`flex items-center gap-1.5 ${buttonPadding} text-gray-500 hover:text-gray-900 transition-colors ml-auto`}
          aria-label="Share"
        >
          <ShareNetwork className={iconSize} weight="regular" />
          {size === 'md' && <span className={textSize}>Share</span>}
        </button>
      )}
    </div>
  )
}
