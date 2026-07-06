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
      href={`/blog/category/${slug}`}
      className={cn(
        'inline-block px-3 py-1 text-xs uppercase tracking-wider',
        'text-white/80 bg-white/10 rounded-full',
        'hover:bg-white/20 transition-colors',
        className
      )}
    >
      {title}
    </Link>
  )
}
