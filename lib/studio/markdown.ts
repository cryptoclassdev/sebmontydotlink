// Plain-Markdown copy of a Studio article for AI agents (served at /blog/<slug>.md),
// in the same layout as the Markdown publisher's copies (lib/publishing/compile.mjs).
import { stringify as stringifyYaml } from 'yaml'

import type { Post, PortableTextBlock } from '@/lib/blog/types'

import { isChartType, type ChartType } from './charts'
import type { XPostSnapshot } from './xpost'

type Span = { _type: string; text?: string; marks?: string[] }
type MarkDef = { _key: string; _type: string; href?: string }

function absolute(url: string, siteUrl: string) {
  return url.startsWith('/') && !url.startsWith('//') ? `${siteUrl}${url}` : url
}

// "$" is left as is: it has no meaning in Markdown, and an escaped "\$29,937" reads badly to AI tools.
function escapeText(text: string) {
  return text.replace(/([\\`*_[\]])/g, '\\$1')
}

function cell(value: unknown) {
  return escapeText(String(value ?? '')).replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ')
}

function table(headers: string[], rows: unknown[][]): string[] {
  return [`| ${headers.map(cell).join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`, ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`)]
}

function quoteLines(text: string) {
  return text.split('\n').map((line) => (line.trim() ? `> ${line}` : '>'))
}

function postDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : ''
}

function xPostText(post: XPostSnapshot) {
  return post.text.map((segment) => (segment.href ? `[${escapeText(segment.text)}](${segment.href})` : escapeText(segment.text))).join('')
}

/** An X post as a quote with the author, date and a link back to X. */
function xPostMarkdown(post: XPostSnapshot): string[] {
  const date = postDate(post.createdAt)
  const lines = [`> **${escapeText(post.author.name || post.author.handle)}** (@${post.author.handle}) on X${date ? `, ${date}` : ''}:`, '>']
  lines.push(...quoteLines(xPostText(post)))
  if (post.media.length) lines.push('>', `> (${post.media.length === 1 ? `1 ${post.media[0].type}` : `${post.media.length} images or videos`})`)
  if (post.quoted) lines.push('>', `> Quoting @${post.quoted.author.handle}: ${xPostText(post.quoted).replace(/\n+/g, ' ')}`)
  lines.push('>', `> [View on X](${post.url})`)
  return lines
}

type ChartData = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** A chart as its title, its numbers in a table, and its caption and source. */
function chartMarkdown(type: ChartType, v: ChartData): string[] {
  if (type === 'sourceQuote') {
    const source = v.sourceUrl ? `[${escapeText(v.sourceTitle || v.sourceUrl)}](${v.sourceUrl})` : escapeText(v.sourceTitle || '')
    return [...quoteLines(`“${escapeText(v.quote || '')}”`), '>', `> Source: ${source}${v.sourceDetail ? `, ${escapeText(v.sourceDetail)}` : ''}`]
  }
  const meta = [v.eyebrow, v.dateLabel].filter(Boolean).map((text: string) => escapeText(text)).join(', ')
  const lines = [`**${escapeText(v.title || '')}**${meta ? ` (${meta})` : ''}`, '']
  const list = (value: unknown) => (Array.isArray(value) ? (value as ChartData[]) : [])
  switch (type) {
    case 'metricGrid':
    case 'statStrip':
      lines.push(...table(['Metric', 'Value', 'Note'], list(v.metrics).map((m) => [m.label, m.value, m.detail])))
      break
    case 'stackedBar':
      lines.push(...table(['Segment', 'Share'], list(v.segments).map((m) => [m.name, m.displayValue ?? `${m.value}%`])))
      if (v.highlight?.value) lines.push('', `${escapeText(v.highlight.value)} ${escapeText(v.highlight.label || '')}`.trim())
      break
    case 'valuationGrowth':
      lines.push(...table(['Name', 'Earlier', 'Latest', 'Note'], list(v.rows).map((r) => [r.name, r.earlierLabel ?? '', r.latestLabel, r.note])))
      break
    case 'priceTimeline':
      lines.push(...table(['Date', v.priceLabel || 'First line', 'Note'], list(v.price).map((p) => [p.date, p.value, p.label ?? ''])))
      lines.push('', ...table(['Date', v.navLabel || 'Second line', 'Note'], list(v.nav).map((p) => [p.date, p.value, p.label ?? ''])))
      break
    case 'premiumChart':
      lines.push(...table(['', 'Value'], [v.sharePrice, v.bookValue, v.premium].filter(Boolean).map((item: ChartData) => [item.label, item.displayValue])))
      if (v.multipleLabel) lines.push('', escapeText(v.multipleLabel))
      lines.push('', ...table(['Date', 'Label', 'Value'], list(v.navHistory).map((p) => [p.dateLabel, p.label, p.displayValue])))
      break
    case 'tokenComparison': {
      const primary = (v.primary || {}) as ChartData
      const comparison = (v.comparison || {}) as ChartData
      const labels = [...new Set([...list(primary.metrics), ...list(comparison.metrics)].map((m) => m.label))]
      const find = (token: ChartData, label: string) => list(token.metrics).find((m) => m.label === label)?.value ?? ''
      lines.push(
        ...table(
          ['', primary.name || 'First', comparison.name || 'Second'],
          [['Issuer', primary.issuer, comparison.issuer], ['Status', primary.status, comparison.status], ...labels.map((label) => [label, find(primary, label), find(comparison, label)])],
        ),
      )
      break
    }
  }
  const source = v.source ? (v.sourceUrl ? `Source: [${escapeText(v.source)}](${v.sourceUrl})` : `Source: ${escapeText(v.source)}`) : ''
  const footer = [v.caption ? `_${escapeText(v.caption)}_` : '', source].filter(Boolean).join(' ')
  if (footer) lines.push('', footer)
  return lines
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
    } else if (block._type === 'xPost') {
      const value = block as unknown as { url?: string; post?: XPostSnapshot }
      if (value.post?.id) out.push(...xPostMarkdown(value.post), '')
      else if (value.url) out.push(value.url, '')
    } else if (isChartType(block._type)) {
      out.push(...chartMarkdown(block._type, block as unknown as ChartData), '')
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
