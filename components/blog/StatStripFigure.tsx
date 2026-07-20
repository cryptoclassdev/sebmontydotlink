export type StatStripMetric = {
  label: string
  value: string
  detail: string
  tone?: 'ink' | 'marigold' | 'redline' | 'gauge'
}

export type StatStripFigureProps = {
  eyebrow: string
  title: string
  dateLabel?: string
  metrics: readonly StatStripMetric[]
  caption: string
  ariaLabel?: string
}

export function StatStripFigure({ eyebrow, title, dateLabel, metrics, caption, ariaLabel }: StatStripFigureProps) {
  return (
    <figure className="article-stat-strip" aria-label={ariaLabel ?? `${title}. ${caption}`}>
      <header>
        <div><p>{eyebrow}</p><h3>{title}</h3></div>
        {dateLabel && <span>{dateLabel}</span>}
      </header>
      <dl>
        {metrics.map((metric) => (
          <div key={metric.label} className={`article-stat-strip__metric article-stat-strip__metric--${metric.tone ?? 'ink'}`}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
            <dd>{metric.detail}</dd>
          </div>
        ))}
      </dl>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
