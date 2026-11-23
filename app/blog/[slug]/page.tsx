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
import { ArticleJsonLd } from '@/components/seo/ArticleJsonLd'
import { prepareArticleContent } from '@/lib/blog/article-content'
import { getAllPosts, getDraftPreview, getPost, getRelatedPosts } from '@/lib/blog/source'
import type { Post } from '@/lib/blog/types'
import { articleShareImage, pageMetadata, postModifiedAt, postWasUpdated, RSS_ALTERNATE, SITE_NAME, SITE_URL, X_HANDLE } from '@/lib/seo'
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

/** The search and share description: the Studio's SEO description, else the excerpt or deck. */
function postDescription(post: Post) {
  return post.seo?.description || post.excerpt || post.subtitle || undefined
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { post, previewing } = await loadPost(slug)
  if (!post) return { title: 'Post not found', robots: { index: false, follow: true } }
  // The title stands alone (no " | Seb Montgomery") so it fits the ~60 characters search results show.
  const title = post.seo?.title || post.title
  const description = postDescription(post) || ''
  const image = articleShareImage(post)
  const base = pageMetadata({
    path: post.seo?.canonicalUrl || `/blog/${post.slug}`,
    title: { absolute: title },
    description,
    image,
    type: 'article',
    robots: previewing || post.status === 'draft' || post.seo?.noindex ? { index: false, follow: false } : undefined,
  })
  return {
    ...base,
    alternates: { ...base.alternates, types: { ...RSS_ALTERNATE, 'text/markdown': `/blog/${post.slug}.md` } },
    authors: [{ name: post.author?.name || SITE_NAME, url: `${SITE_URL}/` }],
    openGraph: {
      type: 'article',
      url: base.alternates?.canonical as string,
      siteName: SITE_NAME,
      locale: 'en_GB',
      title,
      description,
      images: [image],
      publishedTime: post.publishedAt,
      modifiedTime: postModifiedAt(post),
      authors: [`${SITE_URL}/`],
      section: post.category?.title,
    },
    twitter: {
      card: 'summary_large_image',
      site: X_HANDLE,
      creator: post.author?.xHandle ? `@${post.author.xHandle}` : X_HANDLE,
      title,
      description,
      images: [{ url: image.url, alt: image.alt }],
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
  const updated = postWasUpdated(post) ? post._updatedAt : undefined
  const authorImageUrl = post.author?.imageUrl || '/images/seb-pfp.png'

  // The <article> holds only the article; the closing note, author bio, comments and related
  // posts sit after it inside the same page wrapper, so their look is unchanged.
  return (
    <ArticleGalleryProvider images={gallery}>
      {previewing && <PreviewBanner postId={post._id} />}
      {!previewing && <ArticleJsonLd post={post} prepared={prepared} description={postDescription(post)} image={articleShareImage(post)} />}
      <div className={`article-page${post.hideEyebrowRules ? ' article-page--no-eyebrow-rules' : ''}`}>
        <article className="article-main">
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
                {updated && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Updated <time dateTime={updated}>{formatDate(updated)}</time></span>
                  </>
                )}
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
        </article>

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
      </div>
    </ArticleGalleryProvider>
  )
}
