// Plain-Markdown copy of a Studio article for AI agents (served at /blog/<slug>.md),
// in the same layout as the Markdown publisher's copies (lib/publishing/compile.mjs).
import { stringify as stringifyYaml } from 'yaml'

import type { Post, PortableTextBlock } from '@/lib/blog/types'

type Span = { _type: string; text?: string; marks?: string[] }
type MarkDef = { _key: string; _type: string; href?: string }

function absolute(url: string, siteUrl: string) {
  return url.startsWith('/') && !url.startsWith('//') ? `${siteUrl}${url}` : url
}

function escapeText(text: string) {
  return text.replace(/([\\`*_[\]$])/g, '\\$1')
}

function inline(block: PortableTextBlock, siteUrl: string) {
  const defs = new Map(((block.markDefs || []) as MarkDef[]).map((def) => [def._key, def]))
  return ((block.children || []) as Span[])
    .map((span) => {
      if (span._type !== 'span') return ''
      let text = span.text || ''
      if (!text) return ''
      const marks = span.marks || []
      if (marks.includes('code')) text = `\`${text.replace(/`/g, 'ˋ')}\``
      else text = escapeText(text)
      if (marks.includes('strong')) text = `**${text}**`
      if (marks.includes('em')) text = `_${text}_`
      for (const mark of marks) {
        const def = defs.get(mark)
        if (def?._type === 'link' && def.href) text = `[${text}](${absolute(def.href, siteUrl)})`
      }
      return text
    })
    .join('')
}

export function portableTextToMarkdown(blocks: PortableTextBlock[], siteUrl: string): string {
  const out: string[] = []
  let listCounter = 0
  let previousWasList = false

  for (const block of blocks) {
    const isList = block._type === 'block' && Boolean(block.listItem)
    if (!isList) listCounter = 0
    if (previousWasList && !isList) out.push('')

    if (block._type === 'block') {
      const text = inline(block, siteUrl)
      if (block.listItem) {
        const indent = '  '.repeat(Math.max(0, (block.level || 1) - 1))
        if (block.listItem === 'number') listCounter += 1
        out.push(`${indent}${block.listItem === 'number' ? `${listCounter}.` : '-'} ${text}`)
        previousWasList = true
        continue
      }
      previousWasList = false
      if (!text.trim()) continue
      if (/^h[2-4]$/.test(block.style || '')) out.push(`${'#'.repeat(Number(block.style!.slice(1)))} ${text}`, '')
      else if (block.style === 'blockquote') out.push(`> ${text}`, '')
      else out.push(text, '')
      continue
    }

    previousWasList = false
    if (block._type === 'localImage' && block.src) {
      const caption = [block.caption, block.credit].filter(Boolean).join(' ')
      out.push(`![${block.alt || ''}](${absolute(block.src, siteUrl)}${caption ? ` "${caption.replace(/"/g, "'")}"` : ''})`, '')
    } else if (block._type === 'youtube' && block.url) {
      out.push(block.url, '')
    } else if (block._type === 'code' && block.code) {
      const fence = block.code.includes('```') ? '~~~' : '```'
      out.push(`${fence}${block.language && /^[\w+-]+$/.test(block.language) ? block.language : ''}`, block.code, fence, '')
    }
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export function studioArticleMarkdown(post: Post, siteUrl: string): string {
  const header = stringifyYaml(
    {
      title: post.title,
      description: post.subtitle || post.excerpt,
      author: post.author?.name,
      published: post.publishedAt,
      updated: post._updatedAt && post._updatedAt !== post.publishedAt ? post._updatedAt : undefined,
      category: post.category?.title,
      url: `${siteUrl}/blog/${post.slug}`,
    },
    { lineWidth: 0 },
  ).trim()
  const parts = [`---\n${header}\n---`, `# ${post.title}`]
  if (post.subtitle) parts.push(`_${post.subtitle}_`)
  parts.push(portableTextToMarkdown(post.body || [], siteUrl))
  if (post.disclosure) parts.push(`_${post.disclosure}_`)
  return `${parts.join('\n\n')}\n`
}
