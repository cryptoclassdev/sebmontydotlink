// The article document the Studio edits. Shared by the browser (editor) and the server.
// Body is Portable Text in the same block shapes components/blog/ArticleBody.tsx renders.
import { z } from 'zod'

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const WORDS_PER_MINUTE = 210
export const COVER_POSITION_PATTERN = /^((left|right|center|top|bottom)( (left|right|center|top|bottom))?|\d{1,3}% \d{1,3}%)$/

export type StudioImage = {
  mediaId?: string
  src: string
  width: number
  height: number
  alt: string
  caption?: string
  credit?: string
  creditUrl?: string
}

export type CoverImage = StudioImage & {
  /** Which part stays visible when cards crop the cover, e.g. "left", "right top", "30% 50%". */
  position?: string
}

export type PortableTextSpan = { _type: 'span'; _key: string; text: string; marks?: string[] }
export type PortableTextTextBlock = {
  _type: 'block'
  _key: string
  style?: string
  listItem?: string
  level?: number
  markDefs?: Array<{ _type: string; _key: string; [field: string]: unknown }>
  children: Array<PortableTextSpan | { _type: string; _key: string; [field: string]: unknown }>
}
export type PortableTextObject = { _type: string; _key: string; [field: string]: unknown }
export type BodyBlock = PortableTextTextBlock | PortableTextObject

export type PostDocument = {
  title: string
  slug: string
  /** Standfirst under the headline; also the card text unless excerpt is set. */
  deck: string
  /** Shorter summary for cards, search and link previews. */
  excerpt: string
  /** Publication date and time (ISO 8601). */
  date: string
  /** Date of a later correction or refresh (ISO 8601), or empty. */
  updated: string
  categoryId: string
  authorId: string
  cover: CoverImage | null
  /** Closing note after the article (holdings, affiliations). */
  disclosure: string
  featured: boolean
  /** Minutes. 0 means "work it out from the word count". */
  readTime: number
  seo: {
    title: string
    description: string
    image: StudioImage | null
    canonicalUrl: string
    noindex: boolean
  }
  body: BodyBlock[]
}

export function emptyDocument(overrides: Partial<PostDocument> = {}): PostDocument {
  return {
    title: '',
    slug: '',
    deck: '',
    excerpt: '',
    date: '',
    updated: '',
    categoryId: '',
    authorId: '',
    cover: null,
    disclosure: '',
    featured: false,
    readTime: 0,
    seo: { title: '', description: '', image: null, canonicalUrl: '', noindex: false },
    body: [],
    ...overrides,
  }
}

/** Fills in any field an older saved document is missing. */
export function normalizeDocument(input: unknown): PostDocument {
  const value = (input && typeof input === 'object' ? input : {}) as Partial<PostDocument>
  const base = emptyDocument()
  return {
    ...base,
    ...value,
    seo: { ...base.seo, ...(value.seo || {}) },
    body: Array.isArray(value.body) ? value.body : [],
  }
}

export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}

export function isTextBlock(block: BodyBlock): block is PortableTextTextBlock {
  return block._type === 'block'
}

export function blockText(block: BodyBlock): string {
  if (!isTextBlock(block)) return ''
  return block.children.map((child) => (child._type === 'span' ? (child as PortableTextSpan).text : '')).join('')
}

/** Everything after a "Sources" heading goes into the collapsed Sources box on the site. */
export function sourcesIndex(body: BodyBlock[]): number {
  return body.findIndex((block) => isTextBlock(block) && /^h[2-4]$/.test(block.style || '') && /^sources$/i.test(blockText(block).trim()))
}

export function wordCount(body: BodyBlock[]): number {
  const index = sourcesIndex(body)
  const readable = index >= 0 ? body.slice(0, index) : body
  return readable
    .map(blockText)
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length
}

export function estimatedReadTime(body: BodyBlock[]): number {
  return Math.max(1, Math.ceil(wordCount(body) / WORDS_PER_MINUTE))
}

// ---------------------------------------------------------------------------
// Publish checks. Drafts can be saved in any state; publishing needs these.
// ---------------------------------------------------------------------------

