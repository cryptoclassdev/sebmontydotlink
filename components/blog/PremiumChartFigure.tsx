import type { CSSProperties } from 'react'

export type PremiumChartValue = {
  label: string
  value: number
  displayValue: string
}

export type PremiumChartNavPoint = PremiumChartValue & {
  dateLabel: string
  tone?: 'pitlane' | 'sebring'
}

export type PremiumChartFigureProps = {
  eyebrow: string
  source: string
  title: string
  sharePrice: PremiumChartValue
  bookValue: PremiumChartValue
  premium: PremiumChartValue
  multipleLabel: string
  navHistory: readonly PremiumChartNavPoint[]
  axisTicks?: readonly number[]
  caption: string
  ariaLabel?: string
}

type ChartStyle = CSSProperties & Record<`--${string}`, string>

function clampPercentage(value: number, maximum: number) {
  if (maximum <= 0) return '0%'
  return `${Math.min(Math.max((value / maximum) * 100, 0), 100)}%`
}

function formatAxisValue(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`
}

function valueStyle(value: number, maximum: number): ChartStyle {
  return {
    '--article-premium-chart-value': clampPercentage(value, maximum),
  }
}

function segmentStyle(value: number, total: number): ChartStyle {
  return {
    '--article-premium-chart-segment': clampPercentage(value, total),
  }
}

/**
 * An accessible, reusable exhibit for explaining a public share price's
 * premium to its reported net asset value. Visual styling lives in the
 * article-premium-chart CSS classes so colour always comes from the brand
 * token set rather than a chart-specific inline value.
 */
export function PremiumChartFigure({
  eyebrow,
  source,
  title,
  sharePrice,
  bookValue,
  premium,
  multipleLabel,
  navHistory,
  axisTicks = [0, 10, 20, 30, 40],
  caption,
  ariaLabel,
}: PremiumChartFigureProps) {
  const axisMaximum = Math.max(
    ...axisTicks,
    sharePrice.value,
    bookValue.value,
    premium.value,
    ...navHistory.map((point) => point.value),
  )
  const chartDescription = ariaLabel ?? [
    `${sharePrice.label} ${sharePrice.displayValue}`,
    `${bookValue.label} ${bookValue.displayValue}`,
    `${premium.label} ${premium.displayValue}`,
    multipleLabel,
    ...navHistory.map((point) => `${point.dateLabel} ${point.label} ${point.displayValue}`),
  ].join('. ')

  return (
    <figure className="article-premium-chart font-sans" aria-label={title}>
      <header className="article-premium-chart__header">
        <p className="article-premium-chart__eyebrow">{eyebrow}</p>
        <p className="article-premium-chart__source">{source}</p>
        <h3 className="article-premium-chart__title">{title}</h3>
      </header>

      <div className="article-premium-chart__visual" role="img" aria-label={chartDescription}>
        <div className="article-premium-chart__comparison" aria-hidden="true">
          <div className="article-premium-chart__axis">
            {axisTicks.map((tick) => (
              <span className="article-premium-chart__axis-tick" key={tick}>
                {formatAxisValue(tick)}
              </span>
            ))}
          </div>

          <div className="article-premium-chart__plot">
            {axisTicks.map((tick) => (
              <span
                className="article-premium-chart__grid-line"
                key={tick}
                style={valueStyle(tick, axisMaximum)}
              />
            ))}

            <div
              className="article-premium-chart__price-stack"
              style={valueStyle(sharePrice.value, axisMaximum)}
            >
              <span
                className="article-premium-chart__price-segment article-premium-chart__price-segment--book"
                style={segmentStyle(bookValue.value, sharePrice.value)}
              >
                <span>{bookValue.label}</span>
                <strong>{bookValue.displayValue}</strong>
              </span>
              <span
                className="article-premium-chart__price-segment article-premium-chart__price-segment--premium"
                style={segmentStyle(premium.value, sharePrice.value)}
              >
                <span>{premium.label}</span>
                <strong>{premium.displayValue}</strong>
              </span>
            </div>

            <p className="article-premium-chart__price-label">
              <strong>{sharePrice.displayValue}</strong>
              <span>{sharePrice.label.toLowerCase()}</span>
              <small>{multipleLabel}</small>
            </p>
          </div>
        </div>

        <section className="article-premium-chart__trend" aria-hidden="true">
          <p>NAV per share is rising</p>
          <div className="article-premium-chart__trend-bars">
            {navHistory.map((point, index) => (
              <div className="article-premium-chart__trend-point" key={`${point.dateLabel}-${point.value}`}>
                <span
                  className={`article-premium-chart__trend-bar article-premium-chart__trend-bar--${point.tone ?? (index === navHistory.length - 1 ? 'sebring' : 'pitlane')}`}
                  style={valueStyle(point.value, axisMaximum)}
                />
                <strong>{point.displayValue}</strong>
                <span>{point.dateLabel}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Measure</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">{sharePrice.label}</th>
            <td>{sharePrice.displayValue}</td>
          </tr>
          <tr>
            <th scope="row">{bookValue.label}</th>
            <td>{bookValue.displayValue}</td>
          </tr>
          <tr>
            <th scope="row">{premium.label}</th>
            <td>{premium.displayValue}</td>
          </tr>
          {navHistory.map((point) => (
            <tr key={`${point.dateLabel}-${point.value}`}>
              <th scope="row">{point.label} on {point.dateLabel}</th>
              <td>{point.displayValue}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <figcaption>{caption}</figcaption>
    </figure>
  )
}

export const robostrategyPremiumChart: PremiumChartFigureProps = {
  eyebrow: 'Exhibit 1 · The premium',
  source: 'Source: RoboStrategy NAV update, Jun 30 2026 · Nasdaq close, Jul 7 2026',
  title: 'Of the $31.91 you pay, $10.51 is book. The rest is the bet.',
  sharePrice: {
    label: 'Share price',
    value: 31.91,
    displayValue: '$31.91',
  },
  bookValue: {
    label: 'NAV',
    value: 10.51,
    displayValue: '$10.51',
  },
  premium: {
    label: 'Premium',
    value: 21.4,
    displayValue: '$21.40',
  },
  multipleLabel: '≈ 3× book',
  navHistory: [
    {
      label: 'NAV per share',
      dateLabel: 'May 31',
      value: 7.24,
      displayValue: '$7.24',
      tone: 'pitlane',
    },
    {
      label: 'NAV per share',
      dateLabel: 'Jun 30',
      value: 10.51,
      displayValue: '$10.51',
      tone: 'sebring',
    },
  ],
  caption: 'You are paying roughly 3× the fund’s own accounting of its assets. The premium is the market’s bet that the underlying private holdings keep compounding.',
  ariaLabel: 'Premium-to-NAV exhibit. RoboStrategy shares traded at 31 dollars 91 cents on July 7, 2026. The fund reported net asset value of 10 dollars 51 cents per share, leaving a 21 dollar 40 cent premium, or roughly 3 times book value. NAV per share rose from 7 dollars 24 cents on May 31 to 10 dollars 51 cents on June 30.',
}
