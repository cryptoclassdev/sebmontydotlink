'use client'

import { Check, Copy, ExternalLink, Mail, Share2, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

type CopyStatus = 'idle' | 'copying' | 'copied' | 'error'

function withTimeout(promise: Promise<void>, timeoutMs: number) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('Clipboard request timed out.')), timeoutMs)
    promise.then(
      () => {
        window.clearTimeout(timeout)
        resolve()
      },
      (error) => {
        window.clearTimeout(timeout)
        reject(error)
      },
    )
  })
}

async function copyText(value: string) {
  let clipboardError: unknown
  if (navigator.clipboard?.writeText) {
    try {
      await withTimeout(navigator.clipboard.writeText(value), 900)
      return
    } catch (error) {
      clipboardError = error
    }
  }

  const area = document.createElement('textarea')
  area.value = value
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  let copied = false
  try {
    copied = document.execCommand('copy')
  } finally {
    area.remove()
  }
  if (!copied) throw clipboardError || new Error('The article link could not be copied.')
}

export function ArticleActions({ title }: { title: string }) {
  const menuId = useId()
  const [menuOpen, setMenuOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [nativeShareAvailable, setNativeShareAvailable] = useState(false)
  const [nativeSharePending, setNativeSharePending] = useState(false)
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const [announcement, setAnnouncement] = useState('')
  const copyResetTimer = useRef<number | null>(null)

  useEffect(() => {
    setShareUrl(window.location.href)
    setNativeShareAvailable(typeof navigator.share === 'function')
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => () => {
    if (copyResetTimer.current) window.clearTimeout(copyResetTimer.current)
  }, [])

  function resetCopyAfterDelay() {
    if (copyResetTimer.current) window.clearTimeout(copyResetTimer.current)
    copyResetTimer.current = window.setTimeout(() => {
      copyResetTimer.current = null
      setCopyStatus('idle')
      setAnnouncement('')
    }, 2200)
  }

  async function copy() {
    if (copyResetTimer.current) window.clearTimeout(copyResetTimer.current)
    setCopyStatus('copying')
    setAnnouncement('Copying article link')
    try {
      await copyText(shareUrl || window.location.href)
      setCopyStatus('copied')
      setAnnouncement('Article link copied')
      resetCopyAfterDelay()
    } catch {
      setCopyStatus('error')
      setAnnouncement('Clipboard access is blocked. The article link is ready to copy manually.')
      setMenuOpen(true)
    }
  }

  async function openNativeShare() {
    if (!navigator.share) {
      await copy()
      return
    }

    setNativeSharePending(true)
    setAnnouncement('Opening device share options')
    try {
      await navigator.share({ title, text: title, url: shareUrl || window.location.href })
      setAnnouncement('Article shared')
      setMenuOpen(false)
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) await copy()
    } finally {
      setNativeSharePending(false)
    }
  }

  const copyLabel = copyStatus === 'copying'
    ? 'Copying…'
    : copyStatus === 'copied'
      ? 'Copied'
      : copyStatus === 'error'
        ? 'Copy manually'
        : 'Copy link'
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className="article-actions">
      <button
        type="button"
        onClick={() => {
          setMenuOpen((open) => !open)
          setAnnouncement(menuOpen ? '' : 'Share options opened')
        }}
        aria-expanded={menuOpen}
        aria-controls={menuId}
      >
        <Share2 aria-hidden="true" /> Share article
      </button>
      <button type="button" onClick={copy} disabled={copyStatus === 'copying'}>
        {copyStatus === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copyLabel}
      </button>

      {menuOpen && (
        <div id={menuId} className="article-share-menu" role="dialog" aria-label="Share article">
          <div className="article-share-menu__header">
            <strong>Share this article</strong>
            <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close share options"><X aria-hidden="true" /></button>
          </div>
          <div className="article-share-menu__options">
            <a href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" /> Share on X
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" /> LinkedIn
            </a>
            <a href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}>
              <Mail aria-hidden="true" /> Email
            </a>
            {nativeShareAvailable && (
              <button type="button" onClick={openNativeShare} disabled={nativeSharePending}>
                <Share2 aria-hidden="true" /> {nativeSharePending ? 'Opening…' : 'Device options'}
              </button>
            )}
            <button type="button" onClick={copy} disabled={copyStatus === 'copying'}>
              {copyStatus === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copyLabel}
            </button>
          </div>
          {copyStatus === 'error' && (
            <label className="article-share-menu__manual">
              <span>Copy this link manually</span>
              <input readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()} />
            </label>
          )}
        </div>
      )}

      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </div>
  )
}
