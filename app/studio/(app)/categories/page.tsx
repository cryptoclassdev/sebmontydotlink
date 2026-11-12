import type { Metadata } from 'next'

import { CategoriesManager } from '@/components/studio/TaxonomyManagers'
import { requireUser } from '@/lib/studio/session'
import { listCategories } from '@/lib/studio/taxonomy'

export const metadata: Metadata = { title: 'Categories' }

export default async function CategoriesPage() {
  await requireUser()
  const categories = await listCategories()
  return <CategoriesManager categories={categories.map(({ id, slug, title, description, sortOrder }) => ({ id, slug, title, description, sortOrder }))} />
}
