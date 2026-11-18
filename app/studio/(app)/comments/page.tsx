import type { Metadata } from 'next'
import Link from 'next/link'

import { CommentActions } from '@/components/studio/CommentActions'
import { formatDateTime } from '@/components/studio/format'
import { commentCounts, listComments, type CommentStatus } from '@/lib/studio/comments'
import { requireUser } from '@/lib/studio/session'

export const metadata: Metadata = { title: 'Comments' }

const TABS: Array<{ value: CommentStatus | 'all'; label: string }> = [
  { value: 'pending', label: 'Waiting' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'spam', label: 'Spam' },
  { value: 'all', label: 'All' },
]

export default async function CommentsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser()
  const { status: raw } = await searchParams
  const status = TABS.some((tab) => tab.value === raw) ? (raw as CommentStatus | 'all') : 'pending'
  const [comments, counts] = await Promise.all([listComments(status), commentCounts()])
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sebmonty.link').replace(/\/$/, '')

  return (
    <main className="st-page">
      <div className="st-page-head">
        <div>
          <h1>Comments</h1>
          <p>Readers&apos; comments wait here until someone approves them. Only approved comments appear on the site.</p>
        </div>
      </div>
      <div className="st-filters" role="tablist" style={{ marginBottom: 14 }}>
        {TABS.map((tab) => (
          <Link key={tab.value} href={`/studio/comments?status=${tab.value}`} className="st-filter" aria-pressed={status === tab.value} role="tab" aria-selected={status === tab.value} style={{ textDecoration: 'none' }}>
            {tab.label} {counts[tab.value]}
          </Link>
        ))}
      </div>
      <div className="st-card">
        {comments.length === 0 && <p className="st-empty">Nothing here.</p>}
        {comments.map((comment) => (
          <article key={comment.id} className="st-comment">
            <div className="st-comment-meta">
              <strong>{comment.name}</strong>
              {comment.email && <span>{comment.email}</span>}
              <span>on</span>
              <a href={`${siteUrl}/blog/${comment.postSlug}`} target="_blank" rel="noreferrer">
                {comment.postTitle || 'Untitled'}
              </a>
              <span>· {formatDateTime(comment.createdAt)}</span>
              <span className={`st-badge ${comment.status}`}>{comment.status}</span>
            </div>
            <p className="st-comment-body">{comment.body}</p>
            {comment.moderatedBy && (
              <p className="st-hint">
                {comment.status} by {comment.moderatedBy} · {formatDateTime(comment.moderatedAt)}
              </p>
            )}
            <CommentActions id={comment.id} status={comment.status} />
          </article>
        ))}
      </div>
    </main>
  )
}
