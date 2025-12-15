import Image from "next/image"

export function MarginFiIcon({ size = 20 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image src="/images/marginfi-icon.png" alt="MarginFi" width={size} height={size} className="object-contain" />
    </div>
  )
}
