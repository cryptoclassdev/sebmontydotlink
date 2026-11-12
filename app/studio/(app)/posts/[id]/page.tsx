import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PostEditor } from '@/components/studio/PostEditor'
import { canUseDevUploads, isBlobConfigured } from '@/lib/studio/media'
import { getPost } from '@/lib/studio/posts'
import { requireUser } from '@/lib/studio/session'
import { listAuthors, listCategories } from '@/lib/studio/taxonomy'

export const metadata: Metadata = { title: 'Edit post' }

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser()
  const { id } = await params
  const [post, categories, authors] = await Promise.all([getPost(id), listCategories(), listAuthors()])
  if (!post) notFound()
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sebmonty.link').replace(/\/$/, '')
  return (
    <PostEditor
      key={post.id}
      post={{
        id: post.id,
        status: post.status,
        version: post.version,
        draft: post.draft,
        published: post.published,
        updatedAt: post.updatedAt.toISOString(),
        lastPublishedAt: post.lastPublishedAt?.toISOString() ?? null,
      }}
      categories={categories.map((c) => ({ id: c.id, label: c.title }))}
      authors={authors.map((a) => ({ id: a.id, label: a.name }))}
      uploadMode={isBlobConfigured() ? 'blob' : canUseDevUploads() ? 'dev' : 'off'}
      siteUrl={siteUrl}
    />
  )
}
