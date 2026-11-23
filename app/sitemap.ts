// /sitemap.xml: every public page and every live article, built from the Studio on each
// refresh, so new articles appear without a code change. lastModified is the article's
// Updated date when set (else its publish date). Refreshed by revalidatePublicPages().
import type { MetadataRoute } from 'next'

import { getAllPosts } from '@/lib/blog/source'
import { isIndexablePost, postModifiedAt, postUrl, SITE_URL } from '@/lib/seo'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await getAllPosts()).filter(isIndexablePost)
  const newest = posts.map((post) => postModifiedAt(post)).filter(Boolean).sort().at(-1)
  const newestDate = newest ? new Date(newest) : undefined

  return [
    { url: `${SITE_URL}/`, lastModified: newestDate, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: newestDate, changeFrequency: 'weekly', priority: 0.9 },
    ...posts.map((post) => {
      const modified = postModifiedAt(post)
      return {
        url: postUrl(post),
        lastModified: modified ? new Date(modified) : undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }
    }),
    { url: `${SITE_URL}/skill-files`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/breakpoint`, changeFrequency: 'yearly', priority: 0.4 },
  ]
}
