import Image from "next/image"

interface KastIconProps {
  size?: number
}

export function KastIcon({ size = 24 }: KastIconProps) {
  return (
    <Image src="/kast-logo.png" alt="Kast" width={size} height={size} className="object-contain" />
  )
}
