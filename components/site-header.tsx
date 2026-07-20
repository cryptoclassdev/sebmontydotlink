import Link from "next/link"
import { Search } from "lucide-react"

type SiteHeaderProps = {
  current?: "home" | "writing"
}

export function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-shell site-header__inner">
        <Link className="site-brand" href="/" aria-label="Seb Montgomery home">
          <span className="site-brand__mark" aria-hidden="true">SM</span>
          <span className="site-brand__copy">
            <strong>Seb Montgomery</strong>
            <small>Independent research</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          <Link className={current === "home" ? "is-active" : undefined} href="/" aria-current={current === "home" ? "page" : undefined}>Home</Link>
          <Link className={current === "writing" ? "is-active" : undefined} href="/blog" aria-current={current === "writing" ? "page" : undefined}>Writing</Link>
          <Link href="/#work">Work</Link>
        </nav>

        <div className="site-header__actions">
          <Link className="site-icon-button" href="/blog/search" aria-label="Search the publication">
            <Search aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  )
}
