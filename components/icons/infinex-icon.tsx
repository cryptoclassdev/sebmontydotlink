import Image from "next/image"

interface InfinexIconProps {
  size?: number
}

export function InfinexIcon({ size = 24 }: InfinexIconProps) {
  return (
    <Image src="/images/icons/infinex-icon.png" alt="Infinex" width={size} height={size} className="object-contain" />
  )
}
