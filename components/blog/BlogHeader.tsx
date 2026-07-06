'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { MagnifyingGlass, ShareNetwork } from '@phosphor-icons/react'

interface BlogHeaderProps {
  publicationName?: string
  logo?: string
}

export function BlogHeader({ publicationName = 'Blog', logo }: BlogHeaderProps) {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo and publication name */}
          <div className="flex items-center gap-3">
            <Link href="/blog" className="flex items-center gap-3">
              <Image
                src={logo || '/images/seb-pfp.png'}
                alt={publicationName}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
                {publicationName}
              </h1>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <MagnifyingGlass className="w-5 h-5" weight="bold" />
            </button>
            <button
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Share"
            >
              <ShareNetwork className="w-5 h-5" weight="bold" />
            </button>
            <Link
              href="/"
              className="ml-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 pb-3 overflow-x-auto border-b border-gray-100">
          <NavTab href="/blog" label="Latest" />
          <NavTab href="/blog?sort=top" label="Top" />
          <NavTab href="/blog/search" label="Search" />
        </nav>

        {/* Search bar (expandable) */}
        {showSearch && (
          <div className="py-4 border-t border-gray-100">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function NavTab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300 transition-colors whitespace-nowrap"
    >
      {label}
    </Link>
  )
}
