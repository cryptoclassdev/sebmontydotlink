// Reusable post fields
const postFields = `
  _id,
  _updatedAt,
  title,
  subtitle,
  "slug": slug.current,
  excerpt,
  mainImage,
  publishedAt,
  isFeatured,
  readTime,
  likes,
  commentCount,
  categories,
  "category": category->{title, "slug": slug.current, color},
  "author": author->{name, image, xHandle, bio, "slug": slug.current}
`

// All posts (ordered by date)
export const postsQuery = `*[_type == "post"] | order(publishedAt desc) { ${postFields} }`

// Single post by slug (with full body)
export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  ${postFields},
  body
}`

// Featured post (or most recent if none featured)
export const featuredPostQuery = `coalesce(
  *[_type == "post" && isFeatured == true] | order(publishedAt desc)[0] { ${postFields} },
  *[_type == "post"] | order(publishedAt desc)[0] { ${postFields} }
)`

// Recent posts (excluding featured)
export const recentPostsQuery = `*[_type == "post" && isFeatured != true] | order(publishedAt desc)[0...10] { ${postFields} }`

// Popular posts (by likes)
export const popularPostsQuery = `*[_type == "post"] | order(likes desc)[0...5] { ${postFields} }`

// Posts by category
export const postsByCategoryQuery = `*[_type == "post" && category->slug.current == $slug] | order(publishedAt desc) { ${postFields} }`

// All categories with post count
export const categoriesQuery = `*[_type == "category"] | order(order asc) {
  _id,
  title,
  "slug": slug.current,
  description,
  color,
  "postCount": count(*[_type == "post" && references(^._id)])
}`

// Single category by slug
export const categoryBySlugQuery = `*[_type == "category" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  description,
  color,
  "postCount": count(*[_type == "post" && references(^._id)])
}`

// Search posts
export const searchPostsQuery = `*[_type == "post" && (
  title match $query ||
  excerpt match $query ||
  pt::text(body) match $query
)] | order(publishedAt desc) { ${postFields} }`

// Post slugs for static generation
export const postSlugsQuery = `*[_type == "post" && defined(slug.current)][].slug.current`

// Category slugs for static generation
export const categorySlugsQuery = `*[_type == "category" && defined(slug.current)][].slug.current`

// Site settings
export const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  publicationName,
  tagline,
  description,
  subscriberCount,
  logo,
  socialLinks
}`

// Comments for a post
export const commentsQuery = `*[_type == "comment" && post._ref == $postId && isApproved == true] | order(createdAt desc) {
  _id,
  author,
  content,
  createdAt,
  likes,
  "parentComment": parentComment->_id
}`
