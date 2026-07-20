export type MetricGridTone = 'gauge' | 'sebring' | 'neutral'

export type MetricGridItem = {
  label: string
  value: string
  detail: string
  tone?: MetricGridTone
}

export type MetricGridItems = readonly [
  MetricGridItem,
  MetricGridItem,
  MetricGridItem,
  MetricGridItem,
]

export type MetricGridFigureProps = {
  eyebrow: string
  title: string
  dateLabel: string
  dateTime?: string
  metrics: MetricGridItems
  caption: string
  ariaLabel?: string
}

const toneClasses: Record<MetricGridTone, string> = {
  gauge: 'article-metric-grid__item--gauge',
  sebring: 'article-metric-grid__item--sebring',
  neutral: 'article-metric-grid__item--neutral',
}

export function MetricGridFigure({
  eyebrow,
  title,
  dateLabel,
  dateTime,
  metrics,
  caption,
  ariaLabel,
}: MetricGridFigureProps) {
  const figureLabel = ariaLabel ?? [
    title,
    dateLabel,
    ...metrics.map((metric) => `${metric.label}: ${metric.value}`),
  ].join('. ')

  return (
    <figure className="article-metric-grid" aria-label={figureLabel}>
      <header className="article-metric-grid__header">
        <div>
          <p className="article-metric-grid__eyebrow">{eyebrow}</p>
          <h3 className="article-metric-grid__title">{title}</h3>
        </div>
        <time className="article-metric-grid__date" dateTime={dateTime}>{dateLabel}</time>
      </header>

      <dl className="article-metric-grid__items">
        {metrics.map((metric) => (
          <div
            className={`article-metric-grid__item ${toneClasses[metric.tone ?? 'neutral']}`}
            key={metric.label}
          >
            <dt>{metric.label}</dt>
            <dd className="article-metric-grid__value">{metric.value}</dd>
            <dd className="article-metric-grid__detail">{metric.detail}</dd>
          </div>
        ))}
      </dl>

      <figcaption>{caption}</figcaption>
    </figure>
  )
}
