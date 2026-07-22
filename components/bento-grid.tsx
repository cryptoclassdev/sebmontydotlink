import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpenText, FileText } from "lucide-react"
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

const referralLinks = [
  {
    name: "Kast",
    category: "Crypto card",
    value: "The crypto card I use personally.",
    action: "Open Kast",
    href: "https://app.kast.xyz/referral/SEBMONTY",
    logo: "/kast-logo.png",
    featured: true,
  },
  {
    name: "Backpack",
    category: "Crypto exchange",
    value: "My favourite exchange for trading crypto.",
    action: "Join Backpack",
    href: "https://backpack.exchange/join/sebmonty",
    logo: "/referral-logos/backpack-logo.png",
    featured: true,
  },
  {
    name: "Meteora",
    category: "Solana liquidity",
    value: "Explore Solana liquidity pools and vaults.",
    action: "Open Meteora",
    href: "https://app.meteora.ag/ref/SEBMONTY",
    logo: "/referral-logos/meteora-logo.svg",
    featured: true,
  },
  {
    name: "JTX",
    category: "Solana trading",
    value: "Get early access to the trading experience from Jito.",
    action: "Join JTX",
    href: "https://jtx.com/ref/SEBMONTY",
    logo: "/referral-logos/jtx-logo.svg",
  },
  {
    name: "Bybit",
    category: "Crypto exchange",
    value: "Open my Bybit invitation link.",
    action: "Join Bybit",
    href: "https://www.bybit.com/invite?ref=JAW8RO",
    logo: "/referral-logos/bybit-logo.png",
  },
  {
    name: "Binance",
    category: "Crypto exchange",
    value: "View the Binance referral offer.",
    action: "View the offer",
    href: "https://www.binance.com/en/activity/referral/offers/claim?ref=CPA_00R34Q8Y0Q",
    logo: "/referral-logos/binance-logo.png",
  },
  {
    name: "Jupiter",
    category: "Solana DEX",
    value: "Swap tokens through Jupiter.",
    action: "Open Jupiter",
    href: "https://jup.ag/?ref=gufymeueuc23",
    logo: "/referral-logos/jupiter-logo.png",
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

function ReferralCard({ referral, compact = false }: { referral: (typeof referralLinks)[number]; compact?: boolean }) {
  return (
    <a
      href={referral.href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={compact ? styles.referralCardCompact : styles.referralCardFeatured}
    >
      <span className={styles.referralCardTop}>
        <span className={styles.referralLogo}>
          <Image src={referral.logo} alt="" width={52} height={52} />
        </span>
        <span className={styles.referralReceipt}>Referral link</span>
      </span>
      <span className={styles.referralCategory}>{referral.category}</span>
      <strong>{referral.name}</strong>
      <span className={styles.referralValue}>{referral.value}</span>
      <span className={styles.referralAction}>
        {referral.action}
        <ArrowUpRight aria-hidden="true" />
      </span>
      <span className={styles.srOnly}>Opens in a new tab.</span>
    </a>
  )
}

export function BentoGrid({ latestPost }: BentoGridProps = {}) {
  const postHref = latestPost ? `/blog/${latestPost.slug}` : "/blog"
  const featuredReferrals = referralLinks.filter((referral) => referral.featured)
  const directoryReferrals = referralLinks.filter((referral) => !referral.featured)

  return (
    <main id="main-content" className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.wordmark} aria-label="Seb Montgomery home">
            <span className={styles.wordmarkPortrait} aria-hidden="true">
              <Image src="/images/brand/seb-avatar.png" alt="" width={34} height={34} priority />
            </span>
            <span>Seb Montgomery</span>
          </Link>

          <nav className={styles.primaryNav} aria-label="Primary navigation">
            <Link href="/blog">Blog</Link>
            <Link href="/skill-files">Skill Files</Link>
          </nav>
        </header>

        <div className={styles.heroBento}>
          <section className={styles.heroCard} aria-labelledby="profile-title">
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Crypto · Solana · AI</p>
              <h1 id="profile-title">Connect the dots.</h1>
              <p className={styles.heroLede}>
                Clear, warm research from the friend who already read the whitepaper.
              </p>
              <Link href="/blog" className={styles.primaryAction}>
                Read my research <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            <figure className={styles.polaroid}>
              <div className={styles.portraitMedia}>
                <Image
                  src="/images/design-mode/seb-new-dp_nkb9tp.png"
                  alt="Seb Montgomery smiling at the camera"
                  width={2000}
                  height={2800}
                  sizes="(max-width: 680px) 58vw, 290px"
                  priority
                />
              </div>
              <figcaption>SEB</figcaption>
            </figure>

            <svg className={styles.markerThread} viewBox="0 0 320 28" aria-hidden="true">
              <path d="M5 18C73 5 141 24 210 12C250 5 281 8 315 4" />
            </svg>
          </section>

          <section className={styles.socialCard} aria-labelledby="social-title">
            <div>
              <p className={styles.eyebrow}>Find me online</p>
              <h2 id="social-title">Watch, read, ask.</h2>
            </div>

            <nav className={styles.socialNav} aria-label="Seb Montgomery on social media">
              <a
                href="https://x.com/SebMontgomery"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.xProfileLink}
              >
                <span className={styles.xProfileAvatar}>
                  <Image src="/images/brand/seb-avatar.png" alt="" width={64} height={64} />
                </span>
                <span className={styles.xProfileCopy}>
                  <small>Daily notes on X</small>
                  <strong>@SebMontgomery</strong>
                </span>
                <span className={styles.socialIcon} aria-hidden="true">
                  <XIcon size={21} />
                </span>
                <span className={styles.srOnly}>Opens in a new tab.</span>
              </a>

              <div className={styles.socialSecondary}>
                <a
                  href="https://youtube.com/@SebMontgomery"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <YoutubeIcon size={22} />
                  <span>
                    <small>Long-form</small>
                    <strong>YouTube</strong>
                  </span>
                  <ArrowUpRight aria-hidden="true" />
                  <span className={styles.srOnly}>Opens in a new tab.</span>
                </a>
                <a
                  href="https://t.me/SebMontgomery"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TelegramIcon size={21} />
                  <span>
                    <small>Message me</small>
                    <strong>Telegram</strong>
                  </span>
                  <ArrowUpRight aria-hidden="true" />
                  <span className={styles.srOnly}>Opens in a new tab.</span>
                </a>
              </div>
            </nav>
          </section>

          <article className={styles.latestCard}>
            <div className={styles.latestCardHeader}>
              <span className={styles.latestCardIcon} aria-hidden="true">
                <BookOpenText />
              </span>
              <div>
                <p className={styles.eyebrow}>Latest research</p>
                <h2>From the blog</h2>
              </div>
              <Link href="/blog" className={styles.allPostsLink}>
                All posts <ArrowRight aria-hidden="true" />
              </Link>
            </div>

            <Link href={postHref} className={styles.latestPostLink}>
              <span className={styles.latestPostCopy}>
                <time dateTime={latestPost?.publishedAt}>{formatPublishedDate(latestPost?.publishedAt)}</time>
                <strong>
                  {latestPost?.title ?? "Independent thinking on crypto, markets, and products."}
                </strong>
                {latestPost?.excerpt && <span>{latestPost.excerpt}</span>}
                <span className={styles.inlineAction}>
                  Read the post <ArrowRight aria-hidden="true" />
                </span>
              </span>
              {latestPost?.imageUrl && (
                <span className={styles.postImage}>
                  <Image
                    src={latestPost.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 680px) 34vw, 190px"
                  />
                </span>
              )}
            </Link>
          </article>
        </div>

        <section className={styles.referralsSection} aria-labelledby="referrals-title">
          <div className={styles.referralsHeading}>
            <div>
              <p className={styles.eyebrow}>Referral directory</p>
              <h2 id="referrals-title">Products I use and recommend.</h2>
            </div>
          </div>

          <div className={styles.featuredReferralGrid}>
            {featuredReferrals.map((referral) => (
              <ReferralCard key={referral.name} referral={referral} />
            ))}
          </div>

          <div className={styles.directoryHeading}>
            <h3>More useful links</h3>
            <span>{directoryReferrals.length} partner websites</span>
          </div>

          <div className={styles.compactReferralGrid}>
            {directoryReferrals.map((referral) => (
              <ReferralCard key={referral.name} referral={referral} compact />
            ))}
          </div>

          <p className={styles.disclosure}>
            I may earn a fee if you use one of these links, at no extra cost to you.
          </p>
        </section>

        <section className={styles.resourcesSection} aria-labelledby="resources-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Free resources</p>
              <h2 id="resources-title">Put the ideas to work.</h2>
            </div>
          </div>

          <Link href="/skill-files" className={styles.skillPanel}>
            <span className={styles.skillIcon} aria-hidden="true">
              <FileText />
            </span>
            <span className={styles.skillCopy}>
              <span className={styles.eyebrow}>Skill Files</span>
              <strong>Practical AI workflows, systems, and working files.</strong>
            </span>
            <span className={styles.skillAction}>
              Open the library <ArrowRight aria-hidden="true" />
            </span>
          </Link>
        </section>

        <section className={styles.projectsSection} aria-labelledby="projects-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>What I am building</p>
              <h2 id="projects-title">Projects</h2>
            </div>
          </div>

          <div className={styles.projectGrid}>
            {projects.map((project) => (
              <a
                key={project.title}
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.projectCard}
              >
                <span className={styles.projectImage}>
                  <Image src={project.image} alt="" fill sizes="(max-width: 680px) 88px, 120px" />
                </span>
                <span className={styles.projectCopy}>
                  <small>{project.role}</small>
                  <strong>{project.title}</strong>
                  <span>{project.description}</span>
                </span>
                <span className={styles.projectArrow} aria-hidden="true">
                  <ArrowUpRight />
                </span>
                <span className={styles.srOnly}>Opens in a new tab.</span>
              </a>
            ))}
          </div>
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
  )
}
