#!/usr/bin/env node
// pnpm articles:check  -> validate every article in content/articles and list problems
// pnpm articles:build  -> validate and write lib/publishing/.generated/articles.json
import { compileArticles, writeArticleManifest } from '../lib/publishing/compile.mjs'

const command = process.argv[2] || 'check'

try {
  if (command === 'build') {
    const { articles } = writeArticleManifest()
    console.log(`Compiled ${articles.length} article${articles.length === 1 ? '' : 's'}.`)
  } else {
    const { articles } = compileArticles({ includeDrafts: true })
    for (const { post } of articles) {
      console.log(`  ok  ${post.slug}  (${post.status}, ${post.publishedAt.slice(0, 10)}, ${post.readTime} min, ${post.body.length} blocks)`)
    }
    console.log(`\nAll ${articles.length} article${articles.length === 1 ? '' : 's'} passed.`)
  }
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
