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
      <div className="author-bio author-bio--compact">
        {imageUrl && (
          <div className="author-bio__image">
            <Image
              src={imageUrl}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <strong>{author.name}</strong>
          {author.xHandle && (
            <a
              href={`https://x.com/${author.xHandle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{author.xHandle}
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="author-bio">
      {imageUrl && (
        <div>
          <div className="author-bio__image author-bio__image--large">
            <Image
              src={imageUrl}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}
      <div className="author-bio__copy">
        <h3>{author.name}</h3>
        {author.bio && (
          <p>
            {author.bio}
          </p>
        )}
        {author.xHandle && (
          <a
            href={`https://x.com/${author.xHandle}`}
            target="_blank"
            rel="noopener noreferrer"
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
