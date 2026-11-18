import 'server-only'

import { asc, count, eq, max } from 'drizzle-orm'

import { getAuth } from './auth'
import { getDb, schema } from './db'
import type { Result } from './posts'

export type TeamMember = {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor'
  createdAt: Date
  lastSeenAt: Date | null
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function userCount(): Promise<number> {
  const [row] = await getDb().select({ count: count() }).from(schema.user)
  return row?.count ?? 0
}

export async function listTeam(): Promise<TeamMember[]> {
  const rows = await getDb()
    .select({
      id: schema.user.id,
      name: schema.user.name,
      email: schema.user.email,
      role: schema.user.role,
      createdAt: schema.user.createdAt,
      lastSeenAt: max(schema.session.updatedAt),
    })
    .from(schema.user)
    .leftJoin(schema.session, eq(schema.session.userId, schema.user.id))
    .groupBy(schema.user.id)
    .orderBy(asc(schema.user.createdAt))
  return rows.map((row) => ({ ...row, role: row.role === 'admin' ? 'admin' : 'editor' }))
}

function checkPassword(password: string): string | null {
  if (password.length < 10) return 'Passwords need at least 10 characters.'
  if (password.length > 128) return 'Passwords can be at most 128 characters.'
  return null
}

export async function createTeamMember(input: {
  name: string
  email: string
  role: 'admin' | 'editor'
  password: string
}): Promise<Result<{ id: string }>> {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name) return { ok: false, error: 'Add a name.' }
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: 'That email address does not look right.' }
  const passwordProblem = checkPassword(input.password)
  if (passwordProblem) return { ok: false, error: passwordProblem }

  const ctx = await getAuth().$context
  if (await ctx.internalAdapter.findUserByEmail(email)) return { ok: false, error: `${email} already has an account.` }
  const created = await ctx.internalAdapter.createUser(
    { name, email, emailVerified: true, role: input.role === 'admin' ? 'admin' : 'editor' },
    { method: 'admin' },
  )
  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: 'credential',
    accountId: created.id,
    password: await ctx.password.hash(input.password),
  })
  return { ok: true, id: created.id }
}

async function adminCount() {
  const [row] = await getDb().select({ count: count() }).from(schema.user).where(eq(schema.user.role, 'admin'))
  return row?.count ?? 0
}

export async function setRole(userId: string, role: 'admin' | 'editor'): Promise<Result> {
  const [target] = await getDb().select({ role: schema.user.role }).from(schema.user).where(eq(schema.user.id, userId))
  if (!target) return { ok: false, error: 'That person no longer has an account.' }
  if (target.role === 'admin' && role !== 'admin' && (await adminCount()) <= 1) return { ok: false, error: 'The Studio needs at least one admin.' }
  await getDb().update(schema.user).set({ role, updatedAt: new Date() }).where(eq(schema.user.id, userId))
  return { ok: true }
}

/** Sets a new password and signs the person out everywhere. */
export async function resetPassword(userId: string, password: string): Promise<Result> {
  const passwordProblem = checkPassword(password)
  if (passwordProblem) return { ok: false, error: passwordProblem }
  const ctx = await getAuth().$context
  await ctx.internalAdapter.updatePassword(userId, await ctx.password.hash(password))
  await ctx.internalAdapter.deleteUserSessions(userId)
  return { ok: true }
}

export async function removeTeamMember(userId: string, currentUserId: string): Promise<Result> {
  if (userId === currentUserId) return { ok: false, error: 'You cannot remove your own account.' }
  const [target] = await getDb().select({ role: schema.user.role }).from(schema.user).where(eq(schema.user.id, userId))
  if (!target) return { ok: true }
  if (target.role === 'admin' && (await adminCount()) <= 1) return { ok: false, error: 'The Studio needs at least one admin.' }
  const ctx = await getAuth().$context
  await ctx.internalAdapter.deleteUserSessions(userId)
  await ctx.internalAdapter.deleteUser(userId)
  return { ok: true }
}
