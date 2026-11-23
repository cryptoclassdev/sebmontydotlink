import type { PortableTextBlock } from "@/lib/blog/types"

export type ArticleGalleryImage = {
  src: string
  width: number
  height: number
  alt: string
  caption?: string
}

export type PreparedImageBlock = PortableTextBlock & {
  _articleImage: ArticleGalleryImage
  _captionBlock?: PortableTextBlock
}

export type PreparedArticleContent = {
  body: PortableTextBlock[]
  sources: PortableTextBlock[]
  gallery: ArticleGalleryImage[]
  imageIndexes: Record<string, number>
}

export function portableTextBlockText(block?: PortableTextBlock) {
  return (block?.children || []).map((child) => child.text).join("").trim()
}

function isSourcesHeading(block: PortableTextBlock) {
  return block._type === "block" && /^sources$/i.test(portableTextBlockText(block))
}

export function prepareArticleContent(content: PortableTextBlock[], startIndex = 0): PreparedArticleContent {
  const sourceIndex = content.findIndex(isSourcesHeading)
  const mainContent = sourceIndex >= 0 ? content.slice(0, sourceIndex) : content
  const sources = sourceIndex >= 0 ? content.slice(sourceIndex + 1) : []
  const body: PortableTextBlock[] = []
  const gallery: ArticleGalleryImage[] = []
  const imageIndexes: Record<string, number> = {}
  let imageNumber = 0

  for (let index = 0; index < mainContent.length; index += 1) {
    const block = mainContent[index]
    if (block._type === "localImage" && block.src && block.width && block.height) {
      imageNumber += 1
      const image: ArticleGalleryImage = {
        src: block.src,
        width: block.width,
        height: block.height,
        alt: block.alt || `Article image ${imageNumber}`,
        caption: [block.caption, block.credit].filter(Boolean).join(' ') || undefined,
      }
      const prepared: PreparedImageBlock = { ...block, _type: 'image', _articleImage: image }
      imageIndexes[block._key] = startIndex + gallery.length
      gallery.push(image)
      body.push(prepared)
      continue
    }
    body.push(block)
  }

  return { body, sources, gallery, imageIndexes }
}
