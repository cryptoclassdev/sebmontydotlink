import type { Metadata } from 'next'

import { TeamManager } from '@/components/studio/TeamManager'
import { requireUser } from '@/lib/studio/session'
import { listTeam } from '@/lib/studio/users'

export const metadata: Metadata = { title: 'Team' }

export default async function TeamPage() {
  const user = await requireUser()
  const team = await listTeam()
  return (
    <TeamManager
      currentUserId={user.id}
      isAdmin={user.role === 'admin'}
      team={team.map((member) => ({ ...member, createdAt: member.createdAt.toISOString(), lastSeenAt: member.lastSeenAt ? new Date(member.lastSeenAt).toISOString() : null }))}
    />
  )
}
