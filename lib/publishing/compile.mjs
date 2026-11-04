// Article compiler: reads content/articles/*.md, validates every article, and
// writes lib/publishing/.generated/articles.json for the app to import.
//
// Runs automatically when Next.js loads its config (next dev / next build), and
// on demand with `pnpm articles:check`. Any problem stops the build with a list
// of every error and where it is, instead of silently dropping content.

import fs from 'node:fs'
import path from 'node:path'
import { imageSize } from 'image-size'
import { toString as mdastToString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { z } from 'zod'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sebmonty.link').replace(/\/$/, '')
const WORDS_PER_MINUTE = 210
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/

const imageSchema = z
  .object({
    src: z.string().min(1, 'src is required'),
    alt: z.string().min(1, 'alt text is required'),
    caption: z.string().min(1).optional(),
  })
  .strict()

const coverSchema = imageSchema
  .extend({
    // Which part of the cover stays visible when cards crop it, e.g. "left", "right top", "30% 50%"
    position: z
      .string()
      .regex(/^((left|right|center|top|bottom)( (left|right|center|top|bottom))?|\d{1,3}% \d{1,3}%)$/, 'position must be like "left", "right top" or "30% 50%"')
      .optional(),
  })
  .strict()

const frontmatterSchema = z
  .object({
    title: z.string().min(1, 'title is required'),
    deck: z.string().min(1).optional(),
    excerpt: z.string().min(1).optional(),
    date: z.string().regex(DATE_PATTERN, 'date must look like 2026-11-05 or 2026-11-05T09:00:00Z'),
    updated: z.string().regex(DATE_PATTERN, 'updated must look like 2026-11-05 or 2026-11-05T09:00:00Z').optional(),
    category: z.string().min(1, 'category is required'),
    author: z.string().min(1).default('seb-montgomery'),
    cover: coverSchema,
    status: z.enum(['published', 'draft']).default('published'),
    readTime: z.number().int().positive().optional(),
    disclosure: z.string().min(1).optional(),
  })
  .strict()

const categorySchema = z
  .object({ slug: z.string().regex(SLUG_PATTERN), title: z.string().min(1), description: z.string().min(1).optional() })
  .strict()

const authorSchema = z
  .object({
    slug: z.string().regex(SLUG_PATTERN),
    name: z.string().min(1),
    bio: z.string().min(1).optional(),
    xHandle: z.string().min(1).optional(),
  })
  .strict()

class ArticleErrors {
  constructor(file) {
    this.file = file
    this.items = []
  }

  add(message, node) {
    const line = node?.position?.start?.line
    this.items.push(`${this.file}${line ? `:${line}` : ''}  ${message}`)
  }
}

function readYamlList(root, file, schema, errors) {
  const fullPath = path.join(root, file)
  if (!fs.existsSync(fullPath)) {
    errors.push(`${file}  file is missing`)
    return []
  }
  let data
  try {
    data = parseYaml(fs.readFileSync(fullPath, 'utf8'))
  } catch (error) {
    errors.push(`${file}  is not valid YAML: ${error.message}`)
    return []
  }
  const parsed = z.array(schema).safeParse(data)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors.push(`${file}  ${issue.path.join('.')}: ${issue.message}`)
    return []
  }
  return parsed.data
}

function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return null
  const frontmatterLines = match[0].split('\n').length - 1
  return { yaml: match[1], body: source.slice(match[0].length), bodyLineOffset: frontmatterLines }
}

function toIso(value) {
  const date = new Date(/T/.test(value) ? value : `${value}T00:00:00Z`)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function resolveImagePath(src, slug) {
  if (/^https?:\/\//i.test(src)) return { error: `images must be stored with the site, not hotlinked (${src})` }
  if (src.startsWith('data:')) return { error: 'embedded image data is not supported; save the image as a file' }
  const publicPath = src.startsWith('/') ? src : `/articles/${slug}/${src.replace(/^\.\//, '')}`
  return { publicPath }
}

function loadImage(root, src, slug, errors, node) {
  const resolved = resolveImagePath(src, slug)
  if (resolved.error) {
    errors.add(resolved.error, node)
    return null
  }
  const filePath = path.join(root, 'public', decodeURI(resolved.publicPath))
  if (!fs.existsSync(filePath)) {
    errors.add(`image not found: public${resolved.publicPath}`, node)
    return null
  }
  try {
    const { width, height } = imageSize(fs.readFileSync(filePath))
    if (!width || !height) throw new Error('unknown dimensions')
    return { src: resolved.publicPath, width, height }
  } catch (error) {
    errors.add(`could not read image ${resolved.publicPath}: ${error.message}`, node)
    return null
  }
}

function youtubeUrl(value) {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\.|^m\./, '')
    if (host === 'youtu.be' || host === 'youtube.com' || host === 'youtube-nocookie.com') return url.toString()
  } catch {
    return null
  }
  return null
}

