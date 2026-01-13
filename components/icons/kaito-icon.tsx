"use client"

interface KaitoIconProps {
  size?: number
  className?: string
}

export function KaitoIcon({ size = 24, className }: KaitoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="14" fill="#ec4899" />
      <path
        d="M16 6l10 10-10 10L6 16 16 6z"
        fill="#fff"
        fillOpacity="0.9"
      />
      <circle cx="16" cy="16" r="3" fill="#ec4899" />
    </svg>
  )
}
