// TypeScript types for Sanity documents

export interface Author {
  _id: string
  name: string
  slug: string
  image?: SanityImage
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
  mainImage?: SanityImage
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
}

export interface LocalArticleImage {
  src: string
  width: number
  height: number
  alt: string
  caption?: string
}

export interface Comment {
  _id: string
  author: string
  content: string
  createdAt: string
  likes: number
  parentComment?: string
}

export interface SiteSettings {
  publicationName: string
  tagline?: string
  description?: string
  subscriberCount?: number
  logo?: SanityImage
  socialLinks?: {
    twitter?: string
    instagram?: string
    youtube?: string
  }
}

export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  caption?: string
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
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
