"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpenText, FileText, Mail } from "lucide-react"
import { EmailSignupModal } from "./email-signup-modal"
import { TelegramIcon } from "./icons/telegram-icon"
import { XIcon } from "./icons/x-icon"
import { YoutubeIcon } from "./icons/youtube-icon"
import styles from "./link-tree.module.css"

interface LatestPost {
  title: string
  slug: string
  excerpt?: string
  publishedAt?: string
  imageUrl?: string | null
}

interface BentoGridProps {
  latestPost?: LatestPost | null
}

const projects = [
  {
    title: "validator.com",
    role: "Co-founder",
    description: "Stake your SOL with us.",
    href: "https://validator.com",
    image: "/validator-mockup.png",
  },
  {
    title: "thecommunication.link",
    role: "Founder",
    description: "Content and branding consultancy.",
    href: "https://thecommunication.link",
    image: "/communication-mockup.png",
  },
  {
    title: "Fogees Hub",
    role: "Co-founder",
    description: "Your educational Fogo chain hub.",
    href: "https://fogees.link",
    image: "/fogees-mockup.png",
  },
]

const recommendedTools = [
  {
    name: "Kast",
    note: "My personal card",
    href: "https://kastfinance.app.link/SEBMONTY",
    logo: "/kast-logo.png",
  },
  {
    name: "Backpack",
    note: "My favourite exchange",
    href: "https://backpack.exchange/join/sebmonty",
    logo: "/referral-logos/backpack-logo.png",
  },
  {
    name: "Infinex",
    note: "Super bullish",
    href: "https://app.infinex.xyz?r=JRPD7BF9",
    logo: "/infinex-logo.png",
  },
  {
    name: "Jupiter",
    note: "DEX",
    href: "https://jup.ag/?ref=gufymeueuc23",
    logo: "/referral-logos/jupiter-logo.png",
  },
  {
    name: "Paradex",
    note: "Perps",
    href: "https://app.paradex.trade/r/sebmonty",
    logo: "/referral-logos/paradex-logo.png",
  },
  {
    name: "FOGO Flames S2",
    note: "Community",
    href: "https://flames.fogo.io/season-2?af=sebmontgomery",
    logo: "/referral-logos/fogees-logo.jpeg",
  },
  {
    name: "Binance",
    note: "Exchange",
    href: "https://www.binance.com/en/activity/referral/offers/claim?ref=CPA_00R34Q8Y0Q",
    logo: "/referral-logos/binance-logo.png",
  },
  {
    name: "Bybit",
    note: "Exchange",
    href: "https://www.bybit.com/invite?ref=JAW8RO",
    logo: "/referral-logos/bybit-logo.png",
  },
]

