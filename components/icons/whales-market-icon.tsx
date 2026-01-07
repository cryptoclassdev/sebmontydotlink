import Image from "next/image"

export function WhalesMarketIcon({ size = 20 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image
        src="/images/icons/whale-icon.svg"
        alt="Whales Market"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  )
}
