'use client'

import { useEffect, useState, useTransition } from 'react'

import { fetchXPostAction } from '@/app/studio/actions'
import { XPostCard } from '@/components/blog/XPostEmbed'
import { xPostId, type XPostSnapshot } from '@/lib/studio/xpost'

import { Dialog } from './Dialog'

type Saved = { url: string; post: XPostSnapshot; fetchedAt: string }

/** Paste an X post link; the server reads the post and the dialog shows the card the article will show. */
export function XPostDialog({
  edit,
  creating,
  onSave,
  onClose,
}: {
  edit: { url?: string; post?: XPostSnapshot; fetchedAt?: string } | null
  creating: boolean
  onSave: (value: Saved) => void
  onClose: () => void
}) {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<Saved | null>(null)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (edit) {
      setUrl(edit.url || '')
      setResult(edit.post && edit.url && edit.fetchedAt ? { url: edit.url, post: edit.post, fetchedAt: edit.fetchedAt } : null)
      setError('')
    }
  }, [edit])

  const load = () => {
    if (!xPostId(url)) {
      setError('Paste the link to a post, like https://x.com/name/status/1234567890.')
      return
    }
    setError('')
    startTransition(async () => {
      const response = await fetchXPostAction(url.trim())
      if (response.ok) setResult({ url: url.trim(), post: response.post, fetchedAt: response.fetchedAt })
      else setError(response.error)
    })
  }

  const ready = result && result.url === url.trim()

  return (
    <Dialog
      open={Boolean(edit)}
      onClose={onClose}
      title={creating ? 'Add an X post' : 'Edit X post'}
      onSubmit={() => (ready ? onSave(result) : load())}
      footer={
        <>
          {result && !creating && (
            <button type="button" className="st-btn" style={{ marginRight: 'auto' }} disabled={pending} onClick={load}>
              {pending ? 'Refreshing…' : 'Refresh from X'}
            </button>
          )}
          <button type="button" className="st-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="st-btn primary" disabled={pending || !url.trim()}>
            {ready ? (creating ? 'Insert post' : 'Save') : pending ? 'Getting the post…' : 'Get post'}
          </button>
        </>
      }
    >
      <div className="st-field">
        <label htmlFor="xpost-url">Link to the post</label>
        <input
          id="xpost-url"
          className="st-input"
          autoFocus
          placeholder="https://x.com/name/status/1234567890"
          value={url}
          onChange={(event) => {
            setUrl(event.target.value)
            setError('')
          }}
        />
        <p className="st-hint">The Studio saves a copy of the post, so the article keeps showing it even if it is later deleted on X.</p>
      </div>
      {error && <p className="st-field-error">{error}</p>}
      {result && (
        <div className="st-xpost-preview article-prose">
          {!ready && <p className="st-hint">Press Get post to load the new link.</p>}
          <XPostCard post={result.post} />
          <p className="st-hint">Copied from X on {new Date(result.fetchedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.</p>
        </div>
      )}
    </Dialog>
  )
}
