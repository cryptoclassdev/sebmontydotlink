import Image from "next/image"

interface YoutubeIconProps {
  size?: number
}

export function YoutubeIcon({ size = 20 }: YoutubeIconProps) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
      <Image src="/images/design-mode/yt-icon_a4b8r8.png" alt="YouTube" fill className="object-contain" />
    </div>
  )
}
