'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { client } from '@/sanity/client'
import { searchPostsQuery, categoriesQuery } from '@/sanity/queries'
import type { Post, Category } from '@/sanity/types'
import { SearchInput, PostCard } from '@/components/blog'
import { ArrowLeft } from '@phosphor-icons/react'
import { useEffect } from 'react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    client.fetch<Category[]>(categoriesQuery).then(setCategories)
  }, [])

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const posts = await client.fetch<Post[]>(searchPostsQuery, {
        query: `*${searchQuery}*`,
      })
      setResults(posts)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <header className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" weight="bold" />
          <span className="text-sm">Back to Blog</span>
        </Link>

        <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

        <SearchInput onSearch={handleSearch} />
      </header>

      {/* Results */}
      <div className="mb-12">
        {isLoading && (
          <p className="text-white/50">Searching...</p>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <p className="text-white/50">No results found for "{query}"</p>
        )}

        {!isLoading && results.length > 0 && (
          <>
            <p className="text-white/50 mb-6">
              {results.length} {results.length === 1 ? 'result' : 'results'} found
            </p>
            <div className="divide-y divide-white/10">
              {results.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Browse by Category */}
      {!hasSearched && categories.length > 0 && (
        <div>
          <h2 className="text-sm uppercase tracking-wider text-white/50 mb-4">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/blog/category/${cat.slug}`}
                className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                <h3 className="font-medium text-white">{cat.title}</h3>
                <p className="text-sm text-white/40 mt-1">
                  {cat.postCount} {cat.postCount === 1 ? 'post' : 'posts'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
