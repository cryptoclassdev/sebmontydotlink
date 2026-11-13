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
          // Breakpoint guide: a self-contained page built into public/breakpoint (source in breakpoint/)
          { source: '/breakpoint', destination: '/breakpoint/index.html' },
        ],
      }
    },
    async headers() {
      return [
        {
          // Breakpoint guide page and assets. The API under /breakpoint/api sets its own cache headers.
          source: '/breakpoint/:path((?!api/).*)?',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https://tile.openstreetmap.org https://images.lumacdn.com",
                "connect-src 'self'",
                'frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com',
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
              ].join('; '),
            },
          ],
        },
      ]
    },
  }
}
