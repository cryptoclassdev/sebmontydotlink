import 'server-only'

import { and, asc, desc, eq, inArray, isNotNull, lte, or, sql } from 'drizzle-orm'

import type { Author, Category, Post } from '@/lib/blog/types'

import { getDb, schema } from './db'
import { estimatedReadTime, normalizeDocument, type PostDocument } from './document'

// What the public site reads from the Studio: published posts as the blog's Post type.
// A post is live when it has a published snapshot whose date has arrived
// (so scheduled posts appear on their own once their time comes).

const BLOB_HOST = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//

/** Only site paths and our own Blob store can go through next/image. */
function safeImageUrl(url: string | undefined) {
  if (!url) return undefined
  return url.startsWith('/') || BLOB_HOST.test(url) ? url : undefined
}

type Lookup = { authors: Map<string, Author>; categories: Map<string, Category> }

async function lookups(): Promise<Lookup> {
  const db = getDb()
  const [authorRows, categoryRows] = await Promise.all([
    db.select().from(schema.author),
    db.select().from(schema.category).orderBy(asc(schema.category.sortOrder)),
  ])
  return {
    authors: new Map(
      authorRows.map((row) => [
        row.id,
        { _id: row.id, name: row.name, slug: row.slug, bio: row.bio || undefined, xHandle: row.xHandle || undefined, imageUrl: safeImageUrl(row.avatarUrl) },
      ]),
    ),
    categories: new Map(
      categoryRows.map((row) => [row.id, { _id: row.id, title: row.title, slug: row.slug, description: row.description || undefined }]),
    ),
  }
}

function toPost(
  row: { id: string; updatedAt: Date; lastPublishedAt: Date | null },
  input: PostDocument,
  { authors, categories }: Lookup,
  options: { status: 'published' | 'draft'; commentCount?: number },
): Post {
  const doc = normalizeDocument(input)
  const category = categories.get(doc.categoryId)
  const author = authors.get(doc.authorId)
  const cover = doc.cover
  return {
    _id: row.id,
    _updatedAt: doc.updated || doc.date,
    title: doc.title,
    subtitle: doc.deck || undefined,
    slug: doc.slug,
    excerpt: doc.excerpt || doc.deck || undefined,
    author,
    category,
    categories: category ? [category.title] : [],
    publishedAt: doc.date,
    isFeatured: doc.featured,
    readTime: doc.readTime || estimatedReadTime(doc.body),
    likes: 0,
    commentCount: options.commentCount ?? 0,
    hideEyebrowRules: true,
    localMainImage: cover
      ? {
          src: cover.src,
          width: cover.width,
          height: cover.height,
          alt: cover.alt,
          caption: [cover.caption, cover.credit].filter(Boolean).join(' ') || undefined,
          position: cover.position,
        }
      : undefined,
    disclosure: doc.disclosure || undefined,
    status: options.status,
    source: 'studio',
    seo: {
      title: doc.seo.title || undefined,
      description: doc.seo.description || undefined,
      image: doc.seo.image ? { src: doc.seo.image.src, width: doc.seo.image.width, height: doc.seo.image.height, alt: doc.seo.image.alt } : undefined,
      canonicalUrl: doc.seo.canonicalUrl || undefined,
      noindex: doc.seo.noindex,
    },
    body: doc.body as Post['body'],
  }
}

const isLive = () =>
  and(
    or(eq(schema.post.status, 'published'), eq(schema.post.status, 'scheduled')),
    isNotNull(schema.post.published),
    lte(schema.post.publishedAt, new Date()),
  )

async function approvedCounts(postIds: string[]) {
  if (!postIds.length) return new Map<string, number>()
  const rows = await getDb()
    .select({ postId: schema.comment.postId, count: sql<number>`count(*)::int` })
    .from(schema.comment)
    .where(and(inArray(schema.comment.postId, postIds), eq(schema.comment.status, 'approved')))
    .groupBy(schema.comment.postId)
  return new Map(rows.map((row) => [row.postId, row.count]))
}

/** Every live post, newest first, with bodies. */
export async function getLiveStudioPosts(): Promise<Post[]> {
  const [rows, lookup] = await Promise.all([
    getDb()
      .select({
        id: schema.post.id,
        published: schema.post.published,
        updatedAt: schema.post.updatedAt,
        lastPublishedAt: schema.post.lastPublishedAt,
      })
      .from(schema.post)
      .where(isLive())
      .orderBy(desc(schema.post.publishedAt)),
    lookups(),
  ])
  const counts = await approvedCounts(rows.map((row) => row.id))
  return rows.map((row) => toPost(row, row.published as PostDocument, lookup, { status: 'published', commentCount: counts.get(row.id) }))
}

/** A Studio draft for preview, looked up by its draft slug (or its live slug). */
export async function getStudioDraftPost(slug: string): Promise<Post | null> {
  const [row] = await getDb()
    .select()
    .from(schema.post)
    .where(or(eq(schema.post.slug, slug), sql`${schema.post.published} ->> 'slug' = ${slug}`))
    .orderBy(sql`(${schema.post.slug} = ${slug}) DESC`)
    .limit(1)
  if (!row) return null
  return toPost(row, row.draft, await lookups(), { status: 'draft' })
}

export async function getStudioCategories(): Promise<Category[]> {
  const rows = await getDb().select().from(schema.category).orderBy(asc(schema.category.sortOrder), asc(schema.category.title))
  return rows.map((row) => ({ _id: row.id, title: row.title, slug: row.slug, description: row.description || undefined }))
}

export type PublicComment = { id: string; name: string; body: string; createdAt: string }

export async function getApprovedComments(postId: string): Promise<PublicComment[]> {
  const rows = await getDb()
    .select({ id: schema.comment.id, name: schema.comment.name, body: schema.comment.body, createdAt: schema.comment.createdAt })
    .from(schema.comment)
    .where(and(eq(schema.comment.postId, postId), eq(schema.comment.status, 'approved')))
    .orderBy(asc(schema.comment.createdAt))
    .limit(500)
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))
}
