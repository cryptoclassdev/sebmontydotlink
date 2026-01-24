import Image from "next/image"

interface SubstackIconProps {
  size?: number
  className?: string
}

export function SubstackIcon({ size = 24, className = "" }: SubstackIconProps) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Image src="/images/icons/substack-icon.png" alt="Substack" fill className={`object-contain ${className}`} />
    </div>
  )
}
