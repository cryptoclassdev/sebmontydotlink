import Image from "next/image"

export function WhalesMarketIcon({ size = 20 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image src="/images/design-mode/whale-icon_jauvu8.jpg" alt="Whales Market" width={size} height={size} className="object-contain" />
    </div>
  )
}
