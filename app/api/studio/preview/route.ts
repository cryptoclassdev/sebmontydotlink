import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import { getPost } from '@/lib/studio/posts'
import { getCurrentUser } from '@/lib/studio/session'

export const dynamic = 'force-dynamic'

// Studio "Preview": turns on Next.js draft mode for this browser and opens the article page,
// which then shows the draft to signed-in Studio users (app/blog/[slug]/page.tsx).
export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) redirect('/studio/login')
  const id = new URL(request.url).searchParams.get('id') || ''
  const post = await getPost(id)
  if (!post) return new Response('That post no longer exists.', { status: 404 })
  ;(await draftMode()).enable()
  redirect(`/blog/${encodeURIComponent(post.draft.slug)}`)
}