const LINK_PATTERN = /^(https?:\/\/|mailto:|\/|#)/i

export type PublishProblem = { field: string; message: string }

export function publishProblems(doc: PostDocument, known: { categoryIds: string[]; authorIds: string[] }): PublishProblem[] {
  const problems: PublishProblem[] = []
  const add = (field: string, message: string) => problems.push({ field, message })

  if (!doc.title.trim()) add('title', 'Add a title.')
  if (!doc.slug) add('slug', 'Add a slug (the web address).')
  else if (!SLUG_PATTERN.test(doc.slug)) add('slug', 'Use lowercase words joined by hyphens, like papertrade-saga.')
  if (!doc.date || Number.isNaN(Date.parse(doc.date))) add('date', 'Set a publish date.')
  if (doc.updated && Number.isNaN(Date.parse(doc.updated))) add('updated', 'The updated date is not a real date.')
  if (!doc.categoryId) add('categoryId', 'Pick a category.')
  else if (!known.categoryIds.includes(doc.categoryId)) add('categoryId', 'That category no longer exists. Pick another.')
  if (!doc.authorId) add('authorId', 'Pick an author.')
  else if (!known.authorIds.includes(doc.authorId)) add('authorId', 'That author no longer exists. Pick another.')
  if (!doc.cover?.src) add('cover', 'Add a cover image.')
  else if (!doc.cover.alt.trim()) add('cover', 'Describe the cover image (alt text).')
  if (doc.cover?.position && !COVER_POSITION_PATTERN.test(doc.cover.position)) add('cover', 'Cover crop must be like "left", "right top" or "30% 50%".')
  if (doc.seo.canonicalUrl && !/^https:\/\//.test(doc.seo.canonicalUrl)) add('seo', 'Canonical URL must start with https://')
  if (!doc.body.some((block) => blockText(block).trim() || !isTextBlock(block))) add('body', 'The article body is empty.')

  doc.body.forEach((block, index) => {
    const where = `Body, block ${index + 1}`
    if (isTextBlock(block)) {
      if (block.style === 'h1') add('body', `${where}: use H2 for sections; the title is the only H1.`)
      for (const def of block.markDefs || []) {
        if (def._type === 'link' && !LINK_PATTERN.test(String(def.href || ''))) {
          add('body', `${where}: link "${String(def.href || '')}" must start with https://, http://, mailto:, / or #.`)
        }
      }
      return
    }
    if (block._type === 'localImage') {
      if (!block.src) add('body', `${where}: image has no file.`)
      if (!String(block.alt || '').trim()) add('body', `${where}: image needs alt text.`)
    }
    if (block._type === 'youtube' && !youtubeId(String(block.url || ''))) add('body', `${where}: that is not a YouTube link.`)
    if (block._type === 'code' && !String(block.code || '').trim()) add('body', `${where}: code block is empty.`)
  })

  return problems
}

export function youtubeId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be') return parsed.pathname.slice(1) || null
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v')
      const match = parsed.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/)
      return match ? match[2] : null
    }
  } catch {
    return null
  }
  return null
}

// Loose runtime check for documents coming from the browser.
export const postDocumentSchema = z
  .object({
    title: z.string().max(300),
    slug: z.string().max(120),
    deck: z.string().max(1000),
    excerpt: z.string().max(1000),
    date: z.string().max(40),
    updated: z.string().max(40),
    categoryId: z.string().max(64),
    authorId: z.string().max(64),
    cover: z
      .object({
        mediaId: z.string().optional(),
        src: z.string().max(2000),
        width: z.number(),
        height: z.number(),
        alt: z.string().max(1000),
        caption: z.string().max(2000).optional(),
        credit: z.string().max(500).optional(),
        creditUrl: z.string().max(2000).optional(),
        position: z.string().max(40).optional(),
      })
      .nullable(),
    disclosure: z.string().max(5000),
    featured: z.boolean(),
    readTime: z.number().int().min(0).max(600),
    seo: z.object({
      title: z.string().max(300),
      description: z.string().max(1000),
      image: z
        .object({
          mediaId: z.string().optional(),
          src: z.string().max(2000),
          width: z.number(),
          height: z.number(),
          alt: z.string().max(1000),
        })
        .passthrough()
        .nullable(),
      canonicalUrl: z.string().max(2000),
      noindex: z.boolean(),
    }),
    body: z.array(z.object({ _type: z.string(), _key: z.string() }).passthrough()).max(5000),
  })
  .strict()
