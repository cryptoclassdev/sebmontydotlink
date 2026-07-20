import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'

type EditorialFigureFrameProps = {
  className: string
  eyebrow: string
  title: string
  source?: string
  sourceUrl?: string
  caption: string
  children: ReactNode
  ariaLabel?: string
}

export function EditorialFigureFrame({
  className,
  eyebrow,
  title,
  source,
  sourceUrl,
  caption,
  children,
  ariaLabel,
}: EditorialFigureFrameProps) {
  return (
    <figure className={`article-data-figure ${className}`} aria-label={ariaLabel ?? `${title}. ${caption}`}>
      <header className="article-data-figure__header">
        <div>
          <p className="article-data-figure__eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        {source && (
          sourceUrl ? (
            <a className="article-data-figure__source" href={sourceUrl} target="_blank" rel="noopener noreferrer">
              <span>{source}</span><ExternalLink aria-hidden="true" />
            </a>
          ) : <p className="article-data-figure__source">{source}</p>
        )}
      </header>
      <div className="article-data-figure__body">{children}</div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
