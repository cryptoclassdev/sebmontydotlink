// Serves the plain-Markdown copy of an article at /blog/<slug>.md (rewrite in next.config.mjs).
import { getAllPosts, getArticleMarkdown } from '@/lib/blog/source'

export const revalidate = 60

export async function generateStaticParams() {
  return (await getAllPosts()).map((post) => ({ slug: post.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const markdown = await getArticleMarkdown(slug)
  if (!markdown) return new Response('Not found\n', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  })
}
