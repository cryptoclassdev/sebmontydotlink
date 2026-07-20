import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpenText } from "lucide-react"
import styles from "@/components/link-hub.module.css"

export const metadata: Metadata = {
  title: "Skill Files",
  description: "Practical AI workflows, systems, and working files from Seb Montgomery.",
}

const plannedShelves = [
  "Writing systems",
  "Research and operations",
  "Brand and positioning",
  "Design and build",
]

export default function SkillFilesPage() {
  return (
    <main id="main-content" className={`${styles.page} ${styles.subpage}`}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.wordmark} aria-label="Seb Montgomery home">
            <span className={styles.wordmarkDot} aria-hidden="true" />
            <span>Seb Montgomery</span>
          </Link>

          <nav className={styles.primaryNav} aria-label="Primary navigation">
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>
          </nav>
        </header>

        <section className={styles.skillHero} aria-labelledby="skill-files-title">
          <p className={styles.eyebrow}>Public library · opening soon</p>
          <h1 id="skill-files-title">Skill Files</h1>
          <p>Practical AI workflows, systems, and working files made useful enough to steal.</p>
        </section>

        <section className={styles.emptyState} aria-labelledby="first-files-title">
          <div className={styles.emptyStateCopy}>
            <p className={styles.eyebrow}>First drop</p>
            <h2 id="first-files-title">The first files are being prepared.</h2>
            <p>
              I’m cleaning up the workflows I use for research, writing, brand work, and building
              with AI. Until they’re ready, the blog is the best place to start.
            </p>
            <div className={styles.emptyActions}>
              <Link href="/blog">
                <BookOpenText aria-hidden="true" />
                Read the blog
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/">
                <ArrowLeft aria-hidden="true" />
                Back to the hub
              </Link>
            </div>
          </div>

          <div className={styles.plannedShelves}>
            <p className={styles.eyebrow}>Planned shelves</p>
            <ul>
              {plannedShelves.map((shelf) => (
                <li key={shelf}>
                  {shelf}
                  <span>In preparation</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <footer className={styles.footer}>
          <div>
            <span className={styles.footerMark} aria-hidden="true">7.1</span>
            <p>One idea: connect the dots.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/">Home</Link>
            <Link href="/blog">Blog</Link>
          </nav>
        </footer>
      </div>
    </main>
  )
}
