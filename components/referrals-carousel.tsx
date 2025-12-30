"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { WhalesMarketIcon } from "./icons/whales-market-icon"
import { MarginFiIcon } from "./icons/marginfi-icon"
import { DriftIcon } from "./icons/drift-icon"
import { SolBlazeIcon } from "./icons/solblaze-icon"
import { GrassIcon } from "./icons/grass-icon"
import { MarinadeIcon } from "./icons/marinade-icon"
import { UprockIcon } from "./icons/uprock-icon"

const referrals = [
  {
    name: "Whales Market",
    icon: WhalesMarketIcon,
    href: "https://app.whales.market/?r=500670",
    tag: "NFT Trading",
  },
  {
    name: "Drift Protocol",
    icon: DriftIcon,
    href: "https://app.drift.trade/ref/sebmonty",
    tag: "Perpetuals",
  },
  {
    name: "MarginFi",
    icon: MarginFiIcon,
    href: "https://app.marginfi.com/refer/b00ada54-a135-4055-b80b-c50723f13eb6",
    tag: "Lending",
  },
  {
    name: "SolBlaze",
    icon: SolBlazeIcon,
    href: "https://stake.solblaze.org/?r=428e683b8ed0b2da",
    tag: "Liquid Staking",
  },
  {
    name: "Marinade Finance",
    icon: MarinadeIcon,
    href: "https://app.marinade.finance/",
    tag: "Staking",
  },
  {
    name: "Grass",
    icon: GrassIcon,
    href: "https://app.grass.io/register?referralCode=lRRJhq4oCOZe63z",
    tag: "Network",
  },
  {
    name: "Uprock",
    icon: UprockIcon,
    href: "https://uprock.com/register?ref=f7d47958",
    tag: "AI Network",
  },
]

export function ReferralsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? referrals.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === referrals.length - 1 ? 0 : prev + 1))
  }

  const currentReferral = referrals[currentIndex]
  const Icon = currentReferral.icon

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handlePrevious}
        className="w-12 h-12 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/50 transition-colors flex-shrink-0"
        aria-label="Previous referral"
      >
        <svg className="w-6 h-6 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <AnimatePresence mode="wait">
        <motion.a
          key={currentIndex}
          href={currentReferral.href}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 hover:bg-white transition-colors"
        >
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center flex-shrink-0">
            <Icon size={24} />
          </div>
          <span className="font-semibold text-black text-lg">Other Referrals</span>
        </motion.a>
      </AnimatePresence>

      <button
        onClick={handleNext}
        className="w-12 h-12 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/50 transition-colors flex-shrink-0"
        aria-label="Next referral"
      >
        <svg className="w-6 h-6 text-black/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
