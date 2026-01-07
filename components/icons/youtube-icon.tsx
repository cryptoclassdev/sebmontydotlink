import Image from "next/image"

interface YoutubeIconProps {
  size?: number
}

export function YoutubeIcon({ size = 20 }: YoutubeIconProps) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <Image src="/images/icons/yt-icon.png" alt="YouTube" fill className="object-contain" />
    </div>
  )
}
