'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'

import {
  deletePostAction,
  discardChangesAction,
  listRevisionsAction,
  publishAction,
  restoreRevisionAction,
  saveDraftAction,
  unpublishAction,
} from '@/app/studio/actions'
import {
  estimatedReadTime,
  publishProblems,
  slugify,
  type PostDocument,
  type PublishProblem,
} from '@/lib/studio/document'

import { Dialog } from './Dialog'
import { formatDateTime, isoToLocalInput, localInputToIso, timeAgo } from './format'
import { ImageField } from './ImageField'
import { StatusBadge } from './PostsPanes'
import type { UploadMode } from './upload'

// The editor reads browser-only state while rendering, so it only renders in the browser.
const BodyEditor = dynamic(() => import('./BodyEditor').then((module) => module.BodyEditor), {
  ssr: false,
  loading: () => (
    <div className="st-pte">
      <div className="st-editable st-placeholder">Loading the editor…</div>
    </div>
  ),
})

type Option = { id: string; label: string }
type SaveState = 'saved' | 'dirty' | 'saving' | 'error'
type Tab = 'content' | 'details' | 'seo'

const SAVE_DELAY_MS = 1200
const FIELD_TAB: Record<string, Tab> = {
  title: 'content',
  slug: 'content',
  cover: 'content',
  body: 'content',
  date: 'details',
  updated: 'details',
  categoryId: 'details',
  authorId: 'details',
  seo: 'seo',
}

export type EditorPost = {
  id: string
  status: 'draft' | 'scheduled' | 'published'
  version: number
  draft: PostDocument
  published: PostDocument | null
  updatedAt: string
  lastPublishedAt: string | null
}

