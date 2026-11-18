// Copies the Markdown articles in content/articles/ into the Studio database.
//
//   pnpm studio:import-articles            import every article not already in the Studio
//   pnpm studio:import-articles --dry-run  show what would happen
//
// Images are uploaded to the Vercel Blob store when BLOB_READ_WRITE_TOKEN is set; otherwise
// (local testing) posts keep pointing at the files in public/. Articles whose slug already
// exists in the Studio are skipped, so running it twice is safe.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { put } from '@vercel/blob'
import pg from 'pg'
import { parse as parseYaml } from 'yaml'

import { compileArticles } from '../../lib/publishing/compile.mjs'

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
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN)

const CONTENT_TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' }

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

const { articles } = compileArticles({ root, includeDrafts: true })
const categories = new Map((await client.query('SELECT id, slug FROM studio_category')).rows.map((r) => [r.slug, r.id]))
const authors = new Map((await client.query('SELECT id, slug FROM studio_author')).rows.map((r) => [r.slug, r.id]))
const uploaded = new Map()

/** Uploads one public/ file (once) and records it in the media library. Returns the Studio image fields. */
async function importImage(image, details = {}) {
  if (uploaded.has(image.src)) return { ...uploaded.get(image.src), ...details }
  const file = path.join(root, 'public', decodeURI(image.src))
  const ext = path.extname(file).toLowerCase()
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'
  const size = fs.statSync(file).size
  let url = image.src
  let pathname = image.src.replace(/^\//, '')
  if (useBlob && !dryRun) {
    const blob = await put(`studio${image.src}`, fs.readFileSync(file), { access: 'public', contentType, addRandomSuffix: true })
    url = blob.url
    pathname = blob.pathname
  }
  let mediaId
  if (!dryRun) {
    const { rows } = await client.query(
      `INSERT INTO studio_media (url, pathname, filename, content_type, size, width, height, alt, caption)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (url) DO UPDATE SET updated_at = now() RETURNING id`,
      [url, pathname, path.basename(file), contentType, size, image.width, image.height, details.alt || '', details.caption || ''],
    )
    mediaId = rows[0].id
  }
  const result = { mediaId, src: url, width: image.width, height: image.height }
  uploaded.set(image.src, result)
  return { ...result, ...details }
}

let imported = 0
for (const { post, sourceFile } of articles) {
  const { rows: existing } = await client.query("SELECT id FROM studio_post WHERE slug = $1 OR published ->> 'slug' = $1", [post.slug])
  if (existing.length) {
    console.log(`skip  ${post.slug} (already in the Studio)`)
    continue
  }
  const source = fs.readFileSync(path.join(root, sourceFile), 'utf8')
  const frontmatter = parseYaml(source.split(/^---\s*$/m)[1]) || {}

  const body = []
  for (const block of post.body) {
    if (block._type === 'localImage') {
      const image = await importImage(block, { alt: block.alt, ...(block.caption ? { caption: block.caption } : {}) })
      body.push({ _key: block._key, _type: 'localImage', ...image })
    } else {
      body.push(block)
    }
  }
  const coverImage = post.localMainImage
  const cover = await importImage(coverImage, {
    alt: coverImage.alt,
    ...(coverImage.caption ? { caption: coverImage.caption } : {}),
    ...(coverImage.position ? { position: coverImage.position } : {}),
  })

  const toIso = (value) => (value ? new Date(value instanceof Date ? value : String(value)).toISOString() : '')
  const doc = {
    title: post.title,
    slug: post.slug,
    deck: frontmatter.deck || '',
    excerpt: frontmatter.excerpt || '',
    date: post.publishedAt,
    updated: toIso(frontmatter.updated),
    categoryId: categories.get(post.category.slug) || '',
    authorId: authors.get(post.author.slug) || '',
    cover,
    disclosure: frontmatter.disclosure || '',
    featured: false,
    readTime: frontmatter.readTime || 0,
    seo: { title: '', description: '', image: null, canonicalUrl: '', noindex: false },
    body,
  }
  if (!doc.categoryId || !doc.authorId) {
    console.error(`error ${post.slug}: category "${post.category.slug}" or author "${post.author.slug}" is missing in the Studio`)
    process.exitCode = 1
    continue
  }
  const live = frontmatter.status !== 'draft'
  console.log(`${dryRun ? 'would import' : 'import'} ${post.slug} (${live ? 'published' : 'draft'}, ${body.length} blocks)`)
  if (dryRun) continue

  await client.query('BEGIN')
  try {
    const { rows } = await client.query(
      `INSERT INTO studio_post (slug, status, draft, published, published_at, last_published_at)
       VALUES ($1, $2, $3, $4, $5, CASE WHEN $4::jsonb IS NULL THEN NULL ELSE now() END) RETURNING id`,
      [doc.slug, live ? 'published' : 'draft', JSON.stringify(doc), live ? JSON.stringify(doc) : null, live ? doc.date : null],
    )
    await client.query("INSERT INTO studio_revision (post_id, kind, document) VALUES ($1, 'import', $2)", [rows[0].id, JSON.stringify(doc)])
    await client.query('COMMIT')
    imported += 1
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
}
console.log(`${dryRun ? 'Dry run: ' : ''}${imported} article(s) imported${useBlob ? ' (images uploaded to Vercel Blob)' : ' (images left in public/)'}.`)
await client.end()
