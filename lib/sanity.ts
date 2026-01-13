import { createClient, type SanityClient } from "next-sanity"
import { createImageUrlBuilder } from "@sanity/image-url"
import type { SanityImageSource } from "@sanity/image-url/lib/types/types"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"

// Check if Sanity is configured
export const isSanityConfigured = Boolean(projectId)

export const sanityConfig = {
  projectId: projectId || "placeholder",
  dataset,
  apiVersion: "2024-01-01",
  useCdn: process.env.NODE_ENV === "production",
}

// Only create client if configured
let client: SanityClient | null = null
if (isSanityConfigured) {
  client = createClient(sanityConfig)
}

// Create a dummy builder for when Sanity is not configured
const builder = client ? createImageUrlBuilder(client) : null

export function urlFor(source: SanityImageSource) {
  if (!builder) {
    // Return a placeholder image URL when Sanity is not configured
    return {
      width: () => ({ height: () => ({ url: () => "/placeholder.jpg" }), url: () => "/placeholder.jpg" }),
      height: () => ({ url: () => "/placeholder.jpg" }),
      url: () => "/placeholder.jpg",
    }
  }
  return builder.image(source)
}

// Query helpers - return empty data when Sanity is not configured
export async function getPosts() {
  if (!client) {
    return []
  }
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
    }
  `)
}

export async function getPost(slug: string) {
  if (!client) {
    return null
  }
  return client.fetch(
    `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      body,
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
    }
  `,
    { slug }
  )
}

export async function getPostSlugs() {
  if (!client) {
    return []
  }
  return client.fetch(`
    *[_type == "post"] {
      "slug": slug.current
    }
  `)
}
