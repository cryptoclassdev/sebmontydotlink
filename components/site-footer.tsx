import Link from "next/link"

const externalLinks = [
  { label: "X", href: "https://x.com/SebMontgomery" },
  { label: "YouTube", href: "https://youtube.com/@SebMontgomery" },
  { label: "Telegram", href: "https://t.me/SebMontgomery" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sebastian-montgomery-3354a245/" },
]

// The one footer used on every page: homepage, blog, articles, search and Skill Files.
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell site-footer__inner">
        <div>
          <strong>Seb Montgomery</strong>
          <p>Research, products, and practical notes from crypto markets.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/blog">Blog</Link>
          <Link href="/skill-files">Skill Files</Link>
          {externalLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
          ))}
          <a href="mailto:support@sebmonty.link">Email</a>
        </nav>
      </div>
      <div className="site-shell site-footer__legal">
        <span>© {new Date().getFullYear()} Seb Montgomery</span>
        <span>Research, not financial advice.</span>
      </div>
    </footer>
  )
}
