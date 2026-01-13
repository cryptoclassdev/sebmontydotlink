import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getPost, getPostSlugs, urlFor } from "@/lib/sanity"
import { BlogPortableText } from "@/components/portable-text"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ slug: string }>
}

interface Post {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  mainImage?: {
    asset: { _ref: string }
    alt?: string
  }
  body: Array<{
    _type: string
    _key: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }>
  estimatedReadingTime?: number
}

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.map((s: { slug: string }) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post: Post | null = await getPost(slug)

  if (!post) {
    return {
      title: "Post Not Found | Seb Montgomery",
    }
  }

  return {
    title: `${post.title} | Seb Montgomery`,
    description: post.excerpt || `Read ${post.title} by Seb Montgomery`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      images: post.mainImage
        ? [{ url: urlFor(post.mainImage).width(1200).height(630).url() }]
        : undefined,
    },
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post: Post | null = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none" />

      <article className="relative max-w-3xl mx-auto px-6 py-16 lg:py-24">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-12 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm">Back to blog</span>
        </Link>

        {/* Header */}
        <header className="mb-12">
          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-white/40 mb-6">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {post.estimatedReadingTime && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span>{post.estimatedReadingTime} min read</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-white/50 leading-relaxed">{post.excerpt}</p>
          )}
        </header>

        {/* Hero image */}
        {post.mainImage && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/5 mb-12">
            <Image
              src={urlFor(post.mainImage).width(1200).url()}
              alt={post.mainImage.alt || post.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none">
          <BlogPortableText value={post.body} />
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to all posts</span>
          </Link>
        </footer>
      </article>
    </div>
  )
}
