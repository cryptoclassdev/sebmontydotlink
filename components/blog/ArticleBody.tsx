import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { ChevronDown } from 'lucide-react'

import { portableTextBlockText, type PreparedArticleContent, type PreparedImageBlock } from '@/lib/blog/article-content'
import type { PortableTextBlock } from '@/sanity/types'
import { ArticleImageTrigger } from './ArticleLightbox'
import { CopyCodeBlock } from './CopyCodeBlock'
import { MetricGridFigure, type MetricGridFigureProps } from './MetricGridFigure'
import { PremiumChartFigure, type PremiumChartFigureProps } from './PremiumChartFigure'
import { PriceTimelineFigure, type PriceTimelineFigureProps } from './PriceTimelineFigure'
import { SourceQuote } from './SourceQuote'
import { StackedBarFigure, type StackedBarFigureProps } from './StackedBarFigure'
import { StatStripFigure, type StatStripFigureProps } from './StatStripFigure'
import { TokenComparisonFigure, type TokenComparisonFigureProps } from './TokenComparisonFigure'
import { ValuationGrowthFigure, type ValuationGrowthFigureProps } from './ValuationGrowthFigure'
import { YouTubeEmbed } from './YouTubeEmbed'

const captionComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <>{children}</>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">{children}</a>
    ),
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
  },
}

function headingId(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function ArticleBody({ prepared }: { prepared: PreparedArticleContent }) {
  const components: PortableTextComponents = {
    types: {
      image: ({ value }) => {
        const block = value as PreparedImageBlock
        const index = prepared.imageIndexes[block._key]
        if (!block._articleImage || index === undefined) return null
        return (
          <figure className="article-figure">
            <ArticleImageTrigger image={block._articleImage} index={index} />
            {block._captionBlock && (
              <figcaption><PortableText value={[block._captionBlock]} components={captionComponents} /></figcaption>
            )}
            {!block._captionBlock && (block.caption || block.credit) && (
              <figcaption>
                {block.caption}
                {block.credit && block.creditUrl && <> <a href={block.creditUrl} target="_blank" rel="noopener noreferrer">{block.credit}</a></>}
                {block.credit && !block.creditUrl && <> {block.credit}</>}
              </figcaption>
            )}
          </figure>
        )
      },
      code: ({ value }) => <CopyCodeBlock code={value?.code || ''} language={value?.language || 'Token mint addresses'} />,
      metricGrid: ({ value }) => <MetricGridFigure {...(value as unknown as MetricGridFigureProps)} />,
      premiumChart: ({ value }) => <PremiumChartFigure {...(value as unknown as PremiumChartFigureProps)} />,
      priceTimeline: ({ value }) => <PriceTimelineFigure {...(value as unknown as PriceTimelineFigureProps)} />,
      sourceQuote: ({ value }) => <SourceQuote {...(value as PortableTextBlock)} />,
      stackedBar: ({ value }) => <StackedBarFigure {...(value as unknown as StackedBarFigureProps)} />,
      statStrip: ({ value }) => <StatStripFigure {...(value as unknown as StatStripFigureProps)} />,
      tokenComparison: ({ value }) => <TokenComparisonFigure {...(value as unknown as TokenComparisonFigureProps)} />,
      valuationGrowth: ({ value }) => <ValuationGrowthFigure {...(value as unknown as ValuationGrowthFigureProps)} />,
      youtube: ({ value }) => <YouTubeEmbed value={value as PortableTextBlock} />,
    },
    block: {
      h2: ({ children, value }) => {
        const block = value as unknown as import('@/sanity/types').PortableTextBlock
        const id = headingId(portableTextBlockText(block))
        return <h2 id={id}><a className="article-heading-anchor" href={`#${id}`} aria-label={`Link to ${portableTextBlockText(block)}`}>#</a>{children}</h2>
      },
      h3: ({ children, value }) => {
        const block = value as unknown as import('@/sanity/types').PortableTextBlock
        const id = headingId(portableTextBlockText(block))
        return <h3 id={id}><a className="article-heading-anchor" href={`#${id}`} aria-label={`Link to ${portableTextBlockText(block)}`}>#</a>{children}</h3>
      },
      h4: ({ children, value }) => {
        const block = value as unknown as import('@/sanity/types').PortableTextBlock
        const id = headingId(portableTextBlockText(block))
        return <h4 id={id}><a className="article-heading-anchor" href={`#${id}`} aria-label={`Link to ${portableTextBlockText(block)}`}>#</a>{children}</h4>
      },
      blockquote: ({ children }) => <blockquote>{children}</blockquote>,
      normal: ({ children }) => <p>{children}</p>,
    },
    marks: {
      link: ({ children, value }) => {
        const external = /^https?:\/\//i.test(value?.href || '')
        return <a href={value?.href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{children}</a>
      },
      strong: ({ children }) => <strong>{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      code: ({ children }) => <code className="article-inline-code">{children}</code>,
    },
    list: {
      bullet: ({ children }) => <ul className="article-list article-list--bullet">{children}</ul>,
      number: ({ children }) => <ol className="article-list article-list--number">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li>{children}</li>,
      number: ({ children }) => <li>{children}</li>,
    },
  }

  return (
    <>
      <div className="article-prose"><PortableText value={prepared.body} components={components} /></div>
      {prepared.sources.length > 0 && (
        <details className="article-sources" id="sources">
          <summary>
            <span>Sources</span>
            <span aria-hidden="true"><ChevronDown /></span>
          </summary>
          <div className="article-sources__content">
            <PortableText value={prepared.sources} components={components} />
          </div>
        </details>
      )}
    </>
  )
}
