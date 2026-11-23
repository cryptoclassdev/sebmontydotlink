import { ExternalLink } from 'lucide-react'

import type { XPostMedia, XPostSnapshot } from '@/lib/studio/xpost'

import { XPostVideo } from './XPostVideo'

// An X post in an article, drawn from the copy the Studio saved (lib/studio/xpost.ts).
// No X script runs; images and videos load from X's servers, without sending our address as the referrer.

function postDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function Text({ post, plain }: { post: XPostSnapshot; plain?: boolean }) {
  if (!post.text.length) return null
  return (
    <p className="article-xpost__text">
      {post.text.map((segment, index) =>
        segment.href && !plain ? (
          <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer nofollow">
            {segment.text}
          </a>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </p>
  )
}

function Media({ media, postUrl }: { media: XPostMedia[]; postUrl: string }) {
  if (!media.length) return null
  const single = media.length === 1
  return (
    <div className={`article-xpost__media article-xpost__media--${Math.min(media.length, 4)}`}>
      {media.map((item, index) => (
        <div
          key={index}
          className="article-xpost__media-item"
          style={single ? { aspectRatio: `${item.width} / ${item.height}` } : undefined}
        >
          {item.type === 'photo' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt={item.alt || ''} width={item.width} height={item.height} loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <XPostVideo media={item} postUrl={postUrl} />
          )}
        </div>
      ))}
    </div>
  )
}

function Author({ post, small }: { post: XPostSnapshot; small?: boolean }) {
  const { author } = post
  return (
    <div className={`article-xpost__author${small ? ' article-xpost__author--small' : ''}`}>
      {author.avatar && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={author.square ? 'article-xpost__avatar article-xpost__avatar--square' : 'article-xpost__avatar'}
          src={author.avatar}
          alt=""
          width={small ? 24 : 44}
          height={small ? 24 : 44}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
      <span className="article-xpost__names">
        <strong>{author.name || author.handle}</strong>
        <span>@{author.handle}</span>
      </span>
    </div>
  )
}

export function XPostCard({ post }: { post: XPostSnapshot }) {
  const date = postDate(post.createdAt)
  return (
    <figure className="article-xpost">
      <Author post={post} />
      <Text post={post} />
      {post.truncated && (
        <a className="article-xpost__more" href={post.url} target="_blank" rel="noopener noreferrer">
          Read the full post on X
        </a>
      )}
      <Media media={post.media} postUrl={post.url} />
      {post.card && (
        <a className={`article-xpost__card${post.card.large ? ' article-xpost__card--large' : ''}`} href={post.card.url} target="_blank" rel="noopener noreferrer nofollow">
          {post.card.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.card.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
          )}
          <span className="article-xpost__card-body">
            <span className="article-xpost__card-domain">{post.card.domain}</span>
            {post.card.title && <strong>{post.card.title}</strong>}
            {post.card.description && <span>{post.card.description}</span>}
          </span>
        </a>
      )}
      {post.quoted && (
        <a className="article-xpost__quoted" href={post.quoted.url} target="_blank" rel="noopener noreferrer">
          <Author post={post.quoted} small />
          {/* The whole quoted post is one link, so its own links show as text */}
          <Text post={post.quoted} plain />
          <Media media={post.quoted.media.filter((item) => item.type === 'photo')} postUrl={post.quoted.url} />
        </a>
      )}
      <figcaption className="article-xpost__footer">
        {date && <time dateTime={post.createdAt || undefined}>{date}</time>}
        <a href={post.url} target="_blank" rel="noopener noreferrer">
          View on X <ExternalLink aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  )
}

/** The article block. Without a saved copy (should not happen once published) it falls back to a link. */
export function XPostEmbed({ value }: { value: { url?: string; post?: XPostSnapshot } }) {
  if (value.post?.id) return <XPostCard post={value.post} />
  if (!value.url) return null
  return (
    <p className="article-xpost-link">
      <a href={value.url} target="_blank" rel="noopener noreferrer">
        View the post on X <ExternalLink aria-hidden="true" />
      </a>
    </p>
  )
}
