import Image from "next/image"

export function UprockIcon({ size = 20 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image src="/images/design-mode/uprock-icon_nxppif.avif" alt="Uprock" width={size} height={size} className="object-contain" />
    </div>
  )
}
