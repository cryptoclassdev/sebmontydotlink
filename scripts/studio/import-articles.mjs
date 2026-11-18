// Copies the Markdown articles in content/articles/ into the Studio database by hand.
// Normally not needed: the first build with the Studio database does this automatically.
//
//   pnpm studio:import-articles            import every article not already in the Studio
//   pnpm studio:import-articles --dry-run  show what would happen
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import pg from 'pg'

import { importMarkdownArticles } from './import-markdown.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
for (const file of ['.env.local', '.env']) {
  const full = path.join(root, file)
  if (fs.existsSync(full)) process.loadEnvFile(full)
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.')
  process.exit(1)
}
const dryRun = process.argv.includes('--dry-run')

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
try {
  const { imported } = await importMarkdownArticles({ client, root, dryRun })
  console.log(
    `${dryRun ? 'Dry run: ' : ''}${imported.length} article(s) imported${process.env.BLOB_READ_WRITE_TOKEN ? ' (images uploaded to Vercel Blob)' : ' (images left in public/)'}.`,
  )
} finally {
  await client.end()
}
