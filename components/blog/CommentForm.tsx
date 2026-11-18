'use client'

import { useState } from 'react'

type State = { kind: 'idle' | 'sending' | 'sent' | 'error'; message?: string }

export function CommentForm({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' })

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setState({ kind: 'sending' })
    try {
      const response = await fetch('/api/studio/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: data.get('name'),
          email: data.get('email'),
          body: data.get('body'),
          website: data.get('website'),
        }),
      })
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!response.ok || !result.ok) {
        setState({ kind: 'error', message: result.error || 'Your comment could not be sent. Try again in a moment.' })
        return
      }
      form.reset()
      setState({ kind: 'sent' })
    } catch {
      setState({ kind: 'error', message: 'Your comment could not be sent. Check your connection and try again.' })
    }
  }

  if (state.kind === 'sent') {
    return (
      <p className="article-comments__notice" role="status">
        Thanks. Your comment will appear here once it has been approved.
      </p>
    )
  }

  return (
    <form className="article-comments__form" onSubmit={onSubmit}>
      <h3>Leave a comment</h3>
      <p className="article-comments__hint">Comments are checked before they appear. Your email is never shown.</p>
      <div className="article-comments__row">
        <label>
          <span>Name</span>
          <input name="name" required maxLength={80} autoComplete="name" />
        </label>
        <label>
          <span>Email (optional)</span>
          <input name="email" type="email" maxLength={200} autoComplete="email" />
        </label>
      </div>
      <label>
        <span>Comment</span>
        <textarea name="body" required maxLength={4000} rows={5} />
      </label>
      {/* Left empty by people; bots that fill every field are ignored */}
      <label className="article-comments__trap" aria-hidden="true">
        Website <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {state.kind === 'error' && (
        <p className="article-comments__error" role="alert">
          {state.message}
        </p>
      )}
      <button type="submit" className="site-button site-button--small" disabled={state.kind === 'sending'}>
        {state.kind === 'sending' ? 'Sending…' : 'Post comment'}
      </button>
    </form>
  )
}
