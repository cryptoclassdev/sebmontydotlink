import type { Metadata } from 'next'

import { MediaManager } from '@/components/studio/MediaManager'
import { canUseDevUploads, isBlobConfigured, listMedia } from '@/lib/studio/media'
import { requireUser } from '@/lib/studio/session'

export const metadata: Metadata = { title: 'Media' }

export default async function MediaPage() {
  await requireUser()
  const items = await listMedia()
  return <MediaManager initialItems={items} uploadMode={isBlobConfigured() ? 'blob' : canUseDevUploads() ? 'dev' : 'off'} />
}
