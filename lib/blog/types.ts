// Shared blog types. Posts come from the Studio's database (lib/blog/source.ts), or from the
// Markdown files in content/articles/ when the Studio isn't connected.

export interface Author {
  _id: string
  name: string
  slug: string
  /** Photo URL (a site path or an https URL). */
  imageUrl?: string
  bio?: string
  xHandle?: string
}

export interface Category {
  _id: string
  title: string
  slug: string
  description?: string
  color?: string
  postCount?: number
}

export interface Post {
  _id: string
  _updatedAt?: string
  title: string
  subtitle?: string
  slug: string
  excerpt?: string
  author?: Author
  category?: Category
  categories?: string[]
  publishedAt?: string
  isFeatured?: boolean
  readTime?: number
  likes?: number
  commentCount?: number
  body?: PortableTextBlock[]
  localMainImage?: LocalArticleImage
  hideEyebrowRules?: boolean
  /** A closing note shown under the article, above Sources. */
  disclosure?: string
  /** 'draft' only while previewing a Studio draft (or a Markdown draft on local and preview builds). */
  status?: 'published' | 'draft'
  /** Where the post came from. Comments are only offered on Studio posts. */
  source?: 'studio' | 'markdown'
  seo?: {
    title?: string
    description?: string
    image?: LocalArticleImage
    canonicalUrl?: string
    noindex?: boolean
  }
}

export interface LocalArticleImage {
  src: string
  width: number
  height: number
  alt: string
  caption?: string
  /** CSS object-position for cards that crop the cover, e.g. "left". */
  position?: string
}

export interface PortableTextBlock {
  _key: string
  _type: string
  children?: PortableTextSpan[]
  markDefs?: PortableTextMarkDef[]
  style?: string
  listItem?: string
  level?: number
  asset?: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  caption?: string
  credit?: string
  creditUrl?: string
  code?: string
  language?: string
  src?: string
  width?: number
  height?: number
  url?: string
  title?: string
  eyebrow?: string
  quote?: string
  sourceTitle?: string
  sourceDetail?: string
  sourceUrl?: string
  source?: string
  sharePrice?: {
    label: string
    value: number
    displayValue: string
  }
  bookValue?: {
    label: string
    value: number
    displayValue: string
  }
  premium?: {
    label: string
    value: number
    displayValue: string
  }
  multipleLabel?: string
  navHistory?: Array<{
    label: string
    value: number
    displayValue: string
    dateLabel: string
    tone?: string
  }>
  axisTicks?: number[]
  rows?: Array<{
    name: string
    earlierValue?: number
    earlierLabel?: string
    latestValue: number
    latestLabel: string
    note: string
  }>
  maxValue?: number
  priceLabel?: string
  navLabel?: string
  price?: Array<{
    position: number
    value: number
    date: string
    label?: string
    accent?: string
  }>
  nav?: Array<{
    position: number
    value: number
    date: string
    label?: string
  }>
  primary?: {
    name: string
    issuer: string
    status: string
    metrics: Array<{ label: string; value: string; tone?: string }>
  }
  comparison?: {
    name: string
    issuer: string
    status: string
    metrics: Array<{ label: string; value: string; tone?: string }>
  }
  dateLabel?: string
  dateTime?: string
  ariaLabel?: string
  highlight?: {
    value: string
    label: string
  }
  segments?: Array<{
    _key?: string
    name: string
    value: number
    displayValue?: string
    tone: string
  }>
  metrics?: Array<{
    _key?: string
    label: string
    value: string
    detail: string
    tone?: string
  }>
}

export interface PortableTextSpan {
  _key: string
  _type: 'span'
  text: string
  marks?: string[]
}

export interface PortableTextMarkDef {
  _key: string
  _type: string
  href?: string
}
