import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleBody, AuthorBio, PostCard } from '@/components/blog'
import { ArticleActions } from '@/components/blog/ArticleActions'
import { ArticleComments } from '@/components/blog/ArticleComments'
import { ArticleGalleryProvider, ArticleImageTrigger } from '@/components/blog/ArticleLightbox'
import { PreviewBanner } from '@/components/blog/PreviewBanner'
import { prepareArticleContent } from '@/lib/blog/article-content'
import { getAllPosts, getDraftPreview, getPost, getRelatedPosts } from '@/lib/blog/source'
import type { Post } from '@/lib/blog/types'
import { getCurrentUser } from '@/lib/studio/session'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 60

export async function generateStaticParams() {
  return (await getAllPosts()).map((post) => ({ slug: post.slug }))
}

/** In draft mode, signed-in Studio users see the draft; everyone else sees the live article. */
async function loadPost(slug: string): Promise<{ post: Post | null; previewing: boolean }> {
  const { isEnabled } = await draftMode()
  if (isEnabled && (await getCurrentUser())) {
    const draft = await getDraftPreview(slug)
    if (draft) return { post: draft, previewing: true }
  }
  return { post: await getPost(slug), previewing: false }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { post, previewing } = await loadPost(slug)
  if (!post) return { title: 'Post not found' }
  const title = post.seo?.title || post.title
  const description = post.seo?.description || post.excerpt || post.subtitle
  const shareImage = post.seo?.image || post.localMainImage
  return {
    title,
    description,
    alternates: {
      canonical: post.seo?.canonicalUrl || `/blog/${post.slug}`,
      types: { 'text/markdown': `/blog/${post.slug}.md` },
    },
    robots: previewing || post.status === 'draft' || post.seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post._updatedAt,
      images: shareImage ? [{ url: shareImage.src, width: shareImage.width, height: shareImage.height, alt: shareImage.alt }] : undefined,
    },
    twitter: {
      card: shareImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: shareImage ? [shareImage.src] : undefined,
    },
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const { post, previewing } = await loadPost(slug)
  if (!post) notFound()
  const related = await getRelatedPosts(post)

  const heroImage = post.localMainImage || null
  const prepared = prepareArticleContent(post.body || [], heroImage ? 1 : 0)
  const gallery = heroImage ? [heroImage, ...prepared.gallery] : prepared.gallery
  const date = post.publishedAt || post._updatedAt
  const authorImageUrl = post.author?.imageUrl || '/images/seb-pfp.png'

  return (
    <ArticleGalleryProvider images={gallery}>
      {previewing && <PreviewBanner postId={post._id} />}
      <article className={`article-page${post.hideEyebrowRules ? ' article-page--no-eyebrow-rules' : ''}`}>
        <header className="article-header">
          <span className="site-eyebrow">{post.status === 'draft' ? 'Draft (not live) · ' : ''}{post.category?.title || 'Research'}</span>
          <h1>{post.title}</h1>
          {post.subtitle && <p className="article-deck">{post.subtitle}</p>}
          <div className="article-byline">
            <span className="article-byline__author">
              <Image src={authorImageUrl} alt="" width={36} height={36} />
              <span>By <strong>{post.author?.name || 'Seb Montgomery'}</strong></span>
              {post.author?.xHandle && <a href={`https://x.com/${post.author.xHandle}`} target="_blank" rel="noopener noreferrer">@{post.author.xHandle}</a>}
            </span>
            <span className="article-byline__meta">
              {date && <time dateTime={date}>{formatDate(date)}</time>}
              <span aria-hidden="true">·</span>
              <span>{post.readTime || 5} min read</span>
            </span>
          </div>
          <ArticleActions title={post.title} />
        </header>

        {heroImage && (
          <figure className="article-hero">
            <ArticleImageTrigger image={heroImage} index={0} hero priority />
          </figure>
        )}

        <div className="article-layout">
          <ArticleBody prepared={prepared} disclosure={post.disclosure} />
        </div>

        <section className="article-end" aria-labelledby="article-end-title">
          <div>
            <span className="site-eyebrow">Keep reading</span>
            <h2 id="article-end-title">Independent research, without the daily noise.</h2>
            <p>New work arrives when there is something useful to explain.</p>
          </div>
          <ArticleActions title={post.title} />
        </section>

        {post.author && <div className="article-author"><AuthorBio author={post.author} /></div>}

        {post.source === 'studio' && !previewing && <ArticleComments postId={post._id} slug={post.slug} />}

        {related.length > 0 && (
          <section className="article-related" aria-labelledby="related-posts-title">
            <div className="site-section-heading">
              <div><span className="site-eyebrow">From the archive</span><h2 id="related-posts-title">More from the blog</h2></div>
              <Link href="/blog">View all <span aria-hidden="true">→</span></Link>
            </div>
            <div className="publication-archive__grid">{related.map((item) => <PostCard key={item._id} post={item} variant="grid" />)}</div>
          </section>
        )}
      </article>
    </ArticleGalleryProvider>
  )
}
