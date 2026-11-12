import 'server-only'

import { revalidatePath } from 'next/cache'

/** Refresh every public page that can show an article, after a publish, unpublish or edit to live content. */
export function revalidatePublicPages(slugs: Array<string | null | undefined> = []) {
  revalidatePath('/')
  revalidatePath('/blog', 'layout')
  revalidatePath('/llms.txt')
  for (const slug of new Set(slugs.filter(Boolean) as string[])) {
    revalidatePath(`/blog/${slug}`)
    revalidatePath(`/agent/articles/${slug}`)
  }
}
