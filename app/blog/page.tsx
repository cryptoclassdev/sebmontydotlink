import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { client } from '@/sanity/client'
import { urlFor } from '@/sanity/client'
import {
  featuredPostQuery,
  recentPostsQuery,
  popularPostsQuery,
  siteSettingsQuery,
} from '@/sanity/queries'
import type { Post, SiteSettings } from '@/sanity/types'
import {
  FeaturedPost,
  PostCard,
  PopularPosts,
  ArchiveTabs,
  SubscribeCTA,
} from '@/components/blog'

export const metadata: Metadata = {
  title: 'Blog | Seb Montgomery',
  description: 'Thoughts on crypto, DeFi, and the future of finance.',
}

interface SearchParams {
  sort?: string
}

async function getData(sort: string = 'latest') {
  const [featuredPost, recentPosts, popularPosts, settings] = await Promise.all([
    client.fetch<Post>(featuredPostQuery),
    client.fetch<Post[]>(recentPostsQuery),
    client.fetch<Post[]>(popularPostsQuery),
    client.fetch<SiteSettings>(siteSettingsQuery),
  ])

  // Sort posts based on tab selection
  let sortedPosts = recentPosts
  if (sort === 'top') {
    sortedPosts = [...(recentPosts || [])].sort(
      (a, b) => (b.likes || 0) - (a.likes || 0)
    )
  } else if (sort === 'discussions') {
    sortedPosts = [...(recentPosts || [])].sort(
      (a, b) => (b.commentCount || 0) - (a.commentCount || 0)
    )
  }

  return { featuredPost, posts: sortedPosts, popularPosts, settings }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { sort } = await searchParams
  const { featuredPost, posts, popularPosts, settings } = await getData(sort)
  const logoUrl = settings?.logo
    ? urlFor(settings.logo).width(64).height(64).url()
    : undefined

  return (
    <div className="max-w-[1200px] mx-auto px-4">
      {/* Featured Post Section */}
      {featuredPost && (
        <section className="py-8 border-b border-gray-100">
          <FeaturedPost post={featuredPost} />
        </section>
      )}

      {/* Most Popular Section */}
      {popularPosts && popularPosts.length > 0 && (
        <section className="py-8 border-b border-gray-100">
          <PopularPosts posts={popularPosts} variant="horizontal" />
        </section>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 py-8">
        {/* Posts Grid */}
        <div className="lg:col-span-2">
          {/* Archive Tabs */}
          <Suspense fallback={<div className="h-12 border-b border-gray-200" />}>
            <ArchiveTabs />
          </Suspense>

          {/* Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {posts?.map((post) => (
              <PostCard key={post._id} post={post} variant="grid" />
            ))}
          </div>

          {(!posts || posts.length === 0) && (
            <p className="text-gray-500 py-8 text-center">No posts yet.</p>
          )}

          {/* See All Button */}
          {posts && posts.length > 0 && (
            <div className="mt-8 text-center">
              <Link
                href="/blog/search"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                See all
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-8">
          {/* Publication Info */}
          <div className="flex items-start gap-4">
            <Image
              src={logoUrl || '/images/seb-pfp.png'}
              alt={settings?.publicationName || 'Blog'}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {settings?.publicationName || 'Seb Montgomery'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {settings?.description ||
                  'Thoughts on crypto, DeFi, and the future of finance.'}
              </p>
            </div>
          </div>

          {/* Subscribe CTA */}
          <SubscribeCTA
            publicationName={settings?.publicationName}
            variant="inline"
          />
        </aside>
      </div>
    </div>
  )
}
