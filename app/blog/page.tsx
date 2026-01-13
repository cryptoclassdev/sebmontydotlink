import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { getPosts, urlFor } from "@/lib/sanity"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog | Seb Montgomery",
  description: "Thoughts on crypto, markets, and building in web3.",
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
  estimatedReadingTime?: number
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPage() {
  const posts: Post[] = await getPosts()

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 py-16 lg:py-24">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-12 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm">Back to home</span>
        </Link>

        {/* Header */}
        <header className="mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Blog
          </h1>
          <p className="text-lg text-white/50">
            Thoughts on crypto, markets, and building in web3.
          </p>
        </header>

        {/* Posts list */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/40 text-lg">No posts yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post._id} className="group">
                <Link
                  href={`/blog/${post.slug.current}`}
                  className="block p-6 -mx-6 rounded-2xl transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex gap-6">
                    {/* Thumbnail */}
                    {post.mainImage && (
                      <div className="hidden sm:block relative w-32 h-24 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                        <Image
                          src={urlFor(post.mainImage).width(256).height(192).url()}
                          alt={post.mainImage.alt || post.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Meta */}
                      <div className="flex items-center gap-3 text-sm text-white/40 mb-2">
                        <time dateTime={post.publishedAt}>
                          {formatDate(post.publishedAt)}
                        </time>
                        {post.estimatedReadingTime && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>{post.estimatedReadingTime} min read</span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-white/50 line-clamp-2">{post.excerpt}</p>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
