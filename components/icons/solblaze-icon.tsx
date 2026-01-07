import Image from "next/image"

export function SolBlazeIcon({ size = 20 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image
        src="/images/icons/solblaze-icon.png"
        alt="SolBlaze"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  )
}
