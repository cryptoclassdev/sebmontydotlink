import type { Metadata } from 'next'

import { AuthorsManager } from '@/components/studio/TaxonomyManagers'
import { requireUser } from '@/lib/studio/session'
import { listAuthors } from '@/lib/studio/taxonomy'

export const metadata: Metadata = { title: 'Authors' }

export default async function AuthorsPage() {
  await requireUser()
  const authors = await listAuthors()
  return <AuthorsManager authors={authors.map(({ id, slug, name, bio, xHandle, avatarUrl }) => ({ id, slug, name, bio, xHandle, avatarUrl }))} />
}
