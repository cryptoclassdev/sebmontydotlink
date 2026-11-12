import 'server-only'

import { and, desc, eq, ilike, ne, or, sql } from 'drizzle-orm'

import { getDb, schema } from './db'
import {
  emptyDocument,
  normalizeDocument,
  postDocumentSchema,
  publishProblems,
  slugify,
  type PostDocument,
  type PublishProblem,
} from './document'
import { revalidatePublicPages } from './revalidate'
import type { StudioUser } from './session'

const AUTOSAVE_REVISION_EVERY_MS = 10 * 60 * 1000

export type PostStatus = 'draft' | 'scheduled' | 'published'

export type PostListItem = {
  id: string
  title: string
  slug: string
  status: PostStatus
  coverSrc: string | null
  updatedAt: string
  publishedAt: string | null
  hasUnpublishedChanges: boolean
}

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string; problems?: PublishProblem[] }

function sameDocument(a: PostDocument | null, b: PostDocument | null) {
  return JSON.stringify(a) === JSON.stringify(b)
}

export async function listPosts(filter: { status?: PostStatus | 'all'; q?: string } = {}): Promise<PostListItem[]> {
  const db = getDb()
  const conditions = []
  if (filter.status && filter.status !== 'all') conditions.push(eq(schema.post.status, filter.status))
  if (filter.q?.trim()) {
    const term = `%${filter.q.trim()}%`
    conditions.push(or(ilike(sql`${schema.post.draft} ->> 'title'`, term), ilike(schema.post.slug, term)))
  }
  const rows = await db
    .select()
    .from(schema.post)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.post.updatedAt))
    .limit(500)
  return rows.map((row) => ({
    id: row.id,
    title: row.draft.title || 'Untitled',
    slug: row.slug,
    status: row.status,
    coverSrc: row.draft.cover?.src || null,
    updatedAt: row.updatedAt.toISOString(),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    hasUnpublishedChanges: row.published ? !sameDocument(normalizeDocument(row.draft), normalizeDocument(row.published)) : false,
  }))
}

export async function getPost(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const [row] = await getDb().select().from(schema.post).where(eq(schema.post.id, id)).limit(1)
  if (!row) return null
  return { ...row, draft: normalizeDocument(row.draft), published: row.published ? normalizeDocument(row.published) : null }
}

export type StudioPost = NonNullable<Awaited<ReturnType<typeof getPost>>>

export async function createPost(user: StudioUser): Promise<string> {
  const db = getDb()
  const [firstAuthor] = await db.select({ id: schema.author.id }).from(schema.author).orderBy(schema.author.createdAt).limit(1)
  const slug = `untitled-${crypto.randomUUID().slice(0, 8)}`
  const doc = emptyDocument({ slug, date: new Date().toISOString(), authorId: firstAuthor?.id ?? '' })
  const [row] = await db
    .insert(schema.post)
    .values({ slug, draft: doc, createdBy: user.id, updatedBy: user.id })
    .returning({ id: schema.post.id })
  return row.id
}

async function slugTaken(slug: string, exceptId: string) {
  const [row] = await getDb()
    .select({ id: schema.post.id })
    .from(schema.post)
    .where(and(ne(schema.post.id, exceptId), or(eq(schema.post.slug, slug), sql`${schema.post.published} ->> 'slug' = ${slug}`)))
    .limit(1)
  return Boolean(row)
}

export async function saveDraft(
  id: string,
  input: unknown,
  version: number,
  user: StudioUser,
): Promise<Result<{ version: number; updatedAt: string; listChanged: boolean }>> {
  const parsed = postDocumentSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: `The post could not be saved: ${parsed.error.issues[0]?.message ?? 'invalid data'}.` }
  const doc = normalizeDocument(parsed.data)
  doc.slug = doc.slug.trim()
  if (!doc.slug) return { ok: false, error: 'The slug cannot be empty.' }
  if (await slugTaken(doc.slug, id)) return { ok: false, error: `Another post already uses the slug "${doc.slug}".` }

  const db = getDb()
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(schema.post).where(eq(schema.post.id, id)).for('update').limit(1)
    if (!current) return { ok: false as const, error: 'This post no longer exists.' }
    if (current.version !== version) {
      return { ok: false as const, error: 'Someone else saved this post since you opened it. Reload to get their changes.' }
    }
    const now = new Date()
    const before = normalizeDocument(current.draft)
    // Only these show in the post list; other edits don't need the list refreshed
    const listChanged = before.title !== doc.title || before.slug !== doc.slug || before.cover?.src !== doc.cover?.src
    const [updated] = await tx
      .update(schema.post)
      .set({ draft: doc, slug: doc.slug, version: current.version + 1, updatedBy: user.id, updatedAt: now })
      .where(eq(schema.post.id, id))
      .returning({ version: schema.post.version, updatedAt: schema.post.updatedAt })

    const [lastRevision] = await tx
      .select({ createdAt: schema.revision.createdAt })
      .from(schema.revision)
      .where(eq(schema.revision.postId, id))
      .orderBy(desc(schema.revision.createdAt))
      .limit(1)
    if (!lastRevision || now.getTime() - lastRevision.createdAt.getTime() > AUTOSAVE_REVISION_EVERY_MS) {
      await tx.insert(schema.revision).values({ postId: id, kind: 'autosave', document: doc, createdBy: user.id })
    }
    return { ok: true as const, version: updated.version, updatedAt: updated.updatedAt.toISOString(), listChanged }
  })
}

