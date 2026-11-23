// /og/blog/<slug>: an article's 1200 x 630 share card, drawn from its cover photo and headline.
// Used when the article has no share image of its own in the Studio's SEO tab.
// Linked with ?v=<hash> (articleShareImage in lib/seo.ts) so edits get a fresh URL.
import { ImageResponse } from 'next/og'

import { getAllPosts } from '@/lib/blog/source'
import { ArticleCard, avatarDataUrl, CARD_HEADERS, CARD_SIZE, imageDataUrl, loadFonts } from '@/lib/og'

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getAllPosts()).map((post) => ({ slug: post.slug }))
}

function dateLabel(iso?: string) {
  if (!iso) return undefined
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = (await getAllPosts()).find((item) => item.slug === slug)
  if (!post) return new Response('Not found\n', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })

  const [fonts, avatar, cover] = await Promise.all([loadFonts(), avatarDataUrl(), imageDataUrl(post.localMainImage?.src)])
  return new ImageResponse(
    (
      <ArticleCard
        title={post.title}
        category={post.category?.title}
        dateLabel={dateLabel(post.publishedAt)}
        author={post.author?.name || 'Seb Montgomery'}
        cover={cover}
        coverPosition={post.localMainImage?.position}
        avatar={avatar}
      />
    ),
    { ...CARD_SIZE, fonts, headers: CARD_HEADERS },
  )
}
