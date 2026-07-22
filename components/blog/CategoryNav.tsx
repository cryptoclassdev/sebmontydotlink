import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Category } from '@/sanity/types'

interface CategoryNavProps {
  categories: Category[]
  activeCategory?: string
}

export function CategoryNav({ categories, activeCategory }: CategoryNavProps) {
  return (
    <nav className="publication-categories scrollbar-hide" aria-label="Browse blog categories">
      <div>
        <Link
          href="/blog"
          scroll={false}
          className={cn('publication-category-link', !activeCategory ? 'is-active' : undefined)}
          aria-current={!activeCategory ? 'page' : undefined}
        >
          All
        </Link>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.slug
          return (
            <Link
              key={cat._id}
              href={`/blog?category=${cat.slug}`}
              scroll={false}
              className={cn('publication-category-link', isActive ? 'is-active' : undefined)}
              aria-current={isActive ? 'page' : undefined}
            >
              {cat.title}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
