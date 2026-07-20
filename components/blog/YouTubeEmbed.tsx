import { ExternalLink } from 'lucide-react'

import type { PortableTextBlock } from '@/sanity/types'

function youtubeVideoId(value?: string) {
  if (!value) return null
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value

  const validId = (candidate?: string | null) =>
    candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate) ? candidate : null

  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') return validId(url.pathname.split('/').filter(Boolean)[0])
    if (host === 'youtube.com' || host === 'youtube-nocookie.com' || host.endsWith('.youtube.com')) {
      if (url.searchParams.get('v')) return validId(url.searchParams.get('v'))
      const [, id] = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/) || []
      return validId(id)
    }
  } catch {
    return null
  }

  return null
}

export function YouTubeEmbed({ value }: { value: PortableTextBlock }) {
  const videoId = youtubeVideoId(value.url)
  if (!videoId) return null

  const title = value.title || 'YouTube video'
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`

  return (
    <figure className="article-video">
      <div className="article-video__frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <figcaption>
        {value.caption && <span>{value.caption}</span>}
        <a href={watchUrl} target="_blank" rel="noopener noreferrer">
          Watch on YouTube <ExternalLink aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  )
}
