// /llms.txt: a plain-text map of the site for AI agents, with a Markdown link for every article.
import { getPostPublishedAt } from '@/lib/blog/catalog'
import { getPostCards, SITE_URL } from '@/lib/blog/source'

export const revalidate = 300

export async function GET() {
  const posts = await getPostCards()

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
      const url = `${SITE_URL}/blog/${post.slug}.md`
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
