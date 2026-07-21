import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleBody, AuthorBio, PostCard } from '@/components/blog'
import { ArticleActions } from '@/components/blog/ArticleActions'
import { ArticleGalleryProvider, ArticleImageTrigger } from '@/components/blog/ArticleLightbox'
import { prepareArticleContent, sanityImageToGalleryImage } from '@/lib/blog/article-content'
import { applyArticleEditorialOverride, getArticleEditorialOverride } from '@/lib/blog/editorial-overrides'
import { client, urlFor } from '@/sanity/client'
import { popularPostsQuery, postBySlugQuery, postSlugsQuery } from '@/sanity/queries'
import type { Post } from '@/sanity/types'

type Props = { params: Promise<{ slug: string }> }

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(postSlugsQuery).catch(() => [])
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch<Post | null>(postBySlugQuery, { slug }).catch(() => null)
  if (!post) return { title: 'Post not found' }
  const description = post.excerpt || post.subtitle
  const editorialOverride = getArticleEditorialOverride(post.slug)
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      publishedTime: editorialOverride?.publishedAt || post.publishedAt,
      modifiedTime: post._updatedAt,
      images: post.mainImage ? [{ url: urlFor(post.mainImage).width(1200).height(630).fit('crop').auto('format').url() }] : undefined,
    },
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [post, relatedPosts] = await Promise.all([
    client.fetch<Post | null>(postBySlugQuery, { slug }).catch(() => null),
    client.fetch<Post[]>(popularPostsQuery).catch(() => []),
  ])
  if (!post) notFound()

  const heroImage = post.mainImage ? sanityImageToGalleryImage(post.mainImage, post.title) : null
  const editorialOverride = getArticleEditorialOverride(post.slug)
  const body = applyArticleEditorialOverride(post.slug, post.body || [])
  const prepared = prepareArticleContent(body, heroImage ? 1 : 0, editorialOverride?.imageOverrides)
  const gallery = heroImage ? [heroImage, ...prepared.gallery] : prepared.gallery
  const date = editorialOverride?.publishedAt || post.publishedAt || post._updatedAt
  const authorImageUrl = post.author?.image ? urlFor(post.author.image).width(96).height(96).fit('crop').url() : '/images/seb-pfp.png'
  const related = relatedPosts.filter((item) => item._id !== post._id).slice(0, 3)

  return (
    <ArticleGalleryProvider images={gallery}>
      <article className="article-page">
        <header className="article-header">
          <span className="site-eyebrow">{post.category?.title || 'Research'}</span>
          <h1>{post.title}</h1>
          {post.subtitle && <p className="article-deck">{post.subtitle}</p>}
          <div className="article-byline">
            <Image src={authorImageUrl} alt="" width={36} height={36} />
            <span>By <strong>{post.author?.name || 'Seb Montgomery'}</strong></span>
            {post.author?.xHandle && <a href={`https://x.com/${post.author.xHandle}`} target="_blank" rel="noopener noreferrer">@{post.author.xHandle}</a>}
            <span aria-hidden="true">·</span>
            {date && <time dateTime={date}>{formatDate(date)}</time>}
            <span aria-hidden="true">·</span>
            <span>{post.readTime || 5} min read</span>
          </div>
          <ArticleActions title={post.title} />
        </header>

        {heroImage && (
          <figure className="article-hero">
            <ArticleImageTrigger image={heroImage} index={0} hero priority />
          </figure>
        )}

        <div className="article-layout">
          <ArticleBody prepared={prepared} />
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

        {related.length > 0 && (
          <section className="article-related" aria-labelledby="related-posts-title">
            <div className="site-section-heading">
              <div><span className="site-eyebrow">From the archive</span><h2 id="related-posts-title">More writing</h2></div>
              <Link href="/blog">View all <span aria-hidden="true">→</span></Link>
            </div>
            <div className="publication-archive__grid">{related.map((item) => <PostCard key={item._id} post={item} variant="grid" />)}</div>
          </section>
        )}
      </article>
    </ArticleGalleryProvider>
  )
}
