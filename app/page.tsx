import { BentoGrid } from "@/components/bento-grid"
import { getPostPublishedAt } from "@/lib/blog/catalog"
import { getHomepagePost } from "@/lib/blog/source"
import { pageMetadata, SITE_DESCRIPTION } from "@/lib/seo"

export const metadata = pageMetadata({
  path: "/",
  title: { absolute: "Seb Montgomery | Crypto, Solana and AI research" },
  description: SITE_DESCRIPTION,
})

export const revalidate = 60

export default async function Home() {
  const post = await getHomepagePost()
  const latestPost = post
    ? {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || post.subtitle || "",
        publishedAt: getPostPublishedAt(post),
        imagePosition: post.localMainImage?.position,
        imageUrl: post.localMainImage?.src || "",
      }
    : null

  return <BentoGrid latestPost={latestPost} />
}
