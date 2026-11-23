// /blog/rss.xml: RSS 2.0 feed of the 20 newest articles, for feed readers, newsletter tools
// and AI crawlers. Linked from the root layout. Refreshed by revalidatePublicPages().
import { getAllPosts } from '@/lib/blog/source'
import { absoluteUrl, isIndexablePost, postUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo'

export const revalidate = 300

function xml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function rfc822(iso?: string) {
  const date = iso ? new Date(iso) : null
  return date && !Number.isNaN(date.getTime()) ? date.toUTCString() : undefined
}

export async function GET() {
  const posts = (await getAllPosts()).filter(isIndexablePost).slice(0, 20)
  const feedUrl = `${SITE_URL}/blog/rss.xml`

  const items = posts.map((post) => {
    const url = postUrl(post)
    const summary = post.seo?.description || post.excerpt || post.subtitle || ''
    const cover = post.localMainImage
    return [
      '    <item>',
      `      <title>${xml(post.title)}</title>`,
      `      <link>${xml(url)}</link>`,
      `      <guid isPermaLink="true">${xml(url)}</guid>`,
      rfc822(post.publishedAt) ? `      <pubDate>${rfc822(post.publishedAt)}</pubDate>` : '',
      `      <dc:creator>${xml(post.author?.name || SITE_NAME)}</dc:creator>`,
      post.category?.title ? `      <category>${xml(post.category.title)}</category>` : '',
      summary ? `      <description>${xml(summary)}</description>` : '',
      cover
        ? `      <media:content url="${xml(absoluteUrl(cover.src))}" medium="image" width="${cover.width}" height="${cover.height}"><media:description>${xml(cover.alt || post.title)}</media:description></media:content>`
        : '',
      '    </item>',
    ]
      .filter(Boolean)
      .join('\n')
  })

  const lastBuild = rfc822(posts[0]?.publishedAt) || new Date().toUTCString()
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">',
    '  <channel>',
    `    <title>${xml(`${SITE_NAME}: research`)}</title>`,
    `    <link>${SITE_URL}/blog</link>`,
    `    <description>${xml(SITE_DESCRIPTION)}</description>`,
    '    <language>en-gb</language>',
    `    <lastBuildDate>${lastBuild}</lastBuildDate>`,
    `    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>`,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')

  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
