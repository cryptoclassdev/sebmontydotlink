import 'server-only'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import { getAuth, isAuthConfigured } from './auth'

export type StudioUser = {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor'
}

/** The signed-in Studio user, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<StudioUser | null> => {
  if (!isAuthConfigured()) return null
  const session = await getAuth().api.getSession({ headers: await headers() })
  if (!session) return null
  const role = (session.user as { role?: string }).role === 'admin' ? 'admin' : 'editor'
  return { id: session.user.id, name: session.user.name, email: session.user.email, role }
})

/** For pages and server actions: sends anyone not signed in to the login page. */
export async function requireUser(): Promise<StudioUser> {
  const user = await getCurrentUser()
  if (!user) redirect('/studio/login')
  return user
}

export async function requireAdmin(): Promise<StudioUser> {
  const user = await requireUser()
  if (user.role !== 'admin') throw new Error('Only admins can do that.')
  return user
}