export function PostEditor({
  post,
  categories,
  authors,
  uploadMode,
  siteUrl,
}: {
  post: EditorPost
  categories: Option[]
  authors: Option[]
  uploadMode: UploadMode
  siteUrl: string
}) {
  const router = useRouter()
  const [doc, setDoc] = useState<PostDocument>(post.draft)
  const [published, setPublished] = useState<PostDocument | null>(post.published)
  const [status, setStatus] = useState(post.status)
  const [version, setVersion] = useState(post.version)
  const [saveState, setSaveState] = useState<SaveState>('saved')
  const [savedAt, setSavedAt] = useState(post.updatedAt)
  const [error, setError] = useState('')
  const [problems, setProblems] = useState<PublishProblem[]>([])
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState<Tab>('content')
  const [menuOpen, setMenuOpen] = useState(false)
  const [revisionsOpen, setRevisionsOpen] = useState(false)
  const [busy, startTransition] = useTransition()

  const docRef = useRef(doc)
  const versionRef = useRef(version)
  const savingRef = useRef<Promise<boolean> | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  docRef.current = doc
  versionRef.current = version

  const save = useCallback(async (): Promise<boolean> => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (savingRef.current) await savingRef.current
    const snapshot = docRef.current
    const task = (async () => {
      setSaveState('saving')
      const result = await saveDraftAction(post.id, snapshot, versionRef.current)
      if (!result.ok) {
        setSaveState('error')
        setError(result.error)
        return false
      }
      versionRef.current = result.version
      setVersion(result.version)
      setSavedAt(result.updatedAt)
      setError('')
      setSaveState(docRef.current === snapshot ? 'saved' : 'dirty')
      return true
    })()
    savingRef.current = task
    const ok = await task
    savingRef.current = null
    return ok
  }, [post.id])

  const update = useCallback(
    (patch: Partial<PostDocument> | ((current: PostDocument) => PostDocument)) => {
      setDoc((current) => (typeof patch === 'function' ? patch(current) : { ...current, ...patch }))
      setSaveState((state) => (state === 'error' ? 'error' : 'dirty'))
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => void save(), SAVE_DELAY_MS)
    },
    [save],
  )

  // Warn before leaving with unsaved edits
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (saveState === 'dirty' || saveState === 'saving') event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [saveState])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const hasLiveChanges = useMemo(() => Boolean(published) && JSON.stringify(doc) !== JSON.stringify(published), [doc, published])
  const isFuture = doc.date ? new Date(doc.date).getTime() > Date.now() : false
  const localProblems = useMemo(
    () => publishProblems(doc, { categoryIds: categories.map((c) => c.id), authorIds: authors.map((a) => a.id) }),
    [doc, categories, authors],
  )
  const problemFor = (field: string) => problems.find((problem) => problem.field === field)?.message
  const slugChangedLive = Boolean(published && published.slug !== doc.slug)

  function publish() {
    setNotice('')
    if (localProblems.length) {
      setProblems(localProblems)
      setTab(FIELD_TAB[localProblems[0].field] || 'content')
      return
    }
    startTransition(async () => {
      if (saveState !== 'saved' && !(await save())) return
      const result = await publishAction(post.id, versionRef.current)
      if (!result.ok) {
        setError(result.error)
        setProblems(result.problems || [])
        return
      }
      setProblems([])
      setError('')
      setStatus(result.status)
      setPublished(docRef.current)
      setVersion((v) => v + 1)
      versionRef.current += 1
      setNotice(result.status === 'scheduled' ? `Scheduled for ${formatDateTime(docRef.current.date)}.` : 'Published.')
      router.refresh()
    })
  }

  function runAction(action: () => Promise<{ ok: boolean; error?: string }>, done: string, reload = true) {
    setMenuOpen(false)
    startTransition(async () => {
      if (saveState !== 'saved' && !(await save())) return
      const result = await action()
      if (!result.ok) {
        setError(result.error || 'Something went wrong.')
        return
      }
      setNotice(done)
      if (reload) window.location.reload()
    })
  }

  const publishLabel = busy
    ? 'Working…'
    : !published
      ? isFuture
        ? 'Schedule'
        : 'Publish'
      : hasLiveChanges
        ? isFuture && status !== 'published'
          ? 'Update schedule'
          : 'Publish changes'
        : status === 'scheduled'
          ? 'Scheduled'
          : 'Published'

  const saveLabel = {
    saved: `Saved ${timeAgo(savedAt)}`,
    dirty: 'Unsaved changes',
    saving: 'Saving…',
    error: 'Not saved',
  }[saveState]

  const liveUrl = published ? `${siteUrl}/blog/${published.slug}` : null

  return (
    <>
      <div className="st-dochead">
        <Link href="/studio/posts" className="st-icon-btn st-back" aria-label="Back to posts">
          ←
        </Link>
        <h1>{doc.title || 'Untitled'}</h1>
        <StatusBadge status={status} changed={hasLiveChanges} />
        <span className="st-spacer" style={{ flex: 1 }} />
        {liveUrl && (
          <a className="st-btn ghost small st-hide-sm" href={liveUrl} target="_blank" rel="noreferrer">
            View live ↗
          </a>
        )}
        <div className="st-menu">
          <button type="button" className="st-icon-btn" aria-haspopup="menu" aria-expanded={menuOpen} aria-label="More actions" onClick={() => setMenuOpen(!menuOpen)}>
            ⋯
          </button>
          {menuOpen && (
            <div className="st-menu-list" role="menu" onMouseLeave={() => setMenuOpen(false)}>
              <button
                role="menuitem"
                type="button"
                className="st-menu-item"
                onClick={() => {
                  setMenuOpen(false)
                  setRevisionsOpen(true)
                }}
              >
                Revision history
              </button>
              <button
                role="menuitem"
                type="button"
                className="st-menu-item"
                disabled={!hasLiveChanges}
                onClick={() => confirm('Throw away every change since the last publish?') && runAction(() => discardChangesAction(post.id), 'Changes discarded.')}
              >
                Discard unpublished changes
              </button>
              <button
                role="menuitem"
                type="button"
                className="st-menu-item"
                disabled={!published}
                onClick={() =>
                  confirm('Take this article off the website? It stays here as a draft.') && runAction(() => unpublishAction(post.id), 'Unpublished.')
                }
              >
                Unpublish
              </button>
              <button
                role="menuitem"
                type="button"
                className="st-menu-item danger"
                disabled={Boolean(published)}
                title={published ? 'Unpublish first' : undefined}
                onClick={() =>
                  confirm('Delete this draft for good? This cannot be undone.') &&
                  startTransition(async () => {
                    const result = await deletePostAction(post.id)
                    if (result && !result.ok) setError(result.error)
                  })
                }
              >
                Delete draft
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="st-tabs" role="tablist" aria-label="Post fields">
        {(
          [
            ['content', 'Content'],
            ['details', 'Details'],
            ['seo', 'SEO'],
          ] as const
        ).map(([value, label]) => {
          const count = problems.filter((problem) => (FIELD_TAB[problem.field] || 'content') === value).length
          return (
            <button key={value} type="button" role="tab" className="st-tab" aria-selected={tab === value} onClick={() => setTab(value)}>
              {label}
              {count > 0 && <span className="st-count">{count}</span>}
            </button>
          )
        })}
      </div>

      {error && (
        <div className="st-banner error" role="alert">
          <div>
            <strong>{error}</strong>
            {problems.length > 0 && (
              <ul>
                {problems.map((problem, index) => (
                  <li key={index}>
                    <button type="button" className="link" onClick={() => setTab(FIELD_TAB[problem.field] || 'content')}>
                      {problem.message}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {saveState === 'error' && /Reload/.test(error) && (
              <p style={{ margin: '6px 0 0' }}>
                <button type="button" className="link" onClick={() => window.location.reload()}>
                  Reload this post
                </button>
              </p>
            )}
          </div>
        </div>
      )}
      {!error && problems.length > 0 && (
        <div className="st-banner error" role="alert">
          <div>
            <strong>Fix these before publishing:</strong>
            <ul>
              {problems.map((problem, index) => (
                <li key={index}>
                  <button type="button" className="link" onClick={() => setTab(FIELD_TAB[problem.field] || 'content')}>
                    {problem.message}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {notice && !error && (
        <div className="st-banner success" role="status">
          {notice}
        </div>
      )}

      <div className="st-docscroll">
        <div className="st-form">
          <div hidden={tab !== 'content'}>
            <div className={`st-field${problemFor('title') ? ' invalid' : ''}`}>
              <label htmlFor="title">Title</label>
              <input id="title" className="st-input title" value={doc.title} placeholder="Headline" onChange={(event) => update({ title: event.target.value })} />
            </div>
            <div className={`st-field${problemFor('slug') ? ' invalid' : ''}`}>
              <label htmlFor="slug">Slug</label>
              <div className="st-row">
                <input
                  id="slug"
                  className="st-input mono"
                  value={doc.slug}
                  onChange={(event) => update({ slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                />
                <button type="button" className="st-btn" onClick={() => update({ slug: slugify(doc.title) || doc.slug })} disabled={!doc.title}>
                  From title
                </button>
              </div>
              <p className="st-hint">
                {siteUrl.replace(/^https?:\/\//, '')}/blog/<strong>{doc.slug || '…'}</strong>
              </p>
              {slugChangedLive && <p className="st-field-error">This article is live at /blog/{published?.slug}. Changing the slug breaks links to it.</p>}
            </div>
            <div className="st-field">
              <label htmlFor="deck">Deck</label>
              <textarea id="deck" className="st-textarea" rows={2} value={doc.deck} onChange={(event) => update({ deck: event.target.value })} />
              <p className="st-hint">One or two sentences under the headline. Also the card text unless you write an excerpt.</p>
            </div>
            <div className="st-field">
              <label htmlFor="excerpt">Excerpt (optional)</label>
              <textarea id="excerpt" className="st-textarea" rows={2} value={doc.excerpt} onChange={(event) => update({ excerpt: event.target.value })} />
              <p className="st-hint">A shorter summary for cards, search and link previews.</p>
            </div>
            <div className={`st-field${problemFor('cover') ? ' invalid' : ''}`}>
              <span className="st-label">Cover image</span>
              <ImageField id="cover" value={doc.cover} onChange={(cover) => update({ cover })} uploadMode={uploadMode} withPosition />
              {problemFor('cover') && <span className="st-field-error">{problemFor('cover')}</span>}
            </div>
            <div className={`st-field${problemFor('body') ? ' invalid' : ''}`}>
              <span className="st-label">Body</span>
              <BodyEditor initialValue={post.draft.body} uploadMode={uploadMode} onChange={(body) => update((current) => ({ ...current, body }))} />
            </div>
            <div className="st-field">
              <label htmlFor="disclosure">Disclosure</label>
              <textarea id="disclosure" className="st-textarea" rows={3} value={doc.disclosure} onChange={(event) => update({ disclosure: event.target.value })} />
              <p className="st-hint">Closing note in italics after the article: holdings, affiliations, the validator.com mention.</p>
            </div>
          </div>

          <div hidden={tab !== 'details'}>
            <div className="st-grid-2">
              <div className={`st-field${problemFor('date') ? ' invalid' : ''}`}>
                <label htmlFor="date">Publish date</label>
                <input id="date" type="datetime-local" className="st-input" value={isoToLocalInput(doc.date)} onChange={(event) => update({ date: localInputToIso(event.target.value) })} />
                <p className="st-hint">{isFuture ? 'In the future: Publish will schedule it for this time.' : 'Articles are listed newest first.'}</p>
              </div>
              <div className={`st-field${problemFor('updated') ? ' invalid' : ''}`}>
                <label htmlFor="updated">Updated (optional)</label>
                <input id="updated" type="datetime-local" className="st-input" value={isoToLocalInput(doc.updated)} onChange={(event) => update({ updated: localInputToIso(event.target.value) })} />
                <p className="st-hint">For a later correction or refresh.</p>
              </div>
              <div className={`st-field${problemFor('categoryId') ? ' invalid' : ''}`}>
                <label htmlFor="category">Category</label>
                <select id="category" className="st-select" value={doc.categoryId} onChange={(event) => update({ categoryId: event.target.value })}>
                  <option value="">Choose…</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`st-field${problemFor('authorId') ? ' invalid' : ''}`}>
                <label htmlFor="author">Author</label>
                <select id="author" className="st-select" value={doc.authorId} onChange={(event) => update({ authorId: event.target.value })}>
                  <option value="">Choose…</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="st-field">
                <label htmlFor="readTime">Read time (minutes)</label>
                <input
                  id="readTime"
                  type="number"
                  min={0}
                  max={600}
                  className="st-input"
                  value={doc.readTime || ''}
                  placeholder={`Auto: ${estimatedReadTime(doc.body)}`}
                  onChange={(event) => update({ readTime: Math.max(0, Math.min(600, Number(event.target.value) || 0)) })}
                />
                <p className="st-hint">Leave empty to work it out from the word count.</p>
              </div>
              <div className="st-field">
                <span className="st-label">Homepage</span>
                <label className="st-check">
                  <input type="checkbox" checked={doc.featured} onChange={(event) => update({ featured: event.target.checked })} />
                  Feature this article
                </label>
              </div>
            </div>
          </div>

          <div hidden={tab !== 'seo'}>
            <p className="st-hint" style={{ marginBottom: 20 }}>
              Optional. Empty fields fall back to the title, excerpt or deck, and cover image.
            </p>
            <div className="st-field">
              <label htmlFor="seo-title">Search and share title</label>
              <input id="seo-title" className="st-input" value={doc.seo.title} placeholder={doc.title} onChange={(event) => update({ seo: { ...doc.seo, title: event.target.value } })} />
              <p className="st-hint">{(doc.seo.title || doc.title).length} characters; about 60 show in Google.</p>
            </div>
            <div className="st-field">
              <label htmlFor="seo-description">Meta description</label>
              <textarea
                id="seo-description"
                className="st-textarea"
                rows={3}
                value={doc.seo.description}
                placeholder={doc.excerpt || doc.deck}
                onChange={(event) => update({ seo: { ...doc.seo, description: event.target.value } })}
              />
              <p className="st-hint">{(doc.seo.description || doc.excerpt || doc.deck).length} characters; about 155 show in Google.</p>
            </div>
            <div className="st-field">
              <span className="st-label">Share image</span>
              <ImageField
                id="seo-image"
                value={doc.seo.image}
                withCaption={false}
                emptyLabel="Uses the cover image"
                uploadMode={uploadMode}
                onChange={(image) => update({ seo: { ...doc.seo, image } })}
              />
              <p className="st-hint">Shown when the link is shared on X and elsewhere. 1200 × 630 works best.</p>
            </div>
            <div className={`st-field${problemFor('seo') ? ' invalid' : ''}`}>
              <label htmlFor="seo-canonical">Canonical URL</label>
              <input
                id="seo-canonical"
                className="st-input"
                value={doc.seo.canonicalUrl}
                placeholder="Only if this article first appeared somewhere else"
                onChange={(event) => update({ seo: { ...doc.seo, canonicalUrl: event.target.value.trim() } })}
              />
            </div>
            <label className="st-check">
              <input type="checkbox" checked={doc.seo.noindex} onChange={(event) => update({ seo: { ...doc.seo, noindex: event.target.checked } })} />
              Hide from search engines
            </label>
          </div>
        </div>
      </div>

      <div className="st-docfoot">
        <span className="st-savestate" aria-live="polite" suppressHydrationWarning>
          {saveLabel}
          {published && post.lastPublishedAt && ` · Last published ${formatDateTime(post.lastPublishedAt)}`}
        </span>
        <span className="st-spacer" />
        {saveState === 'dirty' && (
          <button type="button" className="st-btn small" onClick={() => void save()}>
            Save now
          </button>
        )}
        <button type="button" className="st-btn publish" disabled={busy || (Boolean(published) && !hasLiveChanges)} onClick={publish}>
          {publishLabel}
        </button>
      </div>

      <RevisionsDialog
        open={revisionsOpen}
        postId={post.id}
        onClose={() => setRevisionsOpen(false)}
        onRestore={(revisionId) =>
          runAction(async () => {
            setRevisionsOpen(false)
            return restoreRevisionAction(post.id, revisionId)
          }, 'Revision restored as the current draft.')
        }
      />
    </>
  )
}

function RevisionsDialog({
  open,
  postId,
  onClose,
  onRestore,
}: {
  open: boolean
  postId: string
  onClose: () => void
  onRestore: (revisionId: string) => void
}) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listRevisionsAction>> | null>(null)
  useEffect(() => {
    if (open) listRevisionsAction(postId).then(setRows)
    else setRows(null)
  }, [open, postId])
  const labels = { autosave: 'Draft snapshot', publish: 'Published', restore: 'Before a restore', import: 'Imported from Markdown' }
  return (
    <Dialog open={open} onClose={onClose} title="Revision history">
      <p className="st-hint" style={{ marginBottom: 12 }}>
        A snapshot is kept every time the post is published, and every 10 minutes while it&apos;s being edited. Restoring replaces the current draft (the
        live article doesn&apos;t change until you publish).
      </p>
      {!rows ? (
        <p className="st-hint">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="st-hint">No snapshots yet.</p>
      ) : (
        <ul className="st-revisions">
          {rows.map((row) => (
            <li key={row.id}>
              <span>
                <strong>{labels[row.kind]}</strong>
                <small>
                  {formatDateTime(row.createdAt)}
                  {row.by ? ` · ${row.by}` : ''} · {row.title || 'Untitled'}
                </small>
              </span>
              <button
                type="button"
                className="st-btn small"
                onClick={() => confirm('Replace the current draft with this snapshot?') && onRestore(row.id)}
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  )
}
