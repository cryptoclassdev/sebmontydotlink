import 'server-only'

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

export type StudioDb = NodePgDatabase<typeof schema>

const globalForDb = globalThis as unknown as { studioPool?: Pool; studioDb?: StudioDb }

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

/** One pool per server instance. Use Neon's pooled connection string in production. */
export function getDb(): StudioDb {
  if (globalForDb.studioDb) return globalForDb.studioDb
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set. See docs/studio.md.')
  const pool =
    globalForDb.studioPool ??
    new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    })
  // An idle connection dropped by the server must not crash the process
  if (!globalForDb.studioPool) pool.on('error', (error) => console.error('[studio] database connection error', error.message))
  globalForDb.studioPool = pool
  globalForDb.studioDb = drizzle(pool, { schema })
  return globalForDb.studioDb
}

export { schema }
