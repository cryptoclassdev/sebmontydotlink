import Image from "next/image"

export function DriftIcon({ size = 20 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image src="/images/drift-icon.png" alt="Drift" width={size} height={size} className="object-contain" />
    </div>
  )
}
