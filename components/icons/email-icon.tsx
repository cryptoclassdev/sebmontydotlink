import Image from "next/image"

export function EmailIcon({ size = 24 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Image src="/images/icons/at-icon.png" alt="Email" fill className="object-contain" />
    </div>
  )
}
