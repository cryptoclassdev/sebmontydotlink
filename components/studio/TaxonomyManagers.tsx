'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { deleteAuthorAction, deleteCategoryAction, saveAuthorAction, saveCategoryAction } from '@/app/studio/actions'
import { slugify } from '@/lib/studio/document'

import { Dialog } from './Dialog'

type Category = { id?: string; slug: string; title: string; description: string; sortOrder: number }
type Author = { id?: string; slug: string; name: string; bio: string; xHandle: string; avatarUrl: string }

function useMutation() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const run = (action: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) =>
    startTransition(async () => {
      setError('')
      const result = await action()
      if (!result.ok) return setError(result.error || 'Something went wrong.')
      after?.()
      router.refresh()
    })
  return { pending, error, setError, run }
}

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null)
  const { pending, error, setError, run } = useMutation()
  const set = (patch: Partial<Category>) => editing && setEditing({ ...editing, ...patch })

  return (
    <main className="st-page">
      <div className="st-page-head">
        <div>
          <h1>Categories</h1>
          <p>Every post has one. The slug is part of the category page address, so avoid renaming it once used.</p>
        </div>
        <button type="button" className="st-btn primary" onClick={() => setEditing({ slug: '', title: '', description: '', sortOrder: categories.length })}>
          New category
        </button>
      </div>
      {error && !editing && <div className="st-banner error" style={{ margin: '0 0 14px' }}>{error}</div>}
      <div className="st-card">
        <table className="st-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Description</th>
              <th className="actions">Order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>
                  <strong>{category.title}</strong>
                </td>
                <td>
                  <code>{category.slug}</code>
                </td>
                <td>{category.description}</td>
                <td className="actions">{category.sortOrder}</td>
                <td className="actions">
                  <button type="button" className="st-btn small" onClick={() => { setError(''); setEditing(category) }}>
                    Edit
                  </button>{' '}
                  <button
                    type="button"
                    className="st-btn small ghost"
                    disabled={pending}
                    onClick={() => confirm(`Delete the ${category.title} category?`) && run(() => deleteCategoryAction(category.id!))}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit category' : 'New category'}
        onSubmit={() => editing && run(() => saveCategoryAction(editing), () => setEditing(null))}
        footer={
          <>
            <button type="button" className="st-btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" className="st-btn primary" disabled={pending}>
              Save
            </button>
          </>
        }
      >
        {editing && (
          <>
            <div className="st-field">
              <label htmlFor="cat-title">Title</label>
              <input
                id="cat-title"
                className="st-input"
                autoFocus
                value={editing.title}
                onChange={(event) => set({ title: event.target.value, ...(editing.id ? {} : { slug: slugify(event.target.value) }) })}
              />
            </div>
            <div className="st-field">
              <label htmlFor="cat-slug">Slug</label>
              <input id="cat-slug" className="st-input mono" value={editing.slug} onChange={(event) => set({ slug: event.target.value })} />
            </div>
            <div className="st-field">
              <label htmlFor="cat-description">Description</label>
              <textarea id="cat-description" className="st-textarea" rows={2} value={editing.description} onChange={(event) => set({ description: event.target.value })} />
            </div>
            <div className="st-field">
              <label htmlFor="cat-order">Order</label>
              <input id="cat-order" type="number" className="st-input" value={editing.sortOrder} onChange={(event) => set({ sortOrder: Number(event.target.value) || 0 })} />
              <p className="st-hint">Lower numbers come first in the blog&apos;s category list.</p>
            </div>
            {error && <p className="st-field-error">{error}</p>}
          </>
        )}
      </Dialog>
    </main>
  )
}

export function AuthorsManager({ authors }: { authors: Author[] }) {
  const [editing, setEditing] = useState<Author | null>(null)
  const { pending, error, setError, run } = useMutation()
  const set = (patch: Partial<Author>) => editing && setEditing({ ...editing, ...patch })

  return (
    <main className="st-page">
      <div className="st-page-head">
        <div>
          <h1>Authors</h1>
          <p>The bylines on articles. These are separate from Studio logins.</p>
        </div>
        <button type="button" className="st-btn primary" onClick={() => setEditing({ slug: '', name: '', bio: '', xHandle: '', avatarUrl: '' })}>
          New author
        </button>
      </div>
      {error && !editing && <div className="st-banner error" style={{ margin: '0 0 14px' }}>{error}</div>}
      <div className="st-card">
        <table className="st-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>X</th>
              <th>Bio</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.id}>
                <td>
                  <strong>{author.name}</strong>
                </td>
                <td>
                  <code>{author.slug}</code>
                </td>
                <td>{author.xHandle ? `@${author.xHandle}` : ''}</td>
                <td>{author.bio}</td>
                <td className="actions">
                  <button type="button" className="st-btn small" onClick={() => { setError(''); setEditing(author) }}>
                    Edit
                  </button>{' '}
                  <button
                    type="button"
                    className="st-btn small ghost"
                    disabled={pending}
                    onClick={() => confirm(`Delete ${author.name}?`) && run(() => deleteAuthorAction(author.id!))}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit author' : 'New author'}
        onSubmit={() => editing && run(() => saveAuthorAction(editing), () => setEditing(null))}
        footer={
          <>
            <button type="button" className="st-btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" className="st-btn primary" disabled={pending}>
              Save
            </button>
          </>
        }
      >
        {editing && (
          <>
            <div className="st-field">
              <label htmlFor="author-name">Name</label>
              <input
                id="author-name"
                className="st-input"
                autoFocus
                value={editing.name}
                onChange={(event) => set({ name: event.target.value, ...(editing.id ? {} : { slug: slugify(event.target.value) }) })}
              />
            </div>
            <div className="st-field">
              <label htmlFor="author-slug">Slug</label>
              <input id="author-slug" className="st-input mono" value={editing.slug} onChange={(event) => set({ slug: event.target.value })} />
            </div>
            <div className="st-field">
              <label htmlFor="author-x">X handle</label>
              <input id="author-x" className="st-input" value={editing.xHandle} placeholder="SebMontgomery" onChange={(event) => set({ xHandle: event.target.value })} />
            </div>
            <div className="st-field">
              <label htmlFor="author-bio">Bio</label>
              <textarea id="author-bio" className="st-textarea" rows={3} value={editing.bio} onChange={(event) => set({ bio: event.target.value })} />
            </div>
            <div className="st-field">
              <label htmlFor="author-avatar">Photo URL (optional)</label>
              <input id="author-avatar" className="st-input" value={editing.avatarUrl} onChange={(event) => set({ avatarUrl: event.target.value })} />
            </div>
            {error && <p className="st-field-error">{error}</p>}
          </>
        )}
      </Dialog>
    </main>
  )
}
