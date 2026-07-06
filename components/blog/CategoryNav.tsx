'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/sanity/types'

interface CategoryNavProps {
  categories: Category[]
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const pathname = usePathname()
  const isAll = pathname === '/blog'

  return (
    <nav className="border-b border-white/10 overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 min-w-max">
        <Link
          href="/blog"
          className={cn(
            'px-4 py-3 text-sm uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors',
            isAll
              ? 'border-white text-white'
              : 'border-transparent text-white/50 hover:text-white/80'
          )}
        >
          All
        </Link>
        {categories.map((cat) => {
          const isActive = pathname === `/blog/category/${cat.slug}`
          return (
            <Link
              key={cat._id}
              href={`/blog/category/${cat.slug}`}
              className={cn(
                'px-4 py-3 text-sm uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors',
                isActive
                  ? 'border-white text-white'
                  : 'border-transparent text-white/50 hover:text-white/80'
              )}
            >
              {cat.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
