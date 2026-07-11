import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'bfn64pgm'
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const client = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = createImageUrlBuilder({
  projectId: sanityProjectId,
  dataset: sanityDataset,
})

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
