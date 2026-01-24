import Image from "next/image"

interface EmailIconProps {
  size?: number
  className?: string
}

export function EmailIcon({ size = 24, className = "" }: EmailIconProps) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Image src="/images/icons/at-icon.png" alt="Email" fill className={`object-contain ${className}`} />
    </div>
  )
}
