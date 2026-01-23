import Image from "next/image"

interface YoutubeIconProps {
  size?: number
  className?: string
}

export function YoutubeIcon({ size = 20, className = "" }: YoutubeIconProps) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <Image src="/images/icons/yt-icon.png" alt="YouTube" fill className={`object-contain ${className}`} />
    </div>
  )
}
