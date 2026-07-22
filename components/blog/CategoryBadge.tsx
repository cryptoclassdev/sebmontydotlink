import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
  title: string
  slug: string
  className?: string
}

export function CategoryBadge({ title, slug, className }: CategoryBadgeProps) {
  return (
    <Link
      href={`/blog?category=${slug}`}
      className={cn(
        'publication-category-badge',
        className
      )}
    >
      {title}
    </Link>
  )
}
