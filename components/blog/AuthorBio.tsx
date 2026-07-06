import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/sanity/client'
import type { Author } from '@/sanity/types'

interface AuthorBioProps {
  author: Author
  variant?: 'default' | 'compact'
}

export function AuthorBio({ author, variant = 'default' }: AuthorBioProps) {
  const imageUrl = author.image
    ? urlFor(author.image).width(160).height(160).url()
    : null

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        {imageUrl && (
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <span className="font-medium text-gray-900">{author.name}</span>
          {author.xHandle && (
            <a
              href={`https://x.com/${author.xHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              @{author.xHandle}
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 md:gap-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
      {imageUrl && (
        <div className="flex-shrink-0">
          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900">{author.name}</h3>
        {author.bio && (
          <p className="text-gray-600 mt-1 text-sm md:text-base line-clamp-3">
            {author.bio}
          </p>
        )}
        {author.xHandle && (
          <a
            href={`https://x.com/${author.xHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @{author.xHandle}
          </a>
        )}
      </div>
    </div>
  )
}
