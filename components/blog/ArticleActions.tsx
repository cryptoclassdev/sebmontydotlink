'use client'

import { Check, Copy, Share2 } from 'lucide-react'
import { useState } from 'react'

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value)
  const area = document.createElement('textarea')
  area.value = value
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  area.remove()
}

export function ArticleActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url: window.location.href })
      else await copy()
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) throw error
    }
  }

  async function copy() {
    await copyText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="article-actions">
      <button type="button" onClick={share}><Share2 aria-hidden="true" /> Share article</button>
      <button type="button" onClick={copy}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied ? 'Copied' : 'Copy link'}</button>
      <span className="sr-only" role="status" aria-live="polite">{copied ? 'Article link copied' : ''}</span>
    </div>
  )
}
