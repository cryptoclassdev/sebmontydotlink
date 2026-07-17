import { ExternalLink, Quote } from 'lucide-react'

import type { PortableTextBlock } from '@/sanity/types'

type SourceQuoteProps = Pick<
  PortableTextBlock,
  '_key' | 'eyebrow' | 'quote' | 'sourceTitle' | 'sourceDetail' | 'sourceUrl'
>

export function SourceQuote({
  _key,
  eyebrow = 'Quoted source',
  quote,
  sourceTitle,
  sourceDetail,
  sourceUrl,
}: SourceQuoteProps) {
  if (!quote || !sourceTitle || !sourceUrl) return null

  const figureId = `source-quote-${_key}`
  const captionId = `${figureId}-source`

  return (
    <figure className="article-source-quote" id={figureId} aria-describedby={captionId}>
      <div className="article-source-quote__heading">
        <span className="article-source-quote__mark" aria-hidden="true"><Quote /></span>
        <span>{eyebrow}</span>
      </div>
      <blockquote>
        <p>“{quote}”</p>
      </blockquote>
      <figcaption id={captionId}>
        <span className="article-source-quote__source-label">Source</span>
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
          <span>{sourceTitle}</span>
          <ExternalLink aria-hidden="true" />
        </a>
        {sourceDetail && <span className="article-source-quote__detail">{sourceDetail}</span>}
      </figcaption>
    </figure>
  )
}