function safeHref(href) {
  return /^(https?:\/\/|mailto:|\/|#)/i.test(href)
}

// Markdown (mdast) to the Portable Text block shape the article renderer already uses.
function convertBody(tree, { root, slug, errors }) {
  const blocks = []
  const definitions = new Map()
  let keyCounter = 0
  const nextKey = (prefix) => `${prefix}-${(keyCounter += 1).toString(36)}`

  for (const node of tree.children) {
    if (node.type === 'definition') definitions.set(node.identifier, node)
  }

  function spansFrom(nodes, markDefs, marks = []) {
    const spans = []
    for (const node of nodes) {
      switch (node.type) {
        case 'text':
          spans.push({ _key: nextKey('s'), _type: 'span', text: node.value, marks })
          break
        case 'break':
          spans.push({ _key: nextKey('s'), _type: 'span', text: '\n', marks })
          break
        case 'strong':
          spans.push(...spansFrom(node.children, markDefs, [...marks, 'strong']))
          break
        case 'emphasis':
          spans.push(...spansFrom(node.children, markDefs, [...marks, 'em']))
          break
        case 'inlineCode':
          spans.push({ _key: nextKey('s'), _type: 'span', text: node.value, marks: [...marks, 'code'] })
          break
        case 'link':
        case 'linkReference': {
          const href = node.type === 'link' ? node.url : definitions.get(node.identifier)?.url
          if (!href) {
            errors.add(`link reference [${node.label || node.identifier}] has no matching definition`, node)
            break
          }
          if (!safeHref(href)) {
            errors.add(`link must start with https://, http://, mailto:, / or # (got "${href}")`, node)
            break
          }
          const markKey = nextKey('l')
          markDefs.push({ _key: markKey, _type: 'link', href })
          spans.push(...spansFrom(node.children, markDefs, [...marks, markKey]))
          break
        }
        case 'image':
        case 'imageReference':
          errors.add('images must sit on their own line, not inside text', node)
          break
        case 'delete':
          errors.add('strikethrough (~~text~~) is not supported', node)
          break
        case 'html':
          errors.add('raw HTML is not allowed in articles', node)
          break
        case 'footnoteReference':
          errors.add('footnotes are not supported; put sources in the Sources section', node)
          break
        default:
          errors.add(`unsupported inline element: ${node.type}`, node)
      }
    }
    return spans
  }

  function textBlock(node, extra) {
    const markDefs = []
    const children = spansFrom(node.children, markDefs)
    return { _key: nextKey('b'), _type: 'block', style: 'normal', markDefs, children, ...extra }
  }

  function imageBlock(node) {
    const target = node.type === 'image' ? node : definitions.get(node.identifier)
    if (!target) {
      errors.add(`image reference [${node.label || node.identifier}] has no matching definition`, node)
      return null
    }
    const alt = (node.alt || '').trim()
    if (!alt) errors.add('every image needs alt text: ![describe the image](file.png "Caption")', node)
    const image = loadImage(root, target.url, slug, errors, node)
    if (!image || !alt) return null
    return {
      _key: nextKey('img'),
      _type: 'localImage',
      src: image.src,
      width: image.width,
      height: image.height,
      alt,
      caption: target.title || undefined,
    }
  }

  function convertList(node, level) {
    const listItem = node.ordered ? 'number' : 'bullet'
    for (const item of node.children) {
      let wroteText = false
      for (const child of item.children) {
        if (child.type === 'paragraph') {
          if (wroteText) {
            errors.add('a list item can only hold one paragraph', child)
            continue
          }
          blocks.push(textBlock(child, { listItem, level }))
          wroteText = true
        } else if (child.type === 'list') {
          convertList(child, level + 1)
        } else {
          errors.add(`unsupported element inside a list: ${child.type}`, child)
        }
      }
    }
  }

  for (const node of tree.children) {
    switch (node.type) {
      case 'definition':
        break
      case 'heading':
        if (node.depth === 1) errors.add('use ## for section headings; the article title comes from the frontmatter', node)
        else if (node.depth > 4) errors.add('headings go down to #### at most', node)
        else blocks.push(textBlock(node, { style: `h${node.depth}` }))
        break
      case 'paragraph': {
        const meaningful = node.children.filter((child) => !(child.type === 'text' && !child.value.trim()))
        if (meaningful.length === 1 && (meaningful[0].type === 'image' || meaningful[0].type === 'imageReference')) {
          const block = imageBlock(meaningful[0])
          if (block) blocks.push(block)
          break
        }
        const onlyLink = meaningful.length === 1 && meaningful[0].type === 'link' ? meaningful[0] : null
        const bareUrl = onlyLink && mdastToString(onlyLink).trim() === onlyLink.url ? onlyLink.url : null
        const video = bareUrl ? youtubeUrl(bareUrl) : null
        if (video) {
          blocks.push({ _key: nextKey('yt'), _type: 'youtube', url: video })
          break
        }
        if (meaningful.some((child) => child.type === 'image' || child.type === 'imageReference')) {
          errors.add('images must sit on their own line, not inside text', node)
          break
        }
        blocks.push(textBlock(node))
        break
      }
      case 'list':
        convertList(node, 1)
        break
      case 'blockquote':
        for (const child of node.children) {
          if (child.type === 'paragraph') blocks.push(textBlock(child, { style: 'blockquote' }))
          else errors.add(`unsupported element inside a quote: ${child.type}`, child)
        }
        break
      case 'code':
        blocks.push({ _key: nextKey('code'), _type: 'code', code: node.value, language: node.lang || 'Code' })
        break
      case 'html':
        errors.add('raw HTML is not allowed in articles', node)
        break
      case 'table':
        errors.add('tables are not supported yet; use a list or an image', node)
        break
      case 'thematicBreak':
        errors.add('horizontal rules (---) are not supported inside the article body', node)
        break
      case 'footnoteDefinition':
        errors.add('footnotes are not supported; put sources in the Sources section', node)
        break
      default:
        errors.add(`unsupported element: ${node.type}`, node)
    }
  }

  return blocks
}

function shiftPositions(tree, offset) {
  const visit = (node) => {
    if (node.position) {
      node.position.start.line += offset
      node.position.end.line += offset
    }
    if (node.children) node.children.forEach(visit)
  }
  visit(tree)
}

// The plain-Markdown copy served to AI agents at /blog/<slug>.md
function agentMarkdown({ frontmatter, body, slug, author, category, publishedAt }) {
  const absoluteBody = body
    .replace(/(\]\()\/(?!\/)/g, `$1${SITE_URL}/`)
    .replace(/(\]\()(?!https?:|mailto:|#|\/)([^)\s]+)/g, `$1${SITE_URL}/articles/${slug}/$2`)
  const header = stringifyYaml({
    title: frontmatter.title,
    description: frontmatter.deck || frontmatter.excerpt,
    author: author.name,
    published: publishedAt,
    updated: frontmatter.updated ? toIso(frontmatter.updated) : undefined,
    category: category.title,
    url: `${SITE_URL}/blog/${slug}`,
  }, { lineWidth: 0 }).trim()
  const parts = [`---\n${header}\n---`, `# ${frontmatter.title}`]
  if (frontmatter.deck) parts.push(`_${frontmatter.deck}_`)
  parts.push(absoluteBody.trim())
  if (frontmatter.disclosure) parts.push(`_${frontmatter.disclosure}_`)
  return `${parts.join('\n\n')}\n`
}

export function compileArticles({ root = process.cwd(), includeDrafts = process.env.VERCEL_ENV !== 'production' } = {}) {
  const fileErrors = []
  const categories = readYamlList(root, 'content/categories.yml', categorySchema, fileErrors)
  const authors = readYamlList(root, 'content/authors.yml', authorSchema, fileErrors)
  const categoryBySlug = new Map(categories.map((item) => [item.slug, item]))
  const authorBySlug = new Map(authors.map((item) => [item.slug, item]))

  const articlesDir = path.join(root, 'content/articles')
  const files = fs.existsSync(articlesDir) ? fs.readdirSync(articlesDir).filter((file) => file.endsWith('.md')).sort() : []
  const articles = []
  const allErrors = [...fileErrors]

  for (const file of files) {
    const relativeFile = `content/articles/${file}`
    const errors = new ArticleErrors(relativeFile)
    const slug = file.replace(/\.md$/, '')
    if (!SLUG_PATTERN.test(slug)) errors.add('file name must be lowercase words joined by hyphens, e.g. my-article.md')

    const source = fs.readFileSync(path.join(articlesDir, file), 'utf8')
    const split = splitFrontmatter(source)
    if (!split) {
      errors.add('must start with a frontmatter block between two --- lines')
      allErrors.push(...errors.items)
      continue
    }

    let rawFrontmatter
    try {
      rawFrontmatter = parseYaml(split.yaml) || {}
    } catch (error) {
      errors.add(`frontmatter is not valid YAML: ${error.message}`)
    }
    const parsed = rawFrontmatter ? frontmatterSchema.safeParse(rawFrontmatter) : null
    if (parsed && !parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.') || 'frontmatter'
        errors.add(issue.code === 'unrecognized_keys' ? `unknown field(s): ${issue.keys.join(', ')}` : `${field}: ${issue.message}`)
      }
    }
    const frontmatter = parsed?.success ? parsed.data : null

    const tree = unified().use(remarkParse).use(remarkGfm).parse(split.body)
    shiftPositions(tree, split.bodyLineOffset)
    const body = convertBody(tree, { root, slug, errors })

    // Check references even when other frontmatter fields failed, so one run lists every problem.
    const fields = frontmatter || (rawFrontmatter && typeof rawFrontmatter === 'object' ? rawFrontmatter : {})
    const isText = (value) => typeof value === 'string' && value.length > 0
    let cover = null
    let category = null
    let author = null
    let publishedAt = null
    if (isText(fields.cover?.src)) cover = loadImage(root, fields.cover.src, slug, errors)
    if (isText(fields.category)) {
      category = categoryBySlug.get(fields.category)
      if (!category) errors.add(`category "${fields.category}" is not listed in content/categories.yml`)
    }
    const authorSlug = isText(fields.author) ? fields.author : 'seb-montgomery'
    author = authorBySlug.get(authorSlug)
    if (!author) errors.add(`author "${authorSlug}" is not listed in content/authors.yml`)
    if (isText(fields.date) && DATE_PATTERN.test(fields.date)) {
      publishedAt = toIso(fields.date)
      if (!publishedAt) errors.add(`date "${fields.date}" is not a real date`)
    }
    if (isText(fields.updated) && DATE_PATTERN.test(fields.updated) && !toIso(fields.updated)) {
      errors.add(`updated "${fields.updated}" is not a real date`)
    }
    if (!body.length) errors.add('the article body is empty')

    if (errors.items.length || !frontmatter || !cover || !category || !author || !publishedAt) {
      allErrors.push(...errors.items)
      continue
    }

    const words = mdastToString(tree).split(/\s+/).filter(Boolean).length
    const post = {
      _id: `article-${slug}`,
      _updatedAt: frontmatter.updated ? toIso(frontmatter.updated) : publishedAt,
      title: frontmatter.title,
      subtitle: frontmatter.deck,
      slug,
      excerpt: frontmatter.excerpt || frontmatter.deck,
      author: { _id: `author-${author.slug}`, name: author.name, slug: author.slug, bio: author.bio, xHandle: author.xHandle },
      category: { _id: `category-${category.slug}`, title: category.title, slug: category.slug, description: category.description },
      categories: [category.title],
      publishedAt,
      isFeatured: false,
      readTime: frontmatter.readTime || Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
      likes: 0,
      commentCount: 0,
      hideEyebrowRules: true,
      localMainImage: { ...cover, alt: frontmatter.cover.alt, caption: frontmatter.cover.caption, position: frontmatter.cover.position },
      disclosure: frontmatter.disclosure,
      status: frontmatter.status,
      body,
    }

    if (frontmatter.status === 'draft' && !includeDrafts) continue
    articles.push({
      post,
      markdown: agentMarkdown({ frontmatter, body: split.body, slug, author, category, publishedAt }),
      sourceFile: relativeFile,
    })
  }

  if (allErrors.length) {
    const error = new Error(
      `Article check failed (${allErrors.length} problem${allErrors.length === 1 ? '' : 's'}):\n\n${allErrors.map((item) => `  - ${item}`).join('\n')}\n`,
    )
    error.articleErrors = allErrors
    throw error
  }

  articles.sort((a, b) => b.post.publishedAt.localeCompare(a.post.publishedAt))
  return {
    articles,
    categories: categories.map((item) => ({ _id: `category-${item.slug}`, ...item, postCount: 0 })),
  }
}

export function writeArticleManifest({ root = process.cwd(), ...options } = {}) {
  const manifest = compileArticles({ root, ...options })
  const outDir = path.join(root, 'lib/publishing/.generated')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'articles.json')
  const json = `${JSON.stringify(manifest, null, 2)}\n`
  if (!fs.existsSync(outFile) || fs.readFileSync(outFile, 'utf8') !== json) fs.writeFileSync(outFile, json)
  return manifest
}
