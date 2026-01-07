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
  },
  {
    name: "Drift Protocol",
    icon: DriftIcon,
    href: "https://app.drift.trade/ref/sebmonty",
  },
  {
    name: "MarginFi",
    icon: MarginFiIcon,
    href: "https://app.marginfi.com/refer/b00ada54-a135-4055-b80b-c50723f13eb6",
  },
  {
    name: "SolBlaze",
    icon: SolBlazeIcon,
    href: "https://stake.solblaze.org/?r=428e683b8ed0b2da",
  },
  {
    name: "Marinade Finance",
    icon: MarinadeIcon,
    href: "https://app.marinade.finance/",
  },
  {
    name: "Grass",
    icon: GrassIcon,
    href: "https://app.grass.io/register?referralCode=lRRJhq4oCOZe63z",
  },
  {
    name: "Uprock",
    icon: UprockIcon,
    href: "https://uprock.com/register?ref=f7d47958",
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
    <div className="flex items-center gap-2 h-[60px]">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        className="w-[60px] h-[60px] bg-[#f1f1f1] border-[2px] border-white rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Previous referral"
      >
        <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Carousel Card */}
      <AnimatePresence mode="wait">
        <motion.a
          key={currentIndex}
          href={currentReferral.href}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex-1 h-[60px] bg-[#f1f1f1] border-[2.855px] border-white rounded-full px-4 flex items-center gap-3 hover:scale-[1.02] transition-transform"
        >
          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center flex-shrink-0">
            <Icon size={20} />
          </div>
          <span className="font-bold text-black text-lg truncate">
            {currentReferral.name}
          </span>
        </motion.a>
      </AnimatePresence>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="w-[60px] h-[60px] bg-[#f1f1f1] border-[2px] border-white rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label="Next referral"
      >
        <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