async function knownIds() {
  const db = getDb()
  const [categories, authors] = await Promise.all([
    db.select({ id: schema.category.id }).from(schema.category),
    db.select({ id: schema.author.id }).from(schema.author),
  ])
  return { categoryIds: categories.map((c) => c.id), authorIds: authors.map((a) => a.id) }
}

export async function publishPost(id: string, version: number, user: StudioUser): Promise<Result<{ status: PostStatus }>> {
  const post = await getPost(id)
  if (!post) return { ok: false, error: 'This post no longer exists.' }
  if (post.version !== version) return { ok: false, error: 'Someone else saved this post since you opened it. Reload first.' }
  const doc = post.draft
  const problems = publishProblems(doc, await knownIds())
  if (problems.length) return { ok: false, error: 'Fix these before publishing:', problems }
  if (await slugTaken(doc.slug, id)) return { ok: false, error: `Another post already uses the slug "${doc.slug}".` }

  const publishedAt = new Date(doc.date)
  const status: PostStatus = publishedAt.getTime() > Date.now() ? 'scheduled' : 'published'
  // readTime stays 0 when unset; the site works it out from the word count (estimatedReadTime).
  const snapshot: PostDocument = doc
  const previousSlug = post.published?.slug

  await getDb().transaction(async (tx) => {
    await tx
      .update(schema.post)
      .set({
        status,
        published: snapshot,
        draft: snapshot,
        publishedAt,
        lastPublishedAt: new Date(),
        publishedBy: user.id,
        updatedBy: user.id,
        updatedAt: new Date(),
        version: post.version + 1,
      })
      .where(eq(schema.post.id, id))
    await tx.insert(schema.revision).values({ postId: id, kind: 'publish', document: snapshot, createdBy: user.id })
  })
  revalidatePublicPages([doc.slug, previousSlug])
  return { ok: true, status }
}

export async function unpublishPost(id: string, user: StudioUser): Promise<Result> {
  const post = await getPost(id)
  if (!post) return { ok: false, error: 'This post no longer exists.' }
  if (!post.published) return { ok: false, error: 'This post is not published.' }
  await getDb()
    .update(schema.post)
    .set({ status: 'draft', published: null, publishedAt: null, updatedBy: user.id, updatedAt: new Date(), version: post.version + 1 })
    .where(eq(schema.post.id, id))
  revalidatePublicPages([post.published.slug])
  return { ok: true }
}

export async function discardChanges(id: string, user: StudioUser): Promise<Result> {
  const post = await getPost(id)
  if (!post?.published) return { ok: false, error: 'There is no published version to go back to.' }
  await getDb()
    .update(schema.post)
    .set({ draft: post.published, slug: post.published.slug, updatedBy: user.id, updatedAt: new Date(), version: post.version + 1 })
    .where(eq(schema.post.id, id))
  return { ok: true }
}

export async function deletePost(id: string): Promise<Result> {
  const post = await getPost(id)
  if (!post) return { ok: true }
  if (post.published) return { ok: false, error: 'Unpublish this post before deleting it.' }
  await getDb().delete(schema.post).where(eq(schema.post.id, id))
  return { ok: true }
}

export async function listRevisions(postId: string) {
  return getDb()
    .select({
      id: schema.revision.id,
      kind: schema.revision.kind,
      createdAt: schema.revision.createdAt,
      title: sql<string>`${schema.revision.document} ->> 'title'`,
      by: schema.user.name,
    })
    .from(schema.revision)
    .leftJoin(schema.user, eq(schema.user.id, schema.revision.createdBy))
    .where(eq(schema.revision.postId, postId))
    .orderBy(desc(schema.revision.createdAt))
    .limit(100)
}

export async function restoreRevision(postId: string, revisionId: string, user: StudioUser): Promise<Result> {
  const db = getDb()
  const post = await getPost(postId)
  if (!post) return { ok: false, error: 'This post no longer exists.' }
  const [revision] = await db
    .select()
    .from(schema.revision)
    .where(and(eq(schema.revision.id, revisionId), eq(schema.revision.postId, postId)))
    .limit(1)
  if (!revision) return { ok: false, error: 'That revision no longer exists.' }
  const doc = normalizeDocument(revision.document)
  if (await slugTaken(doc.slug, postId)) doc.slug = post.draft.slug
  await db.transaction(async (tx) => {
    await tx.insert(schema.revision).values({ postId, kind: 'restore', document: post.draft, createdBy: user.id })
    await tx
      .update(schema.post)
      .set({ draft: doc, slug: doc.slug, version: post.version + 1, updatedBy: user.id, updatedAt: new Date() })
      .where(eq(schema.post.id, postId))
  })
  return { ok: true }
}

export async function postCounts() {
  const rows = await getDb()
    .select({ status: schema.post.status, count: sql<number>`count(*)::int` })
    .from(schema.post)
    .groupBy(schema.post.status)
  const counts = { all: 0, draft: 0, scheduled: 0, published: 0 }
  for (const row of rows) {
    counts[row.status] = row.count
    counts.all += row.count
  }
  return counts
}

export { slugify }
