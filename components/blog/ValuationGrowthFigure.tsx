import { EditorialFigureFrame } from './EditorialFigureFrame'

export type ValuationGrowthRow = {
  name: string
  earlierValue?: number
  earlierLabel?: string
  latestValue: number
  latestLabel: string
  note: string
}

export type ValuationGrowthFigureProps = {
  eyebrow: string
  title: string
  source?: string
  sourceUrl?: string
  caption: string
  rows: readonly ValuationGrowthRow[]
  maxValue: number
  ariaLabel?: string
}

function width(value: number, max: number) {
  return `${Math.max(4, (value / max) * 100)}%`
}

export function ValuationGrowthFigure({
  eyebrow,
  title,
  source,
  sourceUrl,
  caption,
  rows,
  maxValue,
  ariaLabel,
}: ValuationGrowthFigureProps) {
  return (
    <EditorialFigureFrame
      className="article-valuation-growth"
      eyebrow={eyebrow}
      title={title}
      source={source}
      sourceUrl={sourceUrl}
      caption={caption}
      ariaLabel={ariaLabel}
    >
      <div className="article-valuation-growth__legend" aria-hidden="true">
        <span><i className="article-valuation-growth__swatch article-valuation-growth__swatch--earlier" />Earlier round</span>
        <span><i className="article-valuation-growth__swatch article-valuation-growth__swatch--latest" />Latest round</span>
      </div>
      <ul className="article-valuation-growth__rows">
        {rows.map((row) => (
          <li key={row.name}>
            <div className="article-valuation-growth__row-heading">
              <strong>{row.name}</strong>
              <span>{row.note}</span>
            </div>
            <div className="article-valuation-growth__track" aria-label={`${row.name}: ${row.latestLabel}. ${row.note}`}>
              <span
                aria-hidden="true"
                className={`article-valuation-growth__bar article-valuation-growth__bar--latest${row.latestValue / maxValue < .24 ? ' article-valuation-growth__bar--compact' : ''}`}
                style={{ width: width(row.latestValue, maxValue) }}
              >
                <b>{row.latestLabel}</b>
              </span>
              {row.earlierValue && (
                <span
                  aria-hidden="true"
                  className="article-valuation-growth__bar article-valuation-growth__bar--earlier"
                  style={{ width: width(row.earlierValue, maxValue) }}
                >
                  <b>{row.earlierLabel}</b>
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </EditorialFigureFrame>
  )
}
