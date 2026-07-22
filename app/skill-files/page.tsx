import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, FolderOpen } from "lucide-react"
import styles from "@/components/link-hub.module.css"

export const metadata: Metadata = {
  title: "Skill Files",
  description: "Agent skills for crypto, research, and practical work from Seb Montgomery.",
}

const skillFiles = [
  {
    title: "Meteora LPing",
    category: "Meteora · Solana DLMM",
    description:
      "Mechanics-grounded guidance for providing liquidity on Meteora, covering bins, fees, LP strategies, pool selection, risk checks, and when not to LP.",
    href: "https://github.com/sebmonty/skills/tree/main/meteora-lp-sebmonty",
    logo: "/referral-logos/meteora-logo.svg",
    dateAdded: { dateTime: "2026-07-21", label: "21 July 2026" },
    dateUpdated: { dateTime: "2026-07-21", label: "21 July 2026" },
  },
]

export default function SkillFilesPage() {
  const fileCount = String(skillFiles.length).padStart(2, "0")

  return (
    <main id="main-content" className={`${styles.page} ${styles.subpage}`}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.wordmark} aria-label="Seb Montgomery home">
            <span className={styles.wordmarkPortrait} aria-hidden="true">
              <Image src="/images/brand/seb-avatar.png" alt="" width={34} height={34} priority />
            </span>
            <span>Seb Montgomery</span>
          </Link>

          <nav className={styles.primaryNav} aria-label="Primary navigation">
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>
          </nav>
        </header>

        <section className={styles.skillHero} aria-labelledby="skill-files-title" data-count={fileCount}>
          <p className={styles.eyebrow}>Public library</p>
          <h1 id="skill-files-title">Skill Files</h1>
          <p>Practical agent skills for crypto, research, and the work behind the work.</p>
        </section>

        <a
          className={styles.repositoryBanner}
          href="https://github.com/sebmonty/skills/tree/main"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className={styles.repositoryIcon} aria-hidden="true">
            <FolderOpen />
          </span>
          <span className={styles.repositoryCopy}>
            <span className={styles.eyebrow}>GitHub repository</span>
            <strong>All skill files are here.</strong>
            <span>Browse the complete tree, installation notes, source files, and references.</span>
          </span>
          <span className={styles.repositoryAction}>
            Open all files <ArrowUpRight aria-hidden="true" />
          </span>
          <span className={styles.srOnly}>Opens in a new tab.</span>
        </a>

        <section className={styles.skillLibrary} aria-labelledby="available-skills-title">
          <div className={styles.libraryHeading}>
            <div>
              <p className={styles.eyebrow}>Available now</p>
              <h2 id="available-skills-title">Skills you can use.</h2>
            </div>
            <span>{skillFiles.length} {skillFiles.length === 1 ? "skill" : "skills"}</span>
          </div>

          <div className={styles.skillList}>
            {skillFiles.map((skill) => (
              <article className={styles.skillCard} key={skill.href}>
                <a href={skill.href} target="_blank" rel="noopener noreferrer">
                  <span className={styles.skillLogo} aria-hidden="true">
                    <Image src={skill.logo} alt="" width={52} height={52} />
                  </span>

                  <span className={styles.skillCardCopy}>
                    <span className={styles.skillFileLabel}>SKILL.md</span>
                    <span className={styles.skillCategory}>{skill.category}</span>
                    <strong>{skill.title}</strong>
                    <span className={styles.skillDescription}>{skill.description}</span>
                  </span>

                  <span className={styles.skillDates}>
                    <span>
                      <small>Date added</small>
                      <time dateTime={skill.dateAdded.dateTime}>{skill.dateAdded.label}</time>
                    </span>
                    {skill.dateUpdated && (
                      <span>
                        <small>Date updated</small>
                        <time dateTime={skill.dateUpdated.dateTime}>{skill.dateUpdated.label}</time>
                      </span>
                    )}
                  </span>

                  <span className={styles.skillCardAction} aria-hidden="true">
                    <ArrowUpRight />
                  </span>
                  <span className={styles.srOnly}>Opens the Meteora LPing skill on GitHub in a new tab.</span>
                </a>
              </article>
            ))}
          </div>

          <Link href="/" className={styles.backLink}>
            <ArrowLeft aria-hidden="true" />
            Back to the hub
          </Link>
        </section>

        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} Seb Montgomery</p>
          <nav aria-label="Footer navigation">
            <Link href="/blog">Blog</Link>
            <Link href="/skill-files" aria-current="page">Skill Files</Link>
            <a href="mailto:support@sebmonty.link">Email</a>
          </nav>
        </footer>
      </div>
    </main>
  )
}
