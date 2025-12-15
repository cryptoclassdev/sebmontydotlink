"use client"

import { motion } from "framer-motion"
import { XLogo, LinkedinLogo, TelegramLogo, At } from "@phosphor-icons/react"

const socials = [
  { icon: XLogo, href: "https://x.com/SebMontgomery", label: "Twitter" },
  { icon: At, href: "mailto:seb@validator.com", label: "Email" },
  { icon: TelegramLogo, href: "https://t.me/SebMontgomery", label: "Telegram" },
  { icon: LinkedinLogo, href: "https://www.linkedin.com/in/sebastian-montgomery-3354a245/", label: "Linkedin" },
]

export function SocialFooter() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          background: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: `
            inset 0 1px 1px rgba(255, 255, 255, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.04)
          `,
        }}
      >
        {socials.map((social) => (
          <motion.a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:text-gray-700"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
          >
            <social.icon className="h-5 w-5" strokeWidth={1.5} />
          </motion.a>
        ))}
      </div>

      <p className="text-[11px] text-gray-400">© sebmonty.link </p>
    </div>
  )
}
