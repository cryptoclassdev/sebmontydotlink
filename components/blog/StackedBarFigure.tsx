import type { CSSProperties } from 'react'

export type StackedBarTone = 'gauge' | 'sebring' | 'redline' | 'gray-2' | 'gray-3' | 'gray-5'

export type StackedBarSegment = {
  name: string
  value: number
  displayValue?: string
  tone: StackedBarTone
}

export type StackedBarFigureProps = {
  eyebrow: string
  title: string
  dateLabel: string
  dateTime?: string
  segments: readonly StackedBarSegment[]
  highlight?: {
    value: string
    label: string
  }
  caption: string
  ariaLabel?: string
}

const toneClasses: Record<StackedBarTone, string> = {
  gauge: 'article-stacked-bar__segment--gauge',
  sebring: 'article-stacked-bar__segment--sebring',
  redline: 'article-stacked-bar__segment--redline',
  'gray-2': 'article-stacked-bar__segment--gray-2',
  'gray-3': 'article-stacked-bar__segment--gray-3',
  'gray-5': 'article-stacked-bar__segment--gray-5',
}

function segmentValue(segment: StackedBarSegment) {
  return segment.displayValue ?? `${segment.value}%`
}

export function StackedBarFigure({
  eyebrow,
  title,
  dateLabel,
  dateTime,
  segments,
  highlight,
  caption,
  ariaLabel,
}: StackedBarFigureProps) {
  const chartLabel = ariaLabel ?? [
    title,
    ...segments.map((segment) => `${segment.name}: ${segmentValue(segment)}`),
  ].join('. ')

  return (
    <figure className="article-stacked-bar">
      <div className="article-stacked-bar__header">
        <div>
          <p className="article-stacked-bar__eyebrow">{eyebrow}</p>
          <h3 className="article-stacked-bar__title">{title}</h3>
        </div>
        <time className="article-stacked-bar__date" dateTime={dateTime}>{dateLabel}</time>
      </div>

      {highlight && (
        <p className="article-stacked-bar__highlight">
          <strong>{highlight.value}</strong>
          <span>{highlight.label}</span>
        </p>
      )}

      <div className="article-stacked-bar__plot" role="img" aria-label={chartLabel}>
        {segments.map((segment) => (
          <span
            aria-hidden="true"
            className={`article-stacked-bar__segment ${toneClasses[segment.tone]}`}
            key={`${segment.name}-${segment.value}`}
            style={{ flexBasis: 0, flexGrow: segment.value } as CSSProperties}
          />
        ))}
      </div>

      <ul className="article-stacked-bar__legend" aria-label={`${title} values`}>
        {segments.map((segment) => (
          <li key={`${segment.name}-${segment.value}`}>
            <span
              aria-hidden="true"
              className={`article-stacked-bar__swatch ${toneClasses[segment.tone]}`}
            />
            <span className="article-stacked-bar__name">{segment.name}</span>
            <strong className="article-stacked-bar__value">{segmentValue(segment)}</strong>
          </li>
        ))}
      </ul>

      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export const robostrategyPortfolioWeights: StackedBarFigureProps = {
  eyebrow: 'Portfolio weights',
  title: 'Where the fund was concentrated',
  dateLabel: 'June 22, 2026',
  dateTime: '2026-06-22',
  highlight: {
    value: '38.8%',
    label: 'held in Figure AI and Dyna',
  },
  segments: [
    { name: 'Figure AI', value: 19.4, displayValue: '19.4%', tone: 'gauge' },
    { name: 'Dyna', value: 19.4, displayValue: '19.4%', tone: 'sebring' },
    { name: 'Apptronik', value: 10.2, displayValue: '10.2%', tone: 'redline' },
    { name: 'Dexmate', value: 6, displayValue: '~6%', tone: 'gray-3' },
    { name: 'Smaller names', value: 45, displayValue: '~45%', tone: 'gray-5' },
  ],
  caption: 'Portfolio weights as reported on June 22, 2026. Figures are approximate.',
}
