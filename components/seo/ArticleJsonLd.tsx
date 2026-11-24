// Structured data for one article: BlogPosting (with the Sources list as citations),
// BreadcrumbList (Home > Blog > article) and, when the article asks two or more questions in its
// h2 headings, FAQPage built from those headings and the paragraphs under them.
// Google shows FAQ results only for a few government and health sites; the FAQ markup is for AI
// assistants and other search engines.
import { PERSON_ID, WEBSITE_ID } from '@/components/seo/SiteJsonLd'
import type { PreparedArticleContent } from '@/lib/blog/article-content'
import { citationsFromSources, faqFromBody, wordCount } from '@/lib/blog/structured-data'
import type { Post } from '@/lib/blog/types'
import { absoluteUrl, jsonLdString, postModifiedAt, postUrl, SITE_NAME, SITE_URL, type ShareImage } from '@/lib/seo'

type Props = {
  post: Post
  prepared: PreparedArticleContent
  description?: string
  image: ShareImage
}

export function ArticleJsonLd({ post, prepared, description, image }: Props) {
  const url = postUrl(post)
  const faq = faqFromBody(prepared.body)
  const citations = citationsFromSources(prepared.sources)
  const authorName = post.author?.name || SITE_NAME
  const author =
    authorName === SITE_NAME
      ? { '@type': 'Person', '@id': PERSON_ID, name: SITE_NAME, url: `${SITE_URL}/` }
      : { '@type': 'Person', name: authorName, ...(post.author?.xHandle ? { url: `https://x.com/${post.author.xHandle}` } : {}) }
  const images = [absoluteUrl(image.url), post.localMainImage?.src ? absoluteUrl(post.localMainImage.src) : null].filter(Boolean)

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: post.title,
      ...(description ? { description } : {}),
      image: images,
      ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
      ...(postModifiedAt(post) ? { dateModified: postModifiedAt(post) } : {}),
      author,
      publisher: { '@id': PERSON_ID },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      isPartOf: { '@id': WEBSITE_ID },
      inLanguage: 'en-GB',
      ...(post.category?.title ? { articleSection: post.category.title } : {}),
      wordCount: wordCount(prepared.body),
      isAccessibleForFree: true,
      ...(citations.length ? { citation: citations.map((source) => ({ '@type': 'CreativeWork', name: source.name, url: source.url })) } : {}),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ]

  if (faq.length >= 2) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faq.map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: { '@type': 'Answer', text: entry.answer },
      })),
    })
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString({ '@context': 'https://schema.org', '@graph': graph }) }} />
}
