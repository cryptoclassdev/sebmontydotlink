import Link from "next/link"

const socialLinks = [
  { label: "X", href: "https://x.com/SebMontgomery" },
  { label: "YouTube", href: "https://youtube.com/@SebMontgomery" },
  { label: "Telegram", href: "https://t.me/SebMontgomery" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sebastian-montgomery-3354a245/" },
]

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell site-footer__inner">
        <div>
          <strong>Seb Montgomery</strong>
          <p>Research, products, and practical notes from crypto markets.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/blog">Writing</Link>
          <Link href="/#work">Work</Link>
          {socialLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
          ))}
        </nav>
      </div>
      <div className="site-shell site-footer__legal">
        <span>© {new Date().getFullYear()} Seb Montgomery</span>
        <span>Research, not financial advice.</span>
      </div>
    </footer>
  )
}
