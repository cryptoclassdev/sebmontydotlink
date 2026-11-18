'use client'

import { upload } from '@vercel/blob/client'

import { devUploadAction, registerMediaAction } from '@/app/studio/actions'
import type { MediaItem } from '@/lib/studio/media'

export type UploadMode = 'blob' | 'dev' | 'off'

export const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp,image/gif,image/avif'

async function imageSize(file: File): Promise<{ width: number | null; height: number | null }> {
  try {
    const bitmap = await createImageBitmap(file)
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return size
  } catch {
    return { width: null, height: null }
  }
}

function safeName(name: string) {
  const dot = name.lastIndexOf('.')
  const ext = dot > 0 ? name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g, '') : ''
  const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'image'
  return `${base}${ext}`
}

/** Uploads an image (straight to Vercel Blob, or to public/ in local dev) and adds it to the media library. */
export async function uploadImage(file: File, mode: UploadMode): Promise<MediaItem> {
  if (mode === 'off') throw new Error('Uploads are off: connect a Vercel Blob store (see docs/studio.md).')
  const { width, height } = await imageSize(file)
  if (mode === 'dev') {
    const form = new FormData()
    form.set('file', file)
    if (width) form.set('width', String(width))
    if (height) form.set('height', String(height))
    const result = await devUploadAction(form)
    if (!result.ok) throw new Error(result.error)
    return result.item
  }
  const blob = await upload(`studio/${safeName(file.name)}`, file, {
    access: 'public',
    handleUploadUrl: '/api/studio/upload',
    contentType: file.type,
  })
  const result = await registerMediaAction({
    url: blob.url,
    pathname: blob.pathname,
    filename: file.name,
    contentType: file.type,
    size: file.size,
    width,
    height,
  })
  if (!result.ok) throw new Error(result.error)
  return result.item
}
