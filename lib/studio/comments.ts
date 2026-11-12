import 'server-only'

import { and, count, desc, eq, gt, sql } from 'drizzle-orm'
import { createHash } from 'node:crypto'

import { getDb, schema } from './db'
import type { Result } from './posts'
import type { StudioUser } from './session'

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam'

export const COMMENT_LIMITS = { name: 80, email: 200, body: 4000, perIpPer10Min: 3 }

export async function listComments(status: CommentStatus | 'all' = 'pending') {
  return getDb()
    .select({
      id: schema.comment.id,
      name: schema.comment.name,
      email: schema.comment.email,
      body: schema.comment.body,
      status: schema.comment.status,
      createdAt: schema.comment.createdAt,
      moderatedAt: schema.comment.moderatedAt,
      postId: schema.comment.postId,
      postTitle: sql<string>`coalesce(${schema.post.published} ->> 'title', ${schema.post.draft} ->> 'title')`,
      postSlug: sql<string>`coalesce(${schema.post.published} ->> 'slug', ${schema.post.slug})`,
      moderatedBy: schema.user.name,
    })
    .from(schema.comment)
    .innerJoin(schema.post, eq(schema.post.id, schema.comment.postId))
    .leftJoin(schema.user, eq(schema.user.id, schema.comment.moderatedBy))
    .where(status === 'all' ? undefined : eq(schema.comment.status, status))
    .orderBy(desc(schema.comment.createdAt))
    .limit(300)
}

export async function commentCounts() {
  const rows = await getDb()
    .select({ status: schema.comment.status, count: count() })
    .from(schema.comment)
    .groupBy(schema.comment.status)
  const counts: Record<CommentStatus | 'all', number> = { all: 0, pending: 0, approved: 0, rejected: 0, spam: 0 }
  for (const row of rows) {
    counts[row.status] = row.count
    counts.all += row.count
  }
  return counts
}

export async function moderateComment(id: string, status: CommentStatus, user: StudioUser): Promise<Result<{ postSlug: string | null }>> {
  const [row] = await getDb()
    .update(schema.comment)
    .set({ status, moderatedBy: user.id, moderatedAt: new Date() })
    .where(eq(schema.comment.id, id))
    .returning({ postId: schema.comment.postId })
  if (!row) return { ok: false, error: 'That comment no longer exists.' }
  const [post] = await getDb()
    .select({ slug: sql<string | null>`${schema.post.published} ->> 'slug'` })
    .from(schema.post)
    .where(eq(schema.post.id, row.postId))
  return { ok: true, postSlug: post?.slug ?? null }
}

export async function deleteComment(id: string): Promise<Result> {
  await getDb().delete(schema.comment).where(eq(schema.comment.id, id))
  return { ok: true }
}

export function hashIp(ip: string) {
  const salt = process.env.BETTER_AUTH_SECRET || 'studio'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

/** Saves a reader's comment as pending. Called by the public /api/studio/comments endpoint. */
export async function submitComment(input: {
  slug: string
  name: string
  email: string
  body: string
  ip: string
  userAgent: string
}): Promise<Result> {
  const name = input.name.trim()
  const body = input.body.trim()
  const email = input.email.trim()
  if (!name || name.length > COMMENT_LIMITS.name) return { ok: false, error: `Name is required (up to ${COMMENT_LIMITS.name} characters).` }
  if (!body || body.length > COMMENT_LIMITS.body) return { ok: false, error: `Comment is required (up to ${COMMENT_LIMITS.body} characters).` }
  if (email && (email.length > COMMENT_LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { ok: false, error: 'That email address does not look right.' }

  const db = getDb()
  const [post] = await db
    .select({ id: schema.post.id })
    .from(schema.post)
    .where(and(eq(schema.post.status, 'published'), sql`${schema.post.published} ->> 'slug' = ${input.slug}`))
    .limit(1)
  if (!post) return { ok: false, error: 'That article does not exist.' }

  const ipHash = hashIp(input.ip || 'unknown')
  const [recent] = await db
    .select({ count: count() })
    .from(schema.comment)
    .where(and(eq(schema.comment.ipHash, ipHash), gt(schema.comment.createdAt, new Date(Date.now() - 10 * 60 * 1000))))
  if ((recent?.count ?? 0) >= COMMENT_LIMITS.perIpPer10Min) return { ok: false, error: 'Too many comments in a short time. Try again in a few minutes.' }

  await db.insert(schema.comment).values({ postId: post.id, name, email, body, ipHash, userAgent: input.userAgent.slice(0, 300) })
  return { ok: true }
}
