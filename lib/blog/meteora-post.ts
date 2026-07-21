import rawPostJson from '@/data/meteora-lp-course-post.json'
import type { PortableTextBlock, PortableTextMarkDef, PortableTextSpan, Post } from '@/sanity/types'

import { METEORA_POST_CARD, METEORA_SLUG } from './meteora-metadata'

type RawMark = {
  type: 'bold' | 'italic' | 'code' | 'link'
  attrs?: { href?: string }
}

type RawText = {
  type: 'text'
  text: string
  marks?: RawMark[]
}

type RawBlock = {
  type: string
  attrs?: {
    blockId?: string
    level?: number
    assetId?: string
    alt?: string
    caption?: string | null
    credit?: string | null
    creditUrl?: string | null
  }
  content?: Array<RawText | RawListItem | RawBlock>
}

type RawListItem = {
  type: 'listItem'
  attrs?: { blockId?: string }
  content?: RawBlock[]
}

type RawAsset = {
  src: string
  width: number
  height: number
  alt: string
  caption?: string | null
}

type RawPost = {
  content: { content: RawBlock[] }
  assets: Record<string, RawAsset>
}

const rawPost = rawPostJson as unknown as RawPost

function inlineContent(blockKey: string, nodes: Array<RawText | RawListItem | RawBlock> = []) {
  const markDefs: PortableTextMarkDef[] = []
  const children: PortableTextSpan[] = nodes
    .filter((node): node is RawText => node.type === 'text')
    .map((node, index) => {
      const marks: string[] = []
      for (const mark of node.marks || []) {
        if (mark.type === 'bold') marks.push('strong')
        if (mark.type === 'italic') marks.push('em')
        if (mark.type === 'code') marks.push('code')
        if (mark.type === 'link' && mark.attrs?.href) {
          const key = `${blockKey}-link-${index}`
          markDefs.push({ _key: key, _type: 'link', href: mark.attrs.href })
          marks.push(key)
        }
      }
      return { _key: `${blockKey}-span-${index}`, _type: 'span', text: node.text, marks }
    })
  return { children, markDefs }
}

function textBlock(node: RawBlock, overrides: Partial<PortableTextBlock> = {}): PortableTextBlock {
  const key = overrides._key || node.attrs?.blockId || `block-${node.type}`
  const { children, markDefs } = inlineContent(key, node.content)
  return {
    _key: key,
    _type: 'block',
    style: 'normal',
    children,
    markDefs,
    ...overrides,
  }
}

function convertBlock(node: RawBlock, nodeIndex: number): PortableTextBlock[] {
  const key = node.attrs?.blockId || `block-${node.type}-${nodeIndex}`
  if (node.type === 'paragraph') return [textBlock(node, { _key: key, style: 'normal' })]
  if (node.type === 'heading') {
    const level = Math.min(4, Math.max(2, node.attrs?.level || 2))
    return [textBlock(node, { _key: key, style: `h${level}` })]
  }
  if (node.type === 'bulletList' || node.type === 'orderedList') {
    return (node.content || [])
      .filter((item): item is RawListItem => item.type === 'listItem')
      .flatMap((item, index) => {
        const paragraph = item.content?.find((child) => child.type === 'paragraph')
        if (!paragraph) return []
        return [textBlock(paragraph, {
          _key: item.attrs?.blockId || `${key}-item-${index}`,
          listItem: node.type === 'orderedList' ? 'number' : 'bullet',
          level: 1,
        })]
      })
  }
  if (node.type === 'imageFigure' && node.attrs?.assetId) {
    const asset = rawPost.assets[node.attrs.assetId]
    if (!asset) return []
    return [{
      _key: key,
      _type: 'localImage',
      src: asset.src,
      width: asset.width,
      height: asset.height,
      alt: node.attrs.alt || asset.alt,
      caption: node.attrs.caption || asset.caption || undefined,
      credit: node.attrs.credit || undefined,
      creditUrl: node.attrs.creditUrl || undefined,
    }]
  }
  return []
}

export const METEORA_POST: Post = {
  ...METEORA_POST_CARD,
  body: rawPost.content.content.flatMap(convertBlock),
}

export const STATIC_BLOG_POSTS: Post[] = [METEORA_POST]

export function getStaticBlogPost(slug: string) {
  return slug === METEORA_SLUG ? METEORA_POST : null
}
