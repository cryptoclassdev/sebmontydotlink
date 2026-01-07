import Image from "next/image"

export function XIcon({ size = 24 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Image src="/images/icons/x-icon.png" alt="X/Twitter" fill className="object-contain" />
    </div>
  )
}
