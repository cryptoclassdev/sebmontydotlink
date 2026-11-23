'use client'

import { Play } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { XPostMedia } from '@/lib/studio/xpost'

function duration(ms?: number) {
  if (!ms) return ''
  const seconds = Math.round(ms / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

/**
 * A video or GIF from an X post: the poster until the reader presses play, then the MP4 from X.
 * X's video server refuses requests that carry another site's address as the referrer, so the
 * file is fetched without one and played from memory (the same approach as the Breakpoint guide).
 */
export function XPostVideo({ media, postUrl }: { media: XPostMedia; postUrl: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [src, setSrc] = useState('')
  const gif = media.type === 'gif'

  useEffect(() => () => {
    if (src) URL.revokeObjectURL(src)
  }, [src])

  const play = async () => {
    if (!media.video || state === 'loading') return
    setState('loading')
    try {
      const response = await fetch(media.video, { referrerPolicy: 'no-referrer', credentials: 'omit' })
      if (!response.ok) throw new Error(String(response.status))
      setSrc(URL.createObjectURL(await response.blob()))
    } catch {
      setState('error')
    }
  }

  if (src) {
    return (
      <video
        className="article-xpost__video"
        src={src}
        poster={media.image}
        controls={!gif}
        autoPlay
        loop={gif}
        muted={gif}
        playsInline
        width={media.width}
        height={media.height}
      />
    )
  }

  if (state === 'error') {
    return (
      <a className="article-xpost__poster" href={postUrl} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.image} alt={media.alt || ''} width={media.width} height={media.height} loading="lazy" referrerPolicy="no-referrer" />
        <span className="article-xpost__badge">Watch on X</span>
      </a>
    )
  }

  return (
    <button
      type="button"
      className="article-xpost__poster"
      onClick={play}
      disabled={!media.video}
      aria-busy={state === 'loading'}
      aria-label={gif ? 'Play GIF' : `Play video${media.durationMs ? `, ${duration(media.durationMs)}` : ''}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media.image} alt={media.alt || ''} width={media.width} height={media.height} loading="lazy" referrerPolicy="no-referrer" />
      <span className={state === 'loading' ? 'article-xpost__play article-xpost__play--loading' : 'article-xpost__play'} aria-hidden="true">
        <Play />
      </span>
      {gif ? <span className="article-xpost__badge">GIF</span> : media.durationMs ? <span className="article-xpost__badge">{duration(media.durationMs)}</span> : null}
    </button>
  )
}
