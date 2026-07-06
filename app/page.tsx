import { BentoGrid } from "@/components/bento-grid"
import { client, urlFor } from "@/sanity/client"

const latestPostQuery = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0] {
  title,
  "slug": slug.current,
  excerpt,
  mainImage,
  publishedAt
}`

interface LatestPost {
  title: string
  slug: string
  excerpt?: string
  mainImage?: { asset: { _ref: string; _type: "reference" }; alt?: string }
  publishedAt?: string
}

export const revalidate = 60

export default async function Home() {
  const post = await client.fetch<LatestPost | null>(latestPostQuery).catch(() => null)

  const latestPost = post
    ? {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        publishedAt: post.publishedAt,
        imageUrl: post.mainImage ? urlFor(post.mainImage).width(240).height(240).url() : null,
      }
    : null

  return <BentoGrid latestPost={latestPost} />
}
