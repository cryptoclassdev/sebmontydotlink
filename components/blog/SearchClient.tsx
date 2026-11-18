'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PostCard, SearchInput } from '@/components/blog'
import type { Category, Post } from '@/lib/blog/types'

export function SearchClient({ posts, categories }: { posts: Post[]; categories: Category[] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Post[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery)
      const normalizedQuery = searchQuery.trim().toLowerCase()
      if (!normalizedQuery) {
        setResults([])
        setHasSearched(false)
        return
      }
      setHasSearched(true)
      setResults(
        posts.filter((post) =>
          [post.title, post.subtitle, post.excerpt, post.category?.title, post.author?.name].some((value) => value?.toLowerCase().includes(normalizedQuery)),
        ),
      )
    },
    [posts],
  )

  return (
    <div className="site-shell publication-search-page">
      <header>
        <Link className="publication-back-link" href="/blog"><ArrowLeft aria-hidden="true" /> Back to the blog</Link>
        <span className="site-eyebrow">Blog archive</span>
        <h1>Find the useful part.</h1>
        <p>Search published titles and article text.</p>
        <SearchInput onSearch={handleSearch} />
      </header>

      <section className="publication-search-results" aria-live="polite">
        {hasSearched && results.length === 0 && <div className="publication-empty"><strong>No matching stories</strong><p>Try a broader term than “{query}”.</p></div>}
        {results.length > 0 && (
          <><p>{results.length} {results.length === 1 ? 'result' : 'results'}</p><div>{results.map((post) => <PostCard key={post._id} post={post} variant="list" />)}</div></>
        )}
      </section>

      {!hasSearched && categories.length > 0 && (
        <section className="publication-browse" aria-labelledby="browse-categories-title">
          <h2 id="browse-categories-title">Browse by category</h2>
          <div>{categories.map((category) => <Link key={category._id} href={`/blog?category=${category.slug}`}><strong>{category.title}</strong><span>{category.postCount || 0} posts</span></Link>)}</div>
        </section>
      )}
    </div>
  )
}
