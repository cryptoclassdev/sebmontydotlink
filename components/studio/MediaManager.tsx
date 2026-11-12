'use client'

import { useMemo, useRef, useState, useTransition } from 'react'

import { deleteMediaAction, listMediaAction, updateMediaAction } from '@/app/studio/actions'
import type { MediaItem } from '@/lib/studio/media'

import { Dialog } from './Dialog'
import { formatBytes, formatDate } from './format'
import { ACCEPTED_IMAGES, uploadImage, type UploadMode } from './upload'

export function MediaManager({ initialItems, uploadMode }: { initialItems: MediaItem[]; uploadMode: UploadMode }) {
  const [items, setItems] = useState(initialItems)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<MediaItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => [item.filename, item.alt, item.caption].some((text) => text.toLowerCase().includes(term)))
  }, [items, query])

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setError('')
    try {
      for (const file of Array.from(files)) await uploadImage(file, uploadMode)
      setItems(await listMediaAction())
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const missingAlt = items.filter((item) => !item.alt).length

  return (
    <main className="st-page">
      <div className="st-page-head">
        <div>
          <h1>Media</h1>
          <p>
            {items.length} images{missingAlt ? ` · ${missingAlt} without alt text` : ''}. Alt text and captions written here are filled in when you add the
            image to a post.
          </p>
        </div>
        <div className="st-row">
          <input type="search" className="st-input" placeholder="Search" aria-label="Search media" value={query} onChange={(event) => setQuery(event.target.value)} />
          <input ref={fileRef} type="file" accept={ACCEPTED_IMAGES} multiple hidden onChange={(event) => onFiles(event.target.files)} />
          <button type="button" className="st-btn primary" disabled={uploading || uploadMode === 'off'} onClick={() => fileRef.current?.click()}>
            {uploading ? 'Uploading…' : 'Upload images'}
          </button>
        </div>
      </div>
      {uploadMode === 'off' && <div className="st-banner info" style={{ margin: '0 0 16px' }}>Uploads need a Vercel Blob store (see docs/studio.md).</div>}
      {uploadMode === 'dev' && (
        <div className="st-banner info" style={{ margin: '0 0 16px' }}>
          Local mode: uploads are saved in public/studio-uploads on this computer, not in Vercel Blob.
        </div>
      )}
      {error && (
        <div className="st-banner error" role="alert" style={{ margin: '0 0 16px' }}>
          {error}
        </div>
      )}
      <div className="st-mediagrid">
        {visible.map((item) => (
          <button key={item.id} type="button" className="st-mediacard" onClick={() => setEditing(item)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt} loading="lazy" />
            <span title={item.filename}>{item.filename}</span>
            {!item.alt && <span className="st-noalt">No alt text</span>}
          </button>
        ))}
      </div>
      {!visible.length && <p className="st-hint">No images{query ? ' match' : ' yet'}.</p>}
      <MediaDialog
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={(saved) => setItems((list) => list.map((item) => (item.id === saved.id ? saved : item)))}
        onDeleted={(id) => setItems((list) => list.filter((item) => item.id !== id))}
      />
    </main>
  )
}

function MediaDialog({
  item,
  onClose,
  onSaved,
  onDeleted,
}: {
  item: MediaItem | null
  onClose: () => void
  onSaved: (item: MediaItem) => void
  onDeleted: (id: string) => void
}) {
  const [details, setDetails] = useState({ alt: '', caption: '', credit: '', creditUrl: '' })
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  if (item && loadedFor !== item.id) {
    setLoadedFor(item.id)
    setDetails({ alt: item.alt, caption: item.caption, credit: item.credit, creditUrl: item.creditUrl })
    setError('')
  }

  const set = (name: keyof typeof details) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDetails({ ...details, [name]: event.target.value })

  return (
    <Dialog
      open={Boolean(item)}
      onClose={() => {
        setLoadedFor(null)
        onClose()
      }}
      title="Image details"
      wide
      onSubmit={() =>
        item &&
        startTransition(async () => {
          const result = await updateMediaAction(item.id, details)
          if (!result.ok) return setError(result.error)
          onSaved(result.item)
          setLoadedFor(null)
          onClose()
        })
      }
      footer={
        <>
          <button
            type="button"
            className="st-btn danger"
            style={{ marginRight: 'auto' }}
            disabled={pending}
            onClick={() =>
              item &&
              confirm('Delete this image from the library? It cannot be undone.') &&
              startTransition(async () => {
                const result = await deleteMediaAction(item.id)
                if (!result.ok) return setError(result.error)
                onDeleted(item.id)
                setLoadedFor(null)
                onClose()
              })
            }
          >
            Delete
          </button>
          <button type="button" className="st-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="st-btn primary" disabled={pending}>
            Save
          </button>
        </>
      }
    >
      {item && (
        <div className="st-grid-2">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" style={{ width: '100%', borderRadius: 6, background: 'var(--st-sunken)' }} />
            <p className="st-hint" style={{ marginTop: 8 }}>
              {item.filename} · {item.width && item.height ? `${item.width} × ${item.height} · ` : ''}
              {formatBytes(item.size)} · added {formatDate(item.createdAt)}
            </p>
            <button type="button" className="st-btn small" onClick={() => navigator.clipboard.writeText(new URL(item.url, window.location.origin).toString())}>
              Copy link
            </button>
          </div>
          <div>
            <div className="st-field">
              <label htmlFor="media-alt">Alt text</label>
              <textarea id="media-alt" className="st-textarea" rows={2} value={details.alt} onChange={set('alt')} />
            </div>
            <div className="st-field">
              <label htmlFor="media-caption">Default caption</label>
              <textarea id="media-caption" className="st-textarea" rows={2} value={details.caption} onChange={set('caption')} />
            </div>
            <div className="st-field">
              <label htmlFor="media-credit">Credit</label>
              <input id="media-credit" className="st-input" value={details.credit} onChange={set('credit')} />
            </div>
            <div className="st-field">
              <label htmlFor="media-credit-url">Credit link</label>
              <input id="media-credit-url" className="st-input" value={details.creditUrl} onChange={set('creditUrl')} placeholder="https://" />
            </div>
            <p className="st-hint">Changing these doesn&apos;t change posts that already use the image.</p>
            {error && <p className="st-field-error">{error}</p>}
          </div>
        </div>
      )}
    </Dialog>
  )
}
