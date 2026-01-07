import Image from "next/image"

interface AtIconProps {
  size?: number
}

export function AtIcon({ size = 24 }: AtIconProps) {
  return (
    <Image src="/images/icons/at-icon.png" alt="Threads" width={size} height={size} className="object-contain" />
  )
}
