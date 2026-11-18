'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { deleteCommentAction, moderateCommentAction } from '@/app/studio/actions'
import type { CommentStatus } from '@/lib/studio/comments'

export function CommentActions({ id, status }: { id: string; status: CommentStatus }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const run = (action: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      const result = await action()
      if (!result.ok) setError(result.error || 'Something went wrong.')
      else router.refresh()
    })

  return (
    <div className="st-comment-actions">
      {status !== 'approved' && (
        <button type="button" className="st-btn small publish" style={{ minWidth: 0 }} disabled={pending} onClick={() => run(() => moderateCommentAction(id, 'approved'))}>
          Approve
        </button>
      )}
      {status !== 'rejected' && (
        <button type="button" className="st-btn small" disabled={pending} onClick={() => run(() => moderateCommentAction(id, 'rejected'))}>
          {status === 'approved' ? 'Hide' : 'Reject'}
        </button>
      )}
      {status !== 'spam' && (
        <button type="button" className="st-btn small" disabled={pending} onClick={() => run(() => moderateCommentAction(id, 'spam'))}>
          Spam
        </button>
      )}
      <button type="button" className="st-btn small ghost" disabled={pending} onClick={() => confirm('Delete this comment for good?') && run(() => deleteCommentAction(id))}>
        Delete
      </button>
      {error && <span className="st-field-error">{error}</span>}
    </div>
  )
}
