import 'server-only'

import { asc, eq, or, sql } from 'drizzle-orm'

import { getDb, schema } from './db'
import { SLUG_PATTERN } from './document'
import type { Result } from './posts'

export type CategoryItem = typeof schema.category.$inferSelect
export type AuthorItem = typeof schema.author.$inferSelect

export async function listCategories(): Promise<CategoryItem[]> {
  return getDb().select().from(schema.category).orderBy(asc(schema.category.sortOrder), asc(schema.category.title))
}

export async function listAuthors(): Promise<AuthorItem[]> {
  return getDb().select().from(schema.author).orderBy(asc(schema.author.name))
}

function isUniqueViolation(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === '23505'
}

async function postsUsing(field: 'categoryId' | 'authorId', id: string) {
  const [row] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.post)
    .where(or(sql`${schema.post.draft} ->> ${field} = ${id}`, sql`${schema.post.published} ->> ${field} = ${id}`))
  return row?.count ?? 0
}

export async function saveCategory(input: {
  id?: string
  slug: string
  title: string
  description: string
  sortOrder: number
}): Promise<Result> {
  const slug = input.slug.trim()
  const title = input.title.trim()
  if (!title) return { ok: false, error: 'Add a title.' }
  if (!SLUG_PATTERN.test(slug)) return { ok: false, error: 'Slug: lowercase words joined by hyphens.' }
  const values = { slug, title, description: input.description.trim(), sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0 }
  try {
    if (input.id) await getDb().update(schema.category).set({ ...values, updatedAt: new Date() }).where(eq(schema.category.id, input.id))
    else await getDb().insert(schema.category).values(values)
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: `The slug "${slug}" is already used by another category.` }
    throw error
  }
  return { ok: true }
}

export async function deleteCategory(id: string): Promise<Result> {
  const used = await postsUsing('categoryId', id)
  if (used) return { ok: false, error: `${used} post${used === 1 ? '' : 's'} use this category. Move them first.` }
  await getDb().delete(schema.category).where(eq(schema.category.id, id))
  return { ok: true }
}

export async function saveAuthor(input: {
  id?: string
  slug: string
  name: string
  bio: string
  xHandle: string
  avatarUrl: string
}): Promise<Result> {
  const slug = input.slug.trim()
  const name = input.name.trim()
  if (!name) return { ok: false, error: 'Add a name.' }
  if (!SLUG_PATTERN.test(slug)) return { ok: false, error: 'Slug: lowercase words joined by hyphens.' }
  const values = {
    slug,
    name,
    bio: input.bio.trim(),
    xHandle: input.xHandle.trim().replace(/^@/, ''),
    avatarUrl: input.avatarUrl.trim(),
  }
  try {
    if (input.id) await getDb().update(schema.author).set({ ...values, updatedAt: new Date() }).where(eq(schema.author.id, input.id))
    else await getDb().insert(schema.author).values(values)
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, error: `The slug "${slug}" is already used by another author.` }
    throw error
  }
  return { ok: true }
}

export async function deleteAuthor(id: string): Promise<Result> {
  const used = await postsUsing('authorId', id)
  if (used) return { ok: false, error: `${used} post${used === 1 ? '' : 's'} use this author. Change them first.` }
  await getDb().delete(schema.author).where(eq(schema.author.id, id))
  return { ok: true }
}
