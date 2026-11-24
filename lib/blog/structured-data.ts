// Pulls structured-data pieces out of an article body (Portable Text), so the JSON-LD on the
// page always matches what readers see: FAQ entries come only from the article's own question
// headings and the paragraphs under them, citations only from its Sources list.
import { portableTextBlockText } from '@/lib/blog/article-content'
import type { PortableTextBlock } from '@/lib/blog/types'

export type FaqEntry = { question: string; answer: string }
export type Citation = { name: string; url: string }

const HEADING_STYLES = new Set(['h2', 'h3', 'h4'])
const MAX_ANSWER_PARAGRAPHS = 3
const MAX_ANSWER_CHARS = 1200

function isTextBlock(block: PortableTextBlock) {
  return block._type === 'block'
}

function isHeading(block: PortableTextBlock) {
  return isTextBlock(block) && HEADING_STYLES.has(block.style || '')
}

/** Text with whitespace tidied (Portable Text keeps the editor's spacing). */
function clean(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Question-and-answer pairs from h2 headings ending in "?". The answer is up to three paragraphs
 * (or list items) under the heading, stopping at the next heading or the first picture or chart.
 */
export function faqFromBody(body: PortableTextBlock[]): FaqEntry[] {
  const entries: FaqEntry[] = []
  for (let index = 0; index < body.length; index += 1) {
    const block = body[index]
    if (!isTextBlock(block) || block.style !== 'h2') continue
    const question = clean(portableTextBlockText(block))
    if (!question.endsWith('?')) continue

    const paragraphs: string[] = []
    for (let next = index + 1; next < body.length && paragraphs.length < MAX_ANSWER_PARAGRAPHS; next += 1) {
      const candidate = body[next]
      if (isHeading(candidate) || !isTextBlock(candidate)) break
      const text = clean(portableTextBlockText(candidate))
      if (text) paragraphs.push(text)
    }

    let answer = ''
    for (const paragraph of paragraphs) {
      const joined = answer ? `${answer} ${paragraph}` : paragraph
      if (answer && joined.length > MAX_ANSWER_CHARS) break
      answer = joined
    }
    if (answer) entries.push({ question, answer })
  }
  return entries
}

/** Linked sources from the article's Sources list (each link's visible text and URL, once each). */
export function citationsFromSources(sources: PortableTextBlock[], limit = 80): Citation[] {
  const seen = new Set<string>()
  const citations: Citation[] = []
  for (const block of sources) {
    if (!isTextBlock(block)) continue
    for (const mark of block.markDefs || []) {
      const href = mark.href
      if (mark._type !== 'link' || !href || !/^https?:\/\//i.test(href) || seen.has(href)) continue
      const name = clean(
        (block.children || [])
          .filter((child) => child.marks?.includes(mark._key))
          .map((child) => child.text)
          .join(''),
      )
      seen.add(href)
      citations.push({ name: name || href, url: href })
      if (citations.length >= limit) return citations
    }
  }
  return citations
}

/** Words in the article's text blocks (headings, paragraphs, list items). */
export function wordCount(body: PortableTextBlock[]) {
  return body.filter(isTextBlock).reduce((total, block) => total + (clean(portableTextBlockText(block)).match(/\S+/g)?.length || 0), 0)
}
