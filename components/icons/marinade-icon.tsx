import Image from "next/image"

export function MarinadeIcon({ size = 20 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image
        src="/images/marinade-logo.png"
        alt="Marinade Finance"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  )
}
