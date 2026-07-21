interface YoutubeIconProps {
  size?: number
  className?: string
}

export function YoutubeIcon({ size = 20, className = "" }: YoutubeIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.5 6.186C23.226 5.159 22.421 4.35 21.4 4.075C19.549 3.576 12 3.576 12 3.576C12 3.576 4.451 3.576 2.6 4.075C1.579 4.35 0.774 5.159 0.5 6.186C0.004 8.047 0.004 11.932 0.004 11.932C0.004 11.932 0.004 15.817 0.5 17.678C0.774 18.705 1.579 19.514 2.6 19.789C4.451 20.288 12 20.288 12 20.288C12 20.288 19.549 20.288 21.4 19.789C22.421 19.514 23.226 18.705 23.5 17.678C23.996 15.817 23.996 11.932 23.996 11.932C23.996 11.932 23.996 8.047 23.5 6.186Z"
        fill="#FF0000"
      />
      <path d="M9.6 15.46L15.868 11.932L9.6 8.404V15.46Z" fill="#FFFFFF" />
    </svg>
  )
}
