import Image from "next/image"

interface SubstackIconProps {
  size?: number
}

export function SubstackIcon({ size = 20 }: SubstackIconProps) {
  return (
    <div style={{ width: size, height: size }}>
      <Image
        src="/images/icons/substack-icon.png"
        alt="Substack"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  )
}
