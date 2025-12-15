import Image from "next/image"

export function GrassIcon({ size = 20 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image src="/images/grass-icon.png" alt="Grass" width={size} height={size} className="object-contain" />
    </div>
  )
}
