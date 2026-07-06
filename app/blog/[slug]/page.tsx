import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { urlFor } from '@/sanity/client'
import {
  postBySlugQuery,
  postSlugsQuery,
  popularPostsQuery,
} from '@/sanity/queries'
import type { Post } from '@/sanity/types'
import {
  ArticleBody,
  AuthorBio,
  EngagementBar,
  PostCard,
  SubscribeCTA,
} from '@/components/blog'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(postSlugsQuery)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await client.fetch<Post>(postBySlugQuery, { slug })

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: `${post.title} | Seb Montgomery`,
    description: post.excerpt || post.subtitle,
    openGraph: post.mainImage
      ? {
          images: [urlFor(post.mainImage).width(1200).height(630).url()],
        }
      : undefined,
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const [post, relatedPosts] = await Promise.all([
    client.fetch<Post>(postBySlugQuery, { slug }),
    client.fetch<Post[]>(popularPostsQuery),
  ])

  if (!post) {
    notFound()
  }

  const imageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).height(675).url()
    : null

  const authorImageUrl = post.author?.image
    ? urlFor(post.author.image).width(80).height(80).url()
    : null

  return (
    <article className="max-w-[680px] mx-auto px-4 py-8">
      {/* Post Header */}
      <header className="mb-8">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold text-gray-900 leading-tight">
          {post.title}
        </h1>

        {/* Subtitle */}
        {post.subtitle && (
          <p className="text-xl text-gray-600 mt-3 leading-relaxed">
            {post.subtitle}
          </p>
        )}

        {/* Author & Meta */}
        <div className="flex items-center justify-between mt-6 py-4 border-y border-gray-100">
          <div className="flex items-center gap-3">
            {/* Author Avatar */}
            {authorImageUrl ? (
              <Link
                href={`/blog?author=${post.author?.slug}`}
                className="relative w-10 h-10 rounded-full overflow-hidden"
              >
                <Image
                  src={authorImageUrl}
                  alt={post.author?.name || 'Author'}
                  fill
                  className="object-cover"
                />
              </Link>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200" />
            )}

            {/* Author Name & Date */}
            <div>
              <div className="flex items-center gap-1.5">
                {post.author?.name && (
                  <Link
                    href={`/blog?author=${post.author?.slug}`}
                    className="font-medium text-gray-900 hover:text-gray-600 transition-colors"
                  >
                    {post.author.name}
                  </Link>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
              </div>
            </div>
          </div>

          {/* Engagement */}
          <EngagementBar
            likes={post.likes}
            comments={post.commentCount}
            size="sm"
          />
        </div>
      </header>

      {/* Featured Image */}
      {imageUrl && (
        <figure className="mb-8 -mx-4 md:mx-0">
          <div className="relative aspect-video md:rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={post.mainImage?.alt || post.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        </figure>
      )}

      {/* Article Body */}
      {post.body && (
        <div className="prose-substack">
          <ArticleBody content={post.body} />
        </div>
      )}

      {/* Divider */}
      <hr className="border-gray-200 my-10" />

      {/* Subscribe CTA */}
      <div className="my-10">
        <SubscribeCTA variant="card" />
      </div>

      {/* Engagement Bar (bottom) */}
      <div className="flex items-center justify-between py-4 border-y border-gray-100">
        <EngagementBar likes={post.likes} comments={post.commentCount} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between py-6">
        <Link
          href="/blog"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </Link>
        <Link
          href="/blog"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Author Bio */}
      {post.author && (
        <div className="my-10">
          <AuthorBio author={post.author} />
        </div>
      )}

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-6">
            Top Posts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.slice(0, 4).map((relatedPost) => (
              <PostCard key={relatedPost._id} post={relatedPost} variant="compact" />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              See all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}
    </article>
  )
}
