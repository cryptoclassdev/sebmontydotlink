// /llms.txt: a plain-text map of the site for AI agents, with a Markdown link for every article.
import { mergeBlogPosts, getPostPublishedAt } from '@/lib/blog/catalog'
import { FILE_ARTICLES } from '@/lib/publishing'
import { client } from '@/sanity/client'
import { postsQuery } from '@/sanity/queries'
import type { Post } from '@/sanity/types'

export const revalidate = 300

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sebmonty.link').replace(/\/$/, '')

export async function GET() {
  const sanityPosts = await client.fetch<Post[]>(postsQuery).catch(() => [])
  const markdownSlugs = new Set(FILE_ARTICLES.map((post) => post.slug))
  const posts = mergeBlogPosts(sanityPosts)

  const lines = [
    '# Seb Montgomery',
    '',
    '> Independent research on crypto, markets, and the products reshaping finance, by Seb Montgomery (@SebMontgomery).',
    '',
    'Links ending in .md are plain-Markdown copies of the article: full text, image captions and sources without the page layout.',
    '',
    '## Articles',
    '',
    ...posts.map((post) => {
      const date = getPostPublishedAt(post).slice(0, 10)
      const url = markdownSlugs.has(post.slug) ? `${SITE_URL}/blog/${post.slug}.md` : `${SITE_URL}/blog/${post.slug}`
      const summary = post.excerpt || post.subtitle
      return `- [${post.title}](${url}) (${date})${summary ? `: ${summary}` : ''}`
    }),
    '',
    '## Site',
    '',
    `- [Blog](${SITE_URL}/blog): all articles`,
    `- [Skill Files](${SITE_URL}/skill-files): agent skills for crypto research`,
    `- [Home](${SITE_URL}/): links, projects and referral directory`,
    '',
  ]

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
