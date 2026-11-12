import 'server-only'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { getDb, schema } from './db'

export const AUTH_BASE_PATH = '/api/studio/auth'

function trustedOrigins(): string[] {
  const origins = new Set<string>()
  const add = (value?: string) => {
    if (!value) return
    origins.add(value.startsWith('http') ? value.replace(/\/$/, '') : `https://${value}`)
  }
  add(process.env.BETTER_AUTH_URL)
  add(process.env.NEXT_PUBLIC_SITE_URL)
  add('https://www.sebmonty.link')
  add('https://sebmonty.link')
  // Vercel preview and production deployment URLs
  add(process.env.VERCEL_URL)
  add(process.env.VERCEL_BRANCH_URL)
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  if (process.env.NODE_ENV !== 'production') {
    add('http://localhost:3000')
    add('http://127.0.0.1:3000')
  }
  return [...origins]
}

function createAuth() {
  return betterAuth({
    appName: 'Studio',
    basePath: AUTH_BASE_PATH,
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: trustedOrigins(),
    database: drizzleAdapter(getDb(), {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        rateLimit: schema.rateLimit,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // Accounts are created by an admin on the Team page (or by first-run setup), never by sign-up.
      disableSignUp: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {
        role: { type: 'string', required: false, defaultValue: 'editor', input: false },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 60,
      max: 60,
      customRules: {
        '/sign-in/email': { window: 300, max: 8 },
        '/change-password': { window: 300, max: 5 },
      },
    },
    advanced: {
      cookiePrefix: 'studio',
    },
    telemetry: { enabled: false },
  })
}

type StudioAuth = ReturnType<typeof createAuth>

const globalForAuth = globalThis as unknown as { studioAuth?: StudioAuth }

/** Created on first use so builds don't need the database or secret. */
export function getAuth(): StudioAuth {
  if (!globalForAuth.studioAuth) globalForAuth.studioAuth = createAuth()
  return globalForAuth.studioAuth
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET)
}