function formatPublishedDate(value?: string) {
  if (!value) return "Latest"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Latest"

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export function BentoGrid({ latestPost }: BentoGridProps = {}) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const postHref = latestPost ? `/blog/${latestPost.slug}` : "/blog"

  return (
    <>
      <main id="main-content" className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.header}>
            <Link href="/" className={styles.wordmark} aria-label="Seb Montgomery home">
              <span className={styles.wordmarkDot} aria-hidden="true" />
              <span>Seb Montgomery</span>
            </Link>

            <nav className={styles.primaryNav} aria-label="Primary navigation">
              <Link href="/blog">Blog</Link>
              <Link href="/skill-files">Skill Files</Link>
              <button type="button" onClick={() => setIsEmailModalOpen(true)}>
                Subscribe
              </button>
            </nav>
          </header>

          <section className={styles.profileCard} aria-labelledby="profile-title">
            <div className={styles.portraitWrap}>
              <Image
                src="/images/design-mode/seb-new-dp_nkb9tp.png"
                alt="Seb Montgomery smiling at the camera"
                fill
                sizes="112px"
                className={styles.portrait}
                priority
              />
            </div>

            <p className={styles.eyebrow}>Crypto · Solana · AI</p>
            <h1 id="profile-title">Seb Montgomery</h1>
            <p className={styles.profileCopy}>
              Clear thinking on crypto, technology, and the tools I actually use.
            </p>

            <div className={styles.socialLinks} aria-label="Find Seb online">
              <a
                href="https://x.com/SebMontgomery"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.socialLink} ${styles.socialX}`}
                aria-label="Seb Montgomery on X"
              >
                <XIcon size={22} />
                <span>X</span>
              </a>
              <a
                href="https://youtube.com/@SebMontgomery"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.socialLink} ${styles.socialYoutube}`}
                aria-label="Seb Montgomery on YouTube"
              >
                <YoutubeIcon size={24} />
                <span>YouTube</span>
              </a>
              <a
                href="https://t.me/SebMontgomery"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.socialLink} ${styles.socialTelegram}`}
                aria-label="Seb Montgomery on Telegram"
              >
                <TelegramIcon size={22} />
                <span>Telegram</span>
              </a>
            </div>
          </section>

          <section className={styles.toolsSection} aria-labelledby="tools-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>Recommended links</p>
                <h2 id="tools-title">Tools I use</h2>
              </div>
              <span className={styles.affiliateBadge}>Affiliate links</span>
            </div>
            <p className={styles.disclosure}>
              Products I genuinely use or recommend. Some links may earn me a fee at no extra cost
              to you.
            </p>

            <div className={styles.toolsGrid}>
              {recommendedTools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.toolRow}
                >
                  <span className={styles.toolLogo}>
                    <Image src={tool.logo} alt={`${tool.name} logo`} width={42} height={42} />
                  </span>
                  <span className={styles.toolCopy}>
                    <strong>{tool.name}</strong>
                    <small>{tool.note}</small>
                  </span>
                  <span className={styles.rowArrow} aria-hidden="true">
                    <ArrowUpRight />
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section className={styles.destinationsSection} aria-labelledby="explore-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>Read &amp; download</p>
                <h2 id="explore-title">Explore</h2>
              </div>
            </div>

            <div className={styles.destinationGrid}>
              <article className={styles.blogPanel}>
                <div className={styles.blogHeader}>
                  <div className={styles.destinationLabel}>
                    <span className={styles.destinationIcon} aria-hidden="true">
                      <BookOpenText />
                    </span>
                    <div>
                      <p className={styles.eyebrow}>Writing &amp; research</p>
                      <h2>Blog</h2>
                    </div>
                  </div>
                  <Link href="/blog" className={styles.allPostsLink}>
                    All posts <ArrowRight aria-hidden="true" />
                  </Link>
                </div>

                <Link href={postHref} className={styles.latestPost}>
                  <div className={styles.latestPostCopy}>
                    <div className={styles.postMeta}>
                      <span>Latest blog post</span>
                      <time dateTime={latestPost?.publishedAt}>
                        {formatPublishedDate(latestPost?.publishedAt)}
                      </time>
                    </div>
                    <h3>
                      {latestPost?.title ?? "Independent thinking on crypto, markets, and products."}
                    </h3>
                    {latestPost?.excerpt && <p>{latestPost.excerpt}</p>}
                    <span className={styles.inlineAction}>
                      Read the post <ArrowRight aria-hidden="true" />
                    </span>
                  </div>
                  {latestPost?.imageUrl && (
                    <div className={styles.postImage}>
                      <Image
                        src={latestPost.imageUrl}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 112px, 180px"
                      />
                    </div>
                  )}
                </Link>
              </article>

              <Link href="/skill-files" className={styles.skillPanel}>
                <span className={styles.destinationIcon} aria-hidden="true">
                  <FileText />
                </span>
                <p className={styles.eyebrow}>Free resources</p>
                <h2>Skill Files</h2>
                <p>Practical AI workflows, systems, and working files.</p>
                <span className={styles.inlineAction}>
                  Open the library <ArrowRight aria-hidden="true" />
                </span>
              </Link>
            </div>
          </section>

          <section className={styles.projectsSection} aria-labelledby="projects-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>What I’m building</p>
                <h2 id="projects-title">Projects</h2>
              </div>
            </div>

            <div className={styles.projectList}>
              {projects.map((project) => (
                <a
                  key={project.title}
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.projectRow}
                >
                  <span className={styles.projectImage}>
                    <Image src={project.image} alt="" fill sizes="64px" />
                  </span>
                  <span className={styles.projectCopy}>
                    <span className={styles.projectTitleLine}>
                      <strong>{project.title}</strong>
                      <small>{project.role}</small>
                    </span>
                    <span>{project.description}</span>
                  </span>
                  <span className={styles.rowArrow} aria-hidden="true">
                    <ArrowUpRight />
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section className={styles.subscribeCard} aria-labelledby="subscribe-title">
            <div>
              <p className={styles.eyebrow}>Private group</p>
              <h2 id="subscribe-title">Get the useful stuff first.</h2>
              <p>Early research, practical insights, and selected opportunities.</p>
            </div>
            <button type="button" onClick={() => setIsEmailModalOpen(true)}>
              <Mail aria-hidden="true" />
              Join the waitlist
            </button>
          </section>

          <footer className={styles.footer}>
            <p>© {new Date().getFullYear()} Seb Montgomery</p>
            <nav aria-label="Footer navigation">
              <Link href="/blog">Blog</Link>
              <Link href="/skill-files">Skill Files</Link>
              <a href="mailto:support@sebmonty.link">Email</a>
            </nav>
          </footer>
        </div>
      </main>

      <EmailSignupModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </>
  )
}
