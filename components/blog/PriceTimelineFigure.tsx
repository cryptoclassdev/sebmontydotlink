import { EditorialFigureFrame } from './EditorialFigureFrame'

export type TimelinePoint = {
  position: number
  value: number
  date: string
  label?: string
  accent?: 'default' | 'low'
}

export type PriceTimelineFigureProps = {
  eyebrow: string
  title: string
  source?: string
  sourceUrl?: string
  caption: string
  priceLabel: string
  navLabel: string
  maxValue: number
  price: readonly TimelinePoint[]
  nav: readonly TimelinePoint[]
  ariaLabel?: string
}

const chart = { width: 760, height: 280, left: 42, right: 18, top: 24, bottom: 38 }

function x(position: number) {
  return chart.left + position * (chart.width - chart.left - chart.right)
}

function y(value: number, maxValue: number) {
  return chart.top + (1 - value / maxValue) * (chart.height - chart.top - chart.bottom)
}

function line(points: readonly TimelinePoint[], maxValue: number) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(point.position)} ${y(point.value, maxValue)}`).join(' ')
}

function area(points: readonly TimelinePoint[], maxValue: number) {
  if (!points.length) return ''
  const base = chart.height - chart.bottom
  return `${line(points, maxValue)} L ${x(points[points.length - 1].position)} ${base} L ${x(points[0].position)} ${base} Z`
}

function annotationY(point: TimelinePoint, maxValue: number) {
  const pointY = y(point.value, maxValue)

  // Keep labels for a first-day high inside the chart instead of clipping them
  // against the top edge. All other labels sit just above their data point.
  return pointY < chart.top + 28 ? pointY + 22 : pointY - 12
}

export function PriceTimelineFigure({
  eyebrow,
  title,
  source,
  sourceUrl,
  caption,
  priceLabel,
  navLabel,
  maxValue,
  price,
  nav,
  ariaLabel,
}: PriceTimelineFigureProps) {
  const yTicks = [0, maxValue / 3, (maxValue / 3) * 2, maxValue]
  const lastPrice = price[price.length - 1]

  return (
    <EditorialFigureFrame
      className="article-price-timeline"
      eyebrow={eyebrow}
      title={title}
      source={source}
      sourceUrl={sourceUrl}
      caption={caption}
      ariaLabel={ariaLabel}
    >
      <div className="article-price-timeline__legend" aria-hidden="true">
        <span><i className="article-price-timeline__swatch article-price-timeline__swatch--price" />{priceLabel}</span>
        <span><i className="article-price-timeline__swatch article-price-timeline__swatch--nav" />{navLabel}</span>
      </div>
      <svg className="article-price-timeline__chart" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label={ariaLabel ?? `${title}. ${caption}`}>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={chart.left} x2={chart.width - chart.right} y1={y(tick, maxValue)} y2={y(tick, maxValue)} className="article-price-timeline__grid" />
            <text x={chart.left - 10} y={y(tick, maxValue) + 4} textAnchor="end" className="article-price-timeline__axis">${Math.round(tick)}</text>
          </g>
        ))}
        <path d={area(price, maxValue)} className="article-price-timeline__area" />
        <path d={line(price, maxValue)} className="article-price-timeline__price-line" />
        <path d={line(nav, maxValue)} className="article-price-timeline__nav-line" />
        {price.map((point, index) => (
          <g key={`${point.date}-${point.value}`}>
            <circle cx={x(point.position)} cy={y(point.value, maxValue)} r={index === price.length - 1 || point.accent === 'low' ? 5 : 3.5} className={point.accent === 'low' ? 'article-price-timeline__point article-price-timeline__point--low' : 'article-price-timeline__point'} />
            {(point.label || index === price.length - 1 || point.accent === 'low') && (
              <text x={x(point.position)} y={annotationY(point, maxValue)} textAnchor={point.position > .84 ? 'end' : point.position < .16 ? 'start' : 'middle'} className={point.accent === 'low' ? 'article-price-timeline__annotation article-price-timeline__annotation--low' : 'article-price-timeline__annotation'}>{point.label ?? `$${point.value.toFixed(2)}`}</text>
            )}
          </g>
        ))}
        {nav.map((point, index) => (
          <g key={`nav-${point.date}-${point.value}`}>
            <circle cx={x(point.position)} cy={y(point.value, maxValue)} r={3.5} className="article-price-timeline__nav-point" />
            {point.label && <text x={x(point.position)} y={y(point.value, maxValue) - 10} textAnchor={point.position > .84 ? 'end' : 'start'} className="article-price-timeline__nav-annotation">{point.label}</text>}
          </g>
        ))}
        {lastPrice && <text x={x(lastPrice.position)} y={y(lastPrice.value, maxValue) + 19} textAnchor="end" className="article-price-timeline__axis">{lastPrice.date}</text>}
      </svg>
    </EditorialFigureFrame>
  )
}
