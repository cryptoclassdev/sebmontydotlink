'use client'

import { useEffect, useRef, useState } from 'react'

import { listMediaAction } from '@/app/studio/actions'
import type { MediaItem } from '@/lib/studio/media'

import { Dialog } from './Dialog'
import { ACCEPTED_IMAGES, uploadImage, type UploadMode } from './upload'

/** Pick an image from the media library, or upload a new one. */
export function MediaPicker({
  open,
  onClose,
  onPick,
  uploadMode,
}: {
  open: boolean
  onClose: () => void
  onPick: (item: MediaItem) => void
  uploadMode: UploadMode
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const timer = setTimeout(() => {
      listMediaAction(query).then((rows) => {
        if (!cancelled) setItems(rows)
      })
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [open, query])

  useEffect(() => {
    if (!open) {
      setSelected(null)
      setError('')
    }
  }, [open])

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setError('')
    try {
      let last: MediaItem | null = null
      for (const file of Array.from(files)) last = await uploadImage(file, uploadMode)
      const rows = await listMediaAction(query)
      setItems(rows)
      if (last) setSelected(last.id)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const chosen = items?.find((item) => item.id === selected) ?? null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Choose an image"
      wide
      footer={
        <>
          <button type="button" className="st-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="st-btn primary" disabled={!chosen} onClick={() => chosen && onPick(chosen)}>
            Use this image
          </button>
        </>
      }
    >
      <div className="st-row" style={{ marginBottom: 14 }}>
        <input
          type="search"
          className="st-input"
          placeholder="Search by file name, alt text or caption"
          aria-label="Search images"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <input ref={fileRef} type="file" accept={ACCEPTED_IMAGES} multiple hidden onChange={(event) => onFiles(event.target.files)} />
        <button type="button" className="st-btn" disabled={uploading || uploadMode === 'off'} onClick={() => fileRef.current?.click()}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {uploadMode === 'off' && <div className="st-banner info" style={{ margin: '0 0 12px' }}>Uploads need a Vercel Blob store (see docs/studio.md).</div>}
      {error && (
        <div className="st-banner error" role="alert" style={{ margin: '0 0 12px' }}>
          {error}
        </div>
      )}
      {!items ? (
        <p className="st-hint">Loading…</p>
      ) : items.length === 0 ? (
        <p className="st-hint">No images yet. Upload one.</p>
      ) : (
        <div className="st-mediagrid">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="st-mediacard"
              aria-pressed={item.id === selected}
              onClick={() => setSelected(item.id)}
              onDoubleClick={() => onPick(item)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.alt} loading="lazy" />
              <span title={item.filename}>{item.filename}</span>
              {!item.alt && <span className="st-noalt">No alt text</span>}
            </button>
          ))}
        </div>
      )}
    </Dialog>
  )
}
