import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

import { writeArticleManifest } from './lib/publishing/compile.mjs'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

let watching = false

// Compile content/articles/*.md before Next.js builds. A broken article stops the
// build with a list of problems. In `next dev`, edits recompile automatically.
function compileArticles(phase) {
  if (phase !== PHASE_DEVELOPMENT_SERVER) {
    writeArticleManifest({ root: projectRoot })
    return
  }

  const rebuild = () => {
    try {
      const { articles } = writeArticleManifest({ root: projectRoot })
      console.log(`[articles] compiled ${articles.length} article(s)`)
    } catch (error) {
      console.error(`[articles] ${error.message}`)
    }
  }
  rebuild()

  if (watching) return
  watching = true
  let timer
  for (const dir of ['content', 'public/articles']) {
    const fullDir = path.join(projectRoot, dir)
    if (!fs.existsSync(fullDir)) continue
    fs.watch(fullDir, { recursive: true }, () => {
      clearTimeout(timer)
      timer = setTimeout(rebuild, 150)
    })
  }
}

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  compileArticles(phase)

  return {
    poweredByHeader: false,
    turbopack: {
      root: projectRoot,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cdn.sanity.io',
          pathname: '/images/**',
        },
      ],
    },
    async rewrites() {
      return {
        beforeFiles: [
          // Plain-Markdown copy of each article for AI agents
          { source: '/blog/:slug.md', destination: '/agent/articles/:slug' },
        ],
      }
    },
  }
}
