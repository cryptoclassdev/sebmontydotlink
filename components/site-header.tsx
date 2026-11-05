import Image from "next/image"
import Link from "next/link"
import { Search } from "lucide-react"

type SiteHeaderProps = {
  /** The section the page belongs to; its nav link is underlined. */
  current?: "home" | "blog" | "skills"
}

// The one header used on every page: homepage, blog, articles, search and Skill Files.
export function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-shell site-header__inner">
        <Link className="site-brand" href="/" aria-label="Seb Montgomery home" aria-current={current === "home" ? "page" : undefined}>
          <span className="site-brand__mark" aria-hidden="true">
            <Image src="/images/brand/seb-avatar.png" alt="" width={40} height={40} priority />
          </span>
          <span className="site-brand__copy">
            <strong>Seb Montgomery</strong>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          <Link className={current === "blog" ? "is-active" : undefined} href="/blog" aria-current={current === "blog" ? "page" : undefined}>Blog</Link>
          <Link className={current === "skills" ? "is-active" : undefined} href="/skill-files" aria-current={current === "skills" ? "page" : undefined}>Skill Files</Link>
        </nav>

        <div className="site-header__actions">
          <Link className="site-icon-button" href="/blog/search" aria-label="Search the blog">
            <Search aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  )
}
