'use client'

import { useState, useEffect, useCallback } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'

interface SearchInputProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchInput({
  onSearch,
  placeholder = 'Search posts...',
  debounceMs = 300,
}: SearchInputProps) {
  const [query, setQuery] = useState('')

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(query)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [query, debounceMs, onSearch])

  return (
    <div className="publication-search-input">
      <MagnifyingGlass
        aria-hidden="true"
        weight="bold"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
