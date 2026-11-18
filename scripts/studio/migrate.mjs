// Applies Studio database migrations (drizzle/*.sql) and fills empty category/author
// lists from content/categories.yml and content/authors.yml.
//
//   pnpm studio:migrate          uses DATABASE_URL (or .env.local)
//
// `pnpm build` runs this first. Without DATABASE_URL it does nothing, so the site
// still builds before the Studio database is connected.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'
import { parse as parseYaml } from 'yaml'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
for (const file of ['.env.local', '.env']) {
  const full = path.join(root, file)
  if (!process.env.DATABASE_URL && fs.existsSync(full)) process.loadEnvFile(full)
}

// Neon's Vercel integration also sets DATABASE_URL_UNPOOLED: a direct connection, which
// migrations need (the pooled one can't hold the session lock below).
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!url) {
  console.log('[studio] DATABASE_URL is not set; skipping Studio migrations.')
  process.exit(0)
}

const LOCK_ID = 7_301_984 // any constant; stops two builds migrating the same database at once
const pooled = /-pooler\./.test(new URL(url).hostname)
const client = new pg.Client({ connectionString: url })
await client.connect()
try {
  if (!pooled) await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID])
  await migrate(drizzle(client), { migrationsFolder: path.join(root, 'drizzle') })
  console.log('[studio] database migrations are up to date')

  const readYaml = (file) => {
    const full = path.join(root, file)
    return fs.existsSync(full) ? parseYaml(fs.readFileSync(full, 'utf8')) || [] : []
  }
  const { rows: categoryRows } = await client.query('SELECT count(*)::int AS n FROM studio_category')
  if (categoryRows[0].n === 0) {
    const categories = readYaml('content/categories.yml')
    for (const [index, item] of categories.entries()) {
      await client.query(
        'INSERT INTO studio_category (slug, title, description, sort_order) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING',
        [item.slug, item.title, item.description || '', index],
      )
    }
    console.log(`[studio] added ${categories.length} categories from content/categories.yml`)
  }
  const { rows: authorRows } = await client.query('SELECT count(*)::int AS n FROM studio_author')
  if (authorRows[0].n === 0) {
    const authors = readYaml('content/authors.yml')
    for (const item of authors) {
      await client.query(
        'INSERT INTO studio_author (slug, name, bio, x_handle) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING',
        [item.slug, item.name, item.bio || '', item.xHandle || ''],
      )
    }
    console.log(`[studio] added ${authors.length} authors from content/authors.yml`)
  }
} finally {
  if (!pooled) await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]).catch(() => {})
  await client.end()
}
