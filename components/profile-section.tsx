"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface ProfileSectionProps {
  name: string
  bio: string
  imageUrl: string
}

export function ProfileSection({ name, bio, imageUrl }: ProfileSectionProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="relative"
      >
        <div
          className="relative h-24 w-24 overflow-hidden rounded-full"
          style={{
            background: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(0.625rem)",
            WebkitBackdropFilter: "blur(0.625rem)",
            boxShadow: `
              inset 0 2px 4px rgba(255, 255, 255, 0.8),
              0 0 0 2px rgba(255, 255, 255, 0.6),
              0 4px 16px rgba(0, 0, 0, 0.1),
              0 12px 32px rgba(120, 119, 198, 0.15)
            `,
          }}
        >
          <Image src={imageUrl || "/placeholder.svg"} alt={name} fill className="object-cover" priority />
        </div>

        {/* Subtle outer glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: "0 0 2.5rem 0.5rem rgba(120, 119, 198, 0.1)",
          }}
        />
      </motion.div>

      <h1 className="mt-5 text-xl font-semibold tracking-tight text-gray-800">{name}</h1>
      <p className="mt-2 text-sm text-gray-500">{bio}</p>
    </div>
  )
}
