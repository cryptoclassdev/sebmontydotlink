import Image from "next/image"

export function LinkedinIcon({ size = 24 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Image src="/images/icons/linkedin-icon.png" alt="LinkedIn" fill className="object-contain" />
    </div>
  )
}
