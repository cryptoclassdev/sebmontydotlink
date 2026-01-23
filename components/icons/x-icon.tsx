import Image from "next/image"

interface XIconProps {
  size?: number
  className?: string
}

export function XIcon({ size = 24, className = "" }: XIconProps) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Image src="/images/icons/x-icon.png" alt="X/Twitter" fill className={`object-contain ${className}`} />
    </div>
  )
}
