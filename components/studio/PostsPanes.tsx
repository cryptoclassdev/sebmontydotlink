'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'

import { createPostAction } from '@/app/studio/actions'
import type { PostListItem } from '@/lib/studio/posts'

import { formatDate, timeAgo } from './format'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
] as const

export function StatusBadge({ status, changed }: { status: PostListItem['status']; changed?: boolean }) {
  if (changed) return <span className="st-badge changed">Edited</span>
  if (status === 'published') return <span className="st-badge published">Published</span>
  if (status === 'scheduled') return <span className="st-badge scheduled">Scheduled</span>
  return <span className="st-badge draft">Draft</span>
}

export function PostsPanes({ posts, children }: { posts: PostListItem[]; children: React.ReactNode }) {
  const pathname = usePathname()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['value']>('all')
  const [query, setQuery] = useState('')
  const activeId = pathname.split('/')[3] || null

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    return posts.filter(
      (post) =>
        (filter === 'all' || post.status === filter) &&
        (!term || post.title.toLowerCase().includes(term) || post.slug.includes(term)),
    )
  }, [posts, filter, query])

  return (
    <div className="st-panes" data-doc-open={Boolean(activeId)}>
      <aside className="st-listpane" aria-label="Posts">
        <div className="st-listpane-head">
          <div className="st-row" style={{ justifyContent: 'space-between' }}>
            <h1>Posts</h1>
            <form action={createPostAction}>
              <button type="submit" className="st-btn primary small">
                + New post
              </button>
            </form>
          </div>
          <input
            type="search"
            className="st-input"
            placeholder="Search titles and slugs"
            aria-label="Search posts"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="st-filters" role="group" aria-label="Filter by status">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className="st-filter"
                aria-pressed={filter === item.value}
                onClick={() => setFilter(item.value)}
              >
                {item.label} {item.value === 'all' ? posts.length : posts.filter((post) => post.status === item.value).length}
              </button>
            ))}
          </div>
        </div>
        <ul className="st-postlist">
          {visible.map((post) => (
            <li key={post.id}>
              <Link href={`/studio/posts/${post.id}`} className="st-postlink" aria-current={post.id === activeId ? 'page' : undefined}>
                {post.coverSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="st-thumb" src={post.coverSrc} alt="" loading="lazy" />
                ) : (
                  <span className="st-thumb" aria-hidden="true" />
                )}
                <span style={{ minWidth: 0 }}>
                  <strong>{post.title}</strong>
                  <span className="st-postmeta" suppressHydrationWarning>
                    <StatusBadge status={post.status} changed={post.hasUnpublishedChanges} />
                    {post.status === 'draft' ? `edited ${timeAgo(post.updatedAt)}` : formatDate(post.publishedAt)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {!visible.length && <li className="st-empty">No posts match.</li>}
        </ul>
      </aside>
      <section className="st-docpane">{children}</section>
    </div>
  )
}
