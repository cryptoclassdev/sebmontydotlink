import { BookOpen } from "lucide-react"

interface BlogIconProps {
  size?: number
  className?: string
}

export function BlogIcon({ size = 24, className = "" }: BlogIconProps) {
  // strokeWidth bumped slightly so it reads with similar visual weight
  // to the filled brand logos it sits beside in the profile social row.
  return <BookOpen size={size} strokeWidth={2.25} className={className} />
}
