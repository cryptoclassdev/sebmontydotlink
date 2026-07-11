import { HomePage, type HomeFeaturedPost } from "@/components/home-page"
import { client, urlFor } from "@/sanity/client"
import { featuredPostQuery } from "@/sanity/queries"
import type { Post } from "@/sanity/types"

export const revalidate = 60

const fallbackPost: HomeFeaturedPost = {
  title: "You Can’t Buy into the World’s Top Robotics Companies Now. From a Solana wallet, you can own a slice.",
  slug: "robostrategy-bot-solana",
  excerpt: "RoboStrategy packs private robotics equity into a Nasdaq stock, and Backpack put a backed version on Solana.",
  category: "Stocks",
  readTime: 14,
  date: "2026-07-10",
  imageUrl: "https://cdn.sanity.io/images/bfn64pgm/production/033d9126d934acacba892c072c2b7ef6ec3fcd02-2248x1500.jpg?rect=0,118,2248,1265&w=1600&h=900&fit=crop&auto=format",
}

export default async function Home() {
  const post = await client.fetch<Post | null>(featuredPostQuery).catch(() => null)
  const featuredPost = post
    ? {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || post.subtitle || fallbackPost.excerpt,
        category: post.category?.title || "Research",
        readTime: post.readTime || 14,
        date: post.publishedAt || post._updatedAt || fallbackPost.date,
        imageUrl: post.mainImage
          ? urlFor(post.mainImage).width(1600).height(900).fit("crop").auto("format").url()
          : fallbackPost.imageUrl,
      }
    : fallbackPost

  return <HomePage featuredPost={featuredPost} />
}
