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
    <div className="relative">
      <MagnifyingGlass
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
        weight="bold"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
      />
    </div>
  )
}
