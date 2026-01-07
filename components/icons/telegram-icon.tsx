import Image from "next/image"

export function TelegramIcon({ size = 24 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Image src="/images/icons/telegram-icon.png" alt="Telegram" fill className="object-contain" />
    </div>
  )
}
