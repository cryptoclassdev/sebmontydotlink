import Image from "next/image"

interface TelegramIconProps {
  size?: number
  className?: string
}

export function TelegramIcon({ size = 24, className = "" }: TelegramIconProps) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Image src="/images/icons/telegram-icon.png" alt="Telegram" fill className={`object-contain ${className}`} />
    </div>
  )
}
