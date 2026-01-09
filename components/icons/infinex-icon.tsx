import Image from "next/image"

interface InfinexIconProps {
  size?: number
}

export function InfinexIcon({ size = 24 }: InfinexIconProps) {
  return (
    <Image src="/infinex-logo.png" alt="Infinex" width={size} height={size} className="object-contain" />
  )
}
