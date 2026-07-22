'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { PostCard, SearchInput } from '@/components/blog'
import { mergeBlogCategories } from '@/lib/blog/categories'
import { METEORA_POST_CARD } from '@/lib/blog/meteora-metadata'
import { client } from '@/sanity/client'
import { categoriesQuery, searchPostsQuery } from '@/sanity/queries'
import type { Category, Post } from '@/sanity/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    client.fetch<Category[]>(categoriesQuery)
      .then((items) => setCategories(mergeBlogCategories(items, [METEORA_POST_CARD])))
      .catch(() => setCategories(mergeBlogCategories([], [METEORA_POST_CARD])))
  }, [])

  const handleSearch = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery)
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }
    setIsLoading(true)
    setHasSearched(true)
    try {
      const sanityResults = await client.fetch<Post[]>(searchPostsQuery, { query: `*${searchQuery}*` } as never)
      const normalizedQuery = searchQuery.trim().toLowerCase()
      const staticResults = [METEORA_POST_CARD].filter((post) => [post.title, post.subtitle, post.excerpt, post.category?.title]
        .some((value) => value?.toLowerCase().includes(normalizedQuery)))
      setResults([...staticResults, ...sanityResults]
        .filter((post, index, posts) => posts.findIndex((candidate) => candidate._id === post._id) === index))
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

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
        {isLoading && <p>Searching…</p>}
        {!isLoading && hasSearched && results.length === 0 && <div className="publication-empty"><strong>No matching stories</strong><p>Try a broader term than “{query}”.</p></div>}
        {!isLoading && results.length > 0 && (
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
