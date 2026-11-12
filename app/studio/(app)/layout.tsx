import { NotConfigured } from '@/components/studio/NotConfigured'
import { TopBar } from '@/components/studio/TopBar'
import { isAuthConfigured } from '@/lib/studio/auth'
import { commentCounts } from '@/lib/studio/comments'
import { requireUser } from '@/lib/studio/session'

export const dynamic = 'force-dynamic'

export default async function StudioAppLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthConfigured()) return <NotConfigured />
  const user = await requireUser()
  const counts = await commentCounts()
  return (
    <>
      <TopBar user={user} pendingComments={counts.pending} />
      {children}
    </>
  )
}
