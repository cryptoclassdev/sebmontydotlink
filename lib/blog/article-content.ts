import { urlFor } from "@/sanity/client"
import type { PortableTextBlock, SanityImage } from "@/sanity/types"

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

function imageDimensions(reference: string | undefined) {
  const match = reference?.match(/-(\d+)x(\d+)-[a-z0-9]+$/i)
  return {
    width: match ? Number(match[1]) : 1600,
    height: match ? Number(match[2]) : 900,
  }
}

export function sanityImageToGalleryImage(
  image: SanityImage | PortableTextBlock,
  fallbackAlt: string,
  caption?: string,
): ArticleGalleryImage {
  const reference = image.asset?._ref
  const { width, height } = imageDimensions(reference)
  return {
    src: urlFor(image).width(Math.min(2400, Math.max(960, width))).fit("max").auto("format").url(),
    width,
    height,
    alt: image.alt || fallbackAlt,
    caption: [caption || image.caption, (image as PortableTextBlock).credit].filter(Boolean).join(' ') || undefined,
  }
}

function isSourcesHeading(block: PortableTextBlock) {
  return block._type === "block" && /^sources$/i.test(portableTextBlockText(block))
}

function isImportedCaption(block: PortableTextBlock | undefined) {
  if (!block || block._type !== "block" || block.style !== "normal" || block.listItem) return false
  const text = portableTextBlockText(block)
  return /^(Figure\b|Brett Adcock\b|Andrew Kang\b|Marc Weinstein\b|The Standard Bots\b|Apptronik’s Apollo\b)/i.test(text)
}

export function prepareArticleContent(
  content: PortableTextBlock[],
  startIndex = 0,
  imageOverrides: Record<string, ArticleGalleryImage> = {},
): PreparedArticleContent {
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
    if (block._type !== "image" || !block.asset?._ref) {
      body.push(block)
      continue
    }

    imageNumber += 1
    const next = mainContent[index + 1]
    const captionBlock = isImportedCaption(next) ? next : undefined
    const caption = block.caption || (captionBlock ? portableTextBlockText(captionBlock) : undefined)
    const image = imageOverrides[block._key] || sanityImageToGalleryImage(block, `Article image ${imageNumber}`, caption)
    const prepared: PreparedImageBlock = { ...block, _articleImage: image, _captionBlock: captionBlock }
    imageIndexes[block._key] = startIndex + gallery.length
    gallery.push(image)
    body.push(prepared)
    if (captionBlock) index += 1
  }

  return { body, sources, gallery, imageIndexes }
}
