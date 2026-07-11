'use client'

import Image from 'next/image'
import { ChevronLeft, ChevronRight, Expand, RotateCcw, X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import type { ArticleGalleryImage } from '@/lib/blog/article-content'

type GalleryContextValue = { open: (index: number, trigger: HTMLElement) => void }
const GalleryContext = createContext<GalleryContextValue | null>(null)

export function ArticleGalleryProvider({ images, children }: { images: ArticleGalleryImage[]; children: React.ReactNode }) {
  const [active, setActive] = useState<number | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const triggerRef = useRef<HTMLElement | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  const close = useCallback(() => {
    setActive(null)
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }, [])

  const move = useCallback((direction: number) => {
    setActive((current) => current === null || images.length < 2
      ? current
      : (current + direction + images.length) % images.length)
    setState('loading')
  }, [images.length])

  const open = useCallback((index: number, trigger: HTMLElement) => {
    triggerRef.current = trigger
    setState('loading')
    setActive(index)
  }, [])

  useEffect(() => {
    if (active === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowLeft') move(-1)
      if (event.key === 'ArrowRight') move(1)
      if (event.key !== 'Tab' || !dialogRef.current) return
      const controls = [...dialogRef.current.querySelectorAll<HTMLElement>('button, a[href]')]
        .filter((element) => !element.hasAttribute('disabled'))
      if (!controls.length) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [active, close, move])

  const context = useMemo(() => ({ open }), [open])
  const image = active === null ? null : images[active]

  return (
    <GalleryContext.Provider value={context}>
      {children}
      {image && (
        <div className="article-lightbox" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) close()
        }}>
          <div className="article-lightbox__dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Article image viewer">
            <div className="article-lightbox__topbar">
              <span>{active! + 1} / {images.length}</span>
              <button ref={closeRef} type="button" onClick={close} aria-label="Close image viewer"><X aria-hidden="true" /></button>
            </div>
            <div className="article-lightbox__stage">
              {state === 'loading' && <div className="article-lightbox__state" role="status">Loading image…</div>}
              {state === 'error' && (
                <div className="article-lightbox__state">
                  <p>This image could not be loaded.</p>
                  <button type="button" onClick={() => setState('loading')}><RotateCcw aria-hidden="true" /> Try again</button>
                </div>
              )}
              <Image
                key={`${image.src}-${state}`}
                src={image.src}
                alt={image.alt}
                fill
                unoptimized
                sizes="100vw"
                onLoad={() => setState('ready')}
                onError={() => setState('error')}
                className={state === 'ready' ? 'is-ready' : ''}
              />
              {images.length > 1 && (
                <>
                  <button className="article-lightbox__nav article-lightbox__nav--previous" type="button" onClick={() => move(-1)} aria-label="Previous image"><ChevronLeft aria-hidden="true" /></button>
                  <button className="article-lightbox__nav article-lightbox__nav--next" type="button" onClick={() => move(1)} aria-label="Next image"><ChevronRight aria-hidden="true" /></button>
                </>
              )}
            </div>
            {image.caption && <p className="article-lightbox__caption">{image.caption}</p>}
          </div>
        </div>
      )}
    </GalleryContext.Provider>
  )
}

export function ArticleImageTrigger({ image, index, hero = false, priority = false }: {
  image: ArticleGalleryImage
  index: number
  hero?: boolean
  priority?: boolean
}) {
  const gallery = useContext(GalleryContext)
  return (
    <button
      type="button"
      className={hero ? 'article-image-trigger article-image-trigger--hero' : 'article-image-trigger'}
      aria-haspopup="dialog"
      aria-label={`Enlarge ${image.caption || image.alt}`}
      onClick={(event) => gallery?.open(index, event.currentTarget)}
    >
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        priority={priority}
        unoptimized
        sizes={hero
          ? '(min-width: 960px) 880px, calc(100vw - 40px)'
          : '(min-width: 960px) 820px, (min-width: 700px) calc(100vw - 96px), calc(100vw - 32px)'}
      />
      <span className="article-image-trigger__badge"><Expand aria-hidden="true" /><span>Open image</span></span>
    </button>
  )
}
