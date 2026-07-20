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
    <nav className="publication-categories scrollbar-hide" aria-label="Browse writing categories">
      <div>
        <Link
          href="/blog"
          className={cn(
            'publication-category-link',
            isAll
              ? 'is-active'
              : undefined
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
                'publication-category-link',
                isActive
                  ? 'is-active'
                  : undefined
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
