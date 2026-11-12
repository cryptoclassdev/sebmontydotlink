import 'server-only'

import { del, head } from '@vercel/blob'
import { desc, eq, ilike, or, sql } from 'drizzle-orm'
import fs from 'node:fs/promises'
import path from 'node:path'

import { getDb, schema } from './db'
import type { Result } from './posts'
import type { StudioUser } from './session'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024
/** Local-only uploads when no Blob store is connected (`next dev`). Gitignored. */
export const DEV_UPLOAD_DIR = 'studio-uploads'

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export function canUseDevUploads(): boolean {
  return !isBlobConfigured() && process.env.NODE_ENV !== 'production'
}

export type MediaItem = typeof schema.media.$inferSelect

export async function listMedia(q?: string): Promise<MediaItem[]> {
  const term = q?.trim() ? `%${q.trim()}%` : null
  return getDb()
    .select()
    .from(schema.media)
    .where(term ? or(ilike(schema.media.filename, term), ilike(schema.media.alt, term), ilike(schema.media.caption, term)) : undefined)
    .orderBy(desc(schema.media.createdAt))
    .limit(300)
}

type NewMedia = {
  url: string
  pathname: string
  filename: string
  contentType: string
  size: number
  width: number | null
  height: number | null
}

function isOwnBlobUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.public.blob.vercel-storage.com')
  } catch {
    return false
  }
}

/** Records a file the browser just uploaded to the Blob store. */
export async function registerMedia(input: NewMedia, user: StudioUser): Promise<Result<{ item: MediaItem }>> {
  let { size, contentType } = input
  if (input.url.startsWith(`/${DEV_UPLOAD_DIR}/`)) {
    if (!canUseDevUploads()) return { ok: false, error: 'Local uploads only work in development.' }
  } else {
    if (!isOwnBlobUrl(input.url)) return { ok: false, error: 'That file is not in the Studio media store.' }
    try {
      const blob = await head(input.url)
      size = blob.size
      contentType = blob.contentType
    } catch {
      return { ok: false, error: 'The upload could not be found in the media store. Try again.' }
    }
  }
  if (!ALLOWED_IMAGE_TYPES.includes(contentType)) return { ok: false, error: `${contentType} files are not supported. Use JPG, PNG, WebP, GIF or AVIF.` }
  const [item] = await getDb()
    .insert(schema.media)
    .values({
      url: input.url,
      pathname: input.pathname,
      filename: input.filename.slice(0, 200),
      contentType,
      size,
      width: input.width && input.width > 0 ? Math.round(input.width) : null,
      height: input.height && input.height > 0 ? Math.round(input.height) : null,
      uploadedBy: user.id,
    })
    .returning()
  return { ok: true, item }
}

/** Development fallback: saves the file into public/studio-uploads instead of the Blob store. */
export async function saveDevUpload(file: File): Promise<{ url: string; pathname: string }> {
  if (!canUseDevUploads()) throw new Error('Local uploads only work in development.')
  const ext = (path.extname(file.name) || '.bin').toLowerCase().replace(/[^.a-z0-9]/g, '')
  const base = path.basename(file.name, path.extname(file.name)).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60) || 'image'
  const name = `${base}-${crypto.randomUUID().slice(0, 8)}${ext}`
  const dir = path.join(process.cwd(), 'public', DEV_UPLOAD_DIR)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()))
  return { url: `/${DEV_UPLOAD_DIR}/${name}`, pathname: `${DEV_UPLOAD_DIR}/${name}` }
}

export async function updateMediaDetails(
  id: string,
  details: { alt: string; caption: string; credit: string; creditUrl: string },
): Promise<Result<{ item: MediaItem }>> {
  if (details.creditUrl && !/^https?:\/\//.test(details.creditUrl)) return { ok: false, error: 'Credit link must start with https://' }
  const [item] = await getDb()
    .update(schema.media)
    .set({
      alt: details.alt.slice(0, 1000),
      caption: details.caption.slice(0, 2000),
      credit: details.credit.slice(0, 500),
      creditUrl: details.creditUrl.slice(0, 2000),
      updatedAt: new Date(),
    })
    .where(eq(schema.media.id, id))
    .returning()
  if (!item) return { ok: false, error: 'That file no longer exists.' }
  return { ok: true, item }
}

/** Posts (draft or live) whose content mentions this file. */
export async function mediaUsage(url: string) {
  return getDb()
    .select({ id: schema.post.id, title: sql<string>`${schema.post.draft} ->> 'title'` })
    .from(schema.post)
    .where(or(sql`${schema.post.draft}::text LIKE ${'%' + url + '%'}`, sql`coalesce(${schema.post.published}::text, '') LIKE ${'%' + url + '%'}`))
    .limit(20)
}

export async function deleteMedia(id: string): Promise<Result> {
  const db = getDb()
  const [item] = await db.select().from(schema.media).where(eq(schema.media.id, id)).limit(1)
  if (!item) return { ok: true }
  const usedBy = await mediaUsage(item.url)
  if (usedBy.length) {
    return { ok: false, error: `This image is used in: ${usedBy.map((p) => p.title || 'Untitled').join(', ')}. Remove it there first.` }
  }
  if (item.url.startsWith(`/${DEV_UPLOAD_DIR}/`)) {
    await fs.rm(path.join(process.cwd(), 'public', item.pathname), { force: true })
  } else if (isBlobConfigured()) {
    await del(item.url)
  }
  await db.delete(schema.media).where(eq(schema.media.id, id))
  return { ok: true }
}
