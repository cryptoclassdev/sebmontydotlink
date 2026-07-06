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
