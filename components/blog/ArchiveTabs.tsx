'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { MagnifyingGlass } from '@phosphor-icons/react'

interface ArchiveTabsProps {
  onSearchClick?: () => void
}

export function ArchiveTabs({ onSearchClick }: ArchiveTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentSort = searchParams.get('sort') || 'latest'

  const tabs = [
    { id: 'latest', label: 'Latest' },
    { id: 'top', label: 'Top' },
    { id: 'discussions', label: 'Discussions' },
  ]

  const handleTabClick = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (tabId === 'latest') {
      params.delete('sort')
    } else {
      params.set('sort', tabId)
    }
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <nav className="flex items-center justify-between border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              currentSort === tab.id
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <button
        onClick={onSearchClick}
        className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
        aria-label="Search"
      >
        <MagnifyingGlass className="w-5 h-5" weight="bold" />
      </button>
    </nav>
  )
}
