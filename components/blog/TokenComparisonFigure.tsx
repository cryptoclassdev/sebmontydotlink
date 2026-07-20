import { Check } from 'lucide-react'

type TokenMetric = { label: string; value: string; tone?: 'default' | 'gauge' | 'marigold' | 'redline' }

export type TokenComparisonFigureProps = {
  eyebrow: string
  title: string
  dateLabel: string
  caption: string
  primary: { name: string; issuer: string; status: string; metrics: readonly TokenMetric[] }
  comparison: { name: string; issuer: string; status: string; metrics: readonly TokenMetric[] }
  ariaLabel?: string
}

function TokenRow({ token, primary }: { token: TokenComparisonFigureProps['primary']; primary?: boolean }) {
  return (
    <section className={`article-token-comparison__row${primary ? ' article-token-comparison__row--primary' : ''}`}>
      <header>
        <div>
          <h4>{token.name} {primary ? <Check aria-label="Verified token" /> : null}</h4>
          <p>{token.issuer}</p>
        </div>
        <p>{token.status}</p>
      </header>
      <dl>
        {token.metrics.map((metric) => (
          <div key={metric.label} className={`article-token-comparison__metric article-token-comparison__metric--${metric.tone ?? 'default'}`}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function TokenComparisonFigure({ eyebrow, title, dateLabel, caption, primary, comparison, ariaLabel }: TokenComparisonFigureProps) {
  return (
    <figure className="article-token-comparison" aria-label={ariaLabel ?? `${title}. ${caption}`}>
      <header className="article-token-comparison__header"><div><p>{eyebrow}</p><h3>{title}</h3></div><time>{dateLabel}</time></header>
      <TokenRow token={primary} primary />
      <TokenRow token={comparison} />
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
