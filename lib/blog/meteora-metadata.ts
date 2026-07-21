import type { Category, Post } from '@/sanity/types'

export const METEORA_SLUG = 'complete-meteora-dlmm-liquidity-course'

export const METEORA_CATEGORY: Category = {
  _id: 'local-category-solana',
  title: 'Solana',
  slug: 'solana',
  description: 'Infrastructure, products, and practical notes from the Solana ecosystem.',
  postCount: 1,
}

export const METEORA_POST_CARD: Post = {
  _id: 'local-meteora-dlmm-guide',
  _updatedAt: '2026-07-21T12:00:00.000Z',
  title: 'How to LP on Meteora: A Practical DLMM Guide',
  subtitle: 'A decision-by-decision guide to finding a real pool, checking the token, setting a range, and measuring fees against the risk you actually took.',
  excerpt: 'A practical workflow for choosing a Meteora DLMM pool, checking the token, setting a range, and measuring fees against risk.',
  slug: METEORA_SLUG,
  author: {
    _id: 'local-author-seb-montgomery',
    name: 'Seb Montgomery',
    slug: 'seb-montgomery',
    bio: 'Independent research on crypto markets, products, and the systems around them.',
    xHandle: 'SebMontgomery',
  },
  category: METEORA_CATEGORY,
  categories: ['Solana'],
  publishedAt: '2026-07-21T12:00:00.000Z',
  isFeatured: false,
  readTime: 11,
  likes: 0,
  commentCount: 0,
  hideEyebrowRules: true,
  localMainImage: {
    src: '/images/meteora-lp/02-2-top-performers-filters.png',
    width: 1280,
    height: 720,
    alt: "Meteora's Top Performers page sorted by fees earned against active TVL over a two-hour window.",
    caption: 'Top Performers is where the search starts. It is not where the decision ends.',
  },
}
