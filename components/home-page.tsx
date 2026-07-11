import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, BookOpen, Mail } from "lucide-react"

import { SubscribeCTA } from "@/components/blog"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export type HomeFeaturedPost = {
  title: string
  slug: string
  excerpt: string
  category: string
  readTime: number
  date: string
  imageUrl: string
}

const projects = [
  {
    name: "validator.com",
    role: "Co-founder",
    description: "Clear staking infrastructure and education for Solana.",
    href: "https://validator.com",
    image: "/validator-mockup.png",
    tone: "light",
  },
  {
    name: "thecommunication.link",
    role: "Founder",
    description: "Content and brand strategy for ambitious internet companies.",
    href: "https://thecommunication.link",
    image: "/communication-mockup.png",
    tone: "dark",
  },
  {
    name: "Fogees Hub",
    role: "Co-founder",
    description: "An educational home for the Fogo ecosystem.",
    href: "https://fogees.link",
    image: "/fogees-mockup.png",
    tone: "dark",
  },
]

const trustedLinks = [
  { name: "Kast", note: "My personal card", href: "https://kastfinance.app.link/SEBMONTY", logo: "/kast-logo.png" },
  { name: "Backpack", note: "Favourite exchange", href: "https://backpack.exchange/join/sebmonty", logo: "/referral-logos/backpack-logo.png" },
  { name: "Infinex", note: "Onchain account", href: "https://app.infinex.xyz?r=JRPD7BF9", logo: "/infinex-logo.png" },
  { name: "Jupiter", note: "Solana DEX", href: "https://jup.ag/?ref=gufymeueuc23", logo: "/referral-logos/jupiter-logo.png" },
  { name: "Paradex", note: "Perpetuals", href: "https://app.paradex.trade/r/sebmonty", logo: "/referral-logos/paradex-logo.png" },
  { name: "Binance", note: "Exchange", href: "https://www.binance.com/en/activity/referral/offers/claim?ref=CPA_00R34Q8Y0Q", logo: "/referral-logos/binance-logo.png" },
]

export function HomePage({ featuredPost }: { featuredPost: HomeFeaturedPost }) {
  return (
    <div className="site-page">
      <SiteHeader current="home" />
      <main id="main-content">
        <section className="site-shell home-hero">
          <div className="home-hero__copy">
            <span className="site-eyebrow">Crypto · Markets · Products</span>
            <h1>Clarity for markets moving too fast.</h1>
            <p>I research the assets, companies, and products reshaping finance—then explain what matters without the noise.</p>
            <div className="home-hero__actions">
              <Link className="site-button" href={`/blog/${featuredPost.slug}`}>
                <BookOpen aria-hidden="true" /> Read latest research
              </Link>
              <Link className="site-button site-button--quiet" href="#work">Explore my work</Link>
            </div>
            <div className="home-hero__social">
              <span>Follow</span>
              <a href="https://x.com/SebMontgomery" target="_blank" rel="noopener noreferrer">X</a>
              <a href="https://youtube.com/@SebMontgomery" target="_blank" rel="noopener noreferrer">YouTube</a>
              <a href="https://t.me/SebMontgomery" target="_blank" rel="noopener noreferrer">Telegram</a>
            </div>
          </div>

          <figure className="home-portrait">
            <Image src="/images/design-mode/seb-new-dp_nkb9tp.png" alt="Seb Montgomery" fill priority sizes="(min-width: 900px) 38vw, calc(100vw - 40px)" className="object-cover object-top" />
            <figcaption>
              <span>Founder, operator, researcher</span>
              <strong>Seb Montgomery</strong>
            </figcaption>
          </figure>
        </section>

        <section className="home-featured" aria-labelledby="featured-research-title">
          <div className="site-shell">
            <div className="site-section-heading">
              <div>
                <span className="site-eyebrow">Featured research</span>
                <h2 id="featured-research-title">The useful part, properly sourced.</h2>
              </div>
              <Link href="/blog">All writing <span aria-hidden="true">→</span></Link>
            </div>

            <Link className="home-featured__card" href={`/blog/${featuredPost.slug}`}>
              <div className="home-featured__image">
                <Image src={featuredPost.imageUrl} alt="" fill sizes="(min-width: 900px) 50vw, calc(100vw - 40px)" className="object-cover" />
              </div>
              <div className="home-featured__copy">
                <span className="home-featured__meta">{featuredPost.category} · {featuredPost.readTime} min read</span>
                <h3>{featuredPost.title}</h3>
                <p>{featuredPost.excerpt}</p>
                <span className="home-featured__link">Read the full piece <ArrowUpRight aria-hidden="true" /></span>
              </div>
            </Link>
          </div>
        </section>

        <section className="site-shell home-work" id="work" aria-labelledby="work-title">
          <div className="site-section-heading">
            <div>
              <span className="site-eyebrow">Selected work</span>
              <h2 id="work-title">Things I am building.</h2>
            </div>
          </div>
          <div className="home-projects">
            {projects.map((project) => (
              <a className={`home-project home-project--${project.tone}`} key={project.name} href={project.href} target="_blank" rel="noopener noreferrer">
                <div>
                  <span>{project.role}</span>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                </div>
                <div className="home-project__image">
                  <Image src={project.image} alt="" fill sizes="(min-width: 900px) 30vw, calc(100vw - 40px)" className="object-cover object-top" />
                </div>
                <ArrowUpRight className="home-project__arrow" aria-hidden="true" />
              </a>
            ))}
          </div>
        </section>

        <section className="home-links" aria-labelledby="links-title">
          <div className="site-shell">
            <div className="site-section-heading">
              <div>
                <span className="site-eyebrow">Tools and platforms</span>
                <h2 id="links-title">What I actually use.</h2>
              </div>
              <p>Some links are referrals. I only list products I use or actively follow.</p>
            </div>
            <div className="home-links__grid">
              {trustedLinks.map((link) => (
                <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer">
                  <Image src={link.logo} alt="" width={42} height={42} />
                  <span><strong>{link.name}</strong><small>{link.note}</small></span>
                  <ArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="home-newsletter" id="newsletter" aria-labelledby="home-newsletter-title">
          <div className="site-shell home-newsletter__inner">
            <div>
              <Mail aria-hidden="true" />
              <span className="site-eyebrow">New research</span>
              <h2 id="home-newsletter-title">One useful email when there is something worth saying.</h2>
            </div>
            <SubscribeCTA publicationName="Seb Montgomery" description="New research and practical notes. No daily noise." variant="card" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
