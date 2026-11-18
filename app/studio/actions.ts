'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { deleteComment, moderateComment, type CommentStatus } from '@/lib/studio/comments'
import {
  deleteMedia,
  listMedia,
  registerMedia,
  saveDevUpload,
  updateMediaDetails,
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
} from '@/lib/studio/media'
import {
  createPost,
  deletePost,
  discardChanges,
  listRevisions,
  publishPost,
  restoreRevision,
  saveDraft,
  unpublishPost,
} from '@/lib/studio/posts'
import { revalidatePublicPages } from '@/lib/studio/revalidate'
import { requireAdmin, requireUser } from '@/lib/studio/session'
import { deleteAuthor, deleteCategory, saveAuthor, saveCategory } from '@/lib/studio/taxonomy'
import { createTeamMember, removeTeamMember, resetPassword, setRole, userCount } from '@/lib/studio/users'

// ---------------------------------------------------------------- posts

export async function createPostAction() {
  const user = await requireUser()
  const id = await createPost(user)
  revalidatePath('/studio/posts', 'layout')
  redirect(`/studio/posts/${id}`)
}

export async function saveDraftAction(id: string, doc: unknown, version: number) {
  const user = await requireUser()
  const result = await saveDraft(id, doc, version, user)
  if (result.ok && result.listChanged) revalidatePath('/studio/posts', 'layout')
  return result
}

export async function publishAction(id: string, version: number) {
  const user = await requireUser()
  const result = await publishPost(id, version, user)
  revalidatePath('/studio/posts', 'layout')
  return result
}

export async function unpublishAction(id: string) {
  const user = await requireUser()
  const result = await unpublishPost(id, user)
  revalidatePath('/studio/posts', 'layout')
  return result
}

export async function discardChangesAction(id: string) {
  const user = await requireUser()
  const result = await discardChanges(id, user)
  revalidatePath('/studio/posts', 'layout')
  return result
}

export async function deletePostAction(id: string) {
  await requireUser()
  const result = await deletePost(id)
  if (!result.ok) return result
  revalidatePath('/studio/posts', 'layout')
  redirect('/studio/posts')
}

export async function listRevisionsAction(postId: string) {
  await requireUser()
  const rows = await listRevisions(postId)
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }))
}

export async function restoreRevisionAction(postId: string, revisionId: string) {
  const user = await requireUser()
  const result = await restoreRevision(postId, revisionId, user)
  revalidatePath('/studio/posts', 'layout')
  return result
}

// ---------------------------------------------------------------- media

export async function listMediaAction(q?: string) {
  await requireUser()
  return listMedia(q)
}

export async function registerMediaAction(input: {
  url: string
  pathname: string
  filename: string
  contentType: string
  size: number
  width: number | null
  height: number | null
}) {
  const user = await requireUser()
  const result = await registerMedia(input, user)
  revalidatePath('/studio/media')
  return result
}

/** Development only: the browser posts the file here when no Blob store is connected. */
export async function devUploadAction(formData: FormData) {
  const user = await requireUser()
  const file = formData.get('file')
  if (!(file instanceof File)) return { ok: false as const, error: 'No file received.' }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { ok: false as const, error: `${file.type || 'This file type'} is not supported.` }
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false as const, error: 'Files can be at most 25 MB.' }
  const saved = await saveDevUpload(file)
  const width = Number(formData.get('width')) || null
  const height = Number(formData.get('height')) || null
  const result = await registerMedia(
    { ...saved, filename: file.name, contentType: file.type, size: file.size, width, height },
    user,
  )
  revalidatePath('/studio/media')
  return result
}

export async function updateMediaAction(id: string, details: { alt: string; caption: string; credit: string; creditUrl: string }) {
  await requireUser()
  const result = await updateMediaDetails(id, details)
  revalidatePath('/studio/media')
  return result
}

export async function deleteMediaAction(id: string) {
  await requireUser()
  const result = await deleteMedia(id)
  revalidatePath('/studio/media')
  return result
}

// ---------------------------------------------------------------- comments

export async function moderateCommentAction(id: string, status: CommentStatus) {
  const user = await requireUser()
  const result = await moderateComment(id, status, user)
  if (result.ok && result.postSlug) revalidatePublicPages([result.postSlug])
  revalidatePath('/studio', 'layout')
  return result
}

export async function deleteCommentAction(id: string) {
  await requireUser()
  const result = await deleteComment(id)
  revalidatePath('/studio', 'layout')
  return result
}

// ---------------------------------------------------------------- categories and authors

export async function saveCategoryAction(input: { id?: string; slug: string; title: string; description: string; sortOrder: number }) {
  await requireUser()
  const result = await saveCategory(input)
  revalidatePath('/studio/categories')
  if (result.ok) revalidatePublicPages()
  return result
}

export async function deleteCategoryAction(id: string) {
  await requireUser()
  const result = await deleteCategory(id)
  revalidatePath('/studio/categories')
  return result
}

export async function saveAuthorAction(input: { id?: string; slug: string; name: string; bio: string; xHandle: string; avatarUrl: string }) {
  await requireUser()
  const result = await saveAuthor(input)
  revalidatePath('/studio/authors')
  if (result.ok) revalidatePublicPages()
  return result
}

export async function deleteAuthorAction(id: string) {
  await requireUser()
  const result = await deleteAuthor(id)
  revalidatePath('/studio/authors')
  return result
}

// ---------------------------------------------------------------- team (admins only)

export async function createTeamMemberAction(input: { name: string; email: string; role: 'admin' | 'editor'; password: string }) {
  await requireAdmin()
  const result = await createTeamMember(input)
  revalidatePath('/studio/team')
  return result
}

export async function setRoleAction(userId: string, role: 'admin' | 'editor') {
  await requireAdmin()
  const result = await setRole(userId, role)
  revalidatePath('/studio/team')
  return result
}

export async function resetPasswordAction(userId: string, password: string) {
  await requireAdmin()
  return resetPassword(userId, password)
}

export async function removeTeamMemberAction(userId: string) {
  const admin = await requireAdmin()
  const result = await removeTeamMember(userId, admin.id)
  revalidatePath('/studio/team')
  return result
}

// ---------------------------------------------------------------- first-run setup

export type SetupState = { error?: string; values?: { name: string; email: string } }

/** Creates the first admin. Only works while the Studio has no accounts, and needs STUDIO_SETUP_TOKEN. */
export async function setupAction(_state: SetupState, formData: FormData): Promise<SetupState> {
  const expected = process.env.STUDIO_SETUP_TOKEN
  if (!expected) return { error: 'Set STUDIO_SETUP_TOKEN in the environment first.' }
  if ((await userCount()) > 0) return { error: 'The Studio already has an admin. Sign in instead.' }
  const field = (name: string) => String(formData.get(name) || '')
  // Sent back so the form keeps what was typed (passwords and the code are re-entered)
  const values = { name: field('name'), email: field('email') }
  if (field('token') !== expected) return { error: 'That setup code is wrong.', values }
  if (field('password') !== field('confirm')) return { error: 'The two passwords do not match.', values }
  const result = await createTeamMember({ name: values.name, email: values.email, role: 'admin', password: field('password') })
  if (!result.ok) return { error: result.error, values }
  redirect('/studio/login?setup=done')
}
