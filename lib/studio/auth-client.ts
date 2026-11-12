'use client'

import { createAuthClient } from 'better-auth/react'

let client: ReturnType<typeof createAuthClient> | null = null

/** Browser client for sign-in, sign-out and password changes. */
export function getAuthClient() {
  if (!client) client = createAuthClient({ baseURL: `${window.location.origin}/api/studio/auth` })
  return client
}
