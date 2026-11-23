// /llms.txt: a plain-text map of the site for AI agents: who Seb is, every article with a
// Markdown link, and where the feed and sitemap are. Refreshed by revalidatePublicPages().
import { getPostPublishedAt } from '@/lib/blog/catalog'
import { getPostCards } from '@/lib/blog/source'
import { isIndexablePost, PROFILE_LINKS, postWasUpdated, SITE_URL } from '@/lib/seo'

export const revalidate = 300

/** The same sentence as the homepage's bio line (components/bento-grid.tsx). */
const BIO =
  'Seb Montgomery writes independent research on crypto, Solana and AI. He co-founded validator.com and runs thecommunication.link, a content and branding consultancy.'

export async function GET() {
  const posts = (await getPostCards()).filter(isIndexablePost)

  const lines = [
    '# Seb Montgomery',
    '',
    '> Independent research on crypto, Solana and AI by Seb Montgomery (@SebMontgomery): long-form articles with dated figures and a linked Sources list.',
    '',
    BIO,
    '',
    'Links ending in .md are plain-Markdown copies of the article: full text, image captions and sources without the page layout.',
    '',
    '## Articles',
    '',
    ...posts.map((post) => {
      const date = getPostPublishedAt(post).slice(0, 10)
      const updated = postWasUpdated(post) ? `, updated ${post._updatedAt?.slice(0, 10)}` : ''
      const url = `${SITE_URL}/blog/${post.slug}.md`
      const summary = post.seo?.description || post.excerpt || post.subtitle
      return `- [${post.title}](${url}) (${date}${updated})${summary ? `: ${summary}` : ''}`
    }),
    '',
    '## About Seb Montgomery',
    '',
    `- [Website](${SITE_URL}/): research, links and projects`,
    `- [X](${PROFILE_LINKS.x}): daily notes, @SebMontgomery`,
    `- [YouTube](${PROFILE_LINKS.youtube}): long-form videos`,
    `- [LinkedIn](${PROFILE_LINKS.linkedin})`,
    `- [Telegram](${PROFILE_LINKS.telegram})`,
    '- [validator.com](https://validator.com): co-founder; Solana staking',
    '- [thecommunication.link](https://thecommunication.link): founder; content and branding consultancy',
    '',
    '## Site',
    '',
    `- [Blog](${SITE_URL}/blog): all articles`,
    `- [Skill Files](${SITE_URL}/skill-files): agent skills for crypto research`,
    `- [Home](${SITE_URL}/): links, projects and referral directory`,
    `- [RSS feed](${SITE_URL}/blog/rss.xml): the newest articles`,
    `- [Sitemap](${SITE_URL}/sitemap.xml): every page`,
    '',
  ]

  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
