import 'server-only'

import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Cache tag on everything the public site reads from the Studio database
 * (lib/studio/public.ts). Expiring it is the only way, apart from a daily refresh,
 * that public pages read the database again.
 */
export const PUBLIC_DATA_TAG = 'studio-public'

/**
 * Refresh every public page that can show an article: after a publish or unpublish,
 * a comment approved or removed, or a category or author change.
 */
export function revalidatePublicPages(slugs: Array<string | null | undefined> = []) {
  revalidateTag(PUBLIC_DATA_TAG, { expire: 0 })
  revalidatePath('/')
  revalidatePath('/blog', 'layout')
  revalidatePath('/llms.txt')
  for (const slug of new Set(slugs.filter(Boolean) as string[])) {
    revalidatePath(`/blog/${slug}`)
    revalidatePath(`/agent/articles/${slug}`)
  }
}
