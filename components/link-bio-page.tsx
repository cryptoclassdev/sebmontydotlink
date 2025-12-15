"use client"

import type React from "react"

import { motion, useMotionValue, useMotionTemplate, useAnimationFrame } from "framer-motion"
import { ProfileSection } from "./profile-section"
import { LinkCard } from "./link-card"
import { SocialFooter } from "./social-footer"
import { TokenSOL } from "@web3icons/react"
import { WhalesMarketIcon } from "./icons/whales-market-icon"
import { MarginFiIcon } from "./icons/marginfi-icon"
import { DriftIcon } from "./icons/drift-icon"
import { SolBlazeIcon } from "./icons/solblaze-icon"
import { GrassIcon } from "./icons/grass-icon"
import { MarinadeIcon } from "./icons/marinade-icon"
import { UprockIcon } from "./icons/uprock-icon"
import { YoutubeIcon } from "./icons/youtube-icon"
import { SubstackIcon } from "./icons/substack-icon"
import { useRef } from "react"

const links = [
  {
    title: "Youtube",
    description: "Videos on Crypto",
    href: "https://www.youtube.com/@SebMontgomery",
    icon: () => <YoutubeIcon size={20} />,
  },
  {
    title: "Substack",
    description: "Deep Dives & More",
    href: "https://sebmonty.substack.com/",
    icon: () => <SubstackIcon size={20} />,
  },
  {
    title: "Solana Mobile",
    description: "Review and Walkthorough",
    href: "https://www.youtube.com/watch?v=ZPReMS8bnlA",
    icon: () => <TokenSOL variant="branded" size={20} />,
  },
  {
    title: "Whales Market",
    description: "Referral",
    href: "https://app.whales.market/?r=500670",
    icon: () => <WhalesMarketIcon size={20} />,
  },
  {
    title: "Drift",
    description: "Refferal",
    href: "https://app.drift.trade/ref/sebmonty",
    icon: () => <DriftIcon size={20} />,
  },
  {
    title: "Uprock",
    description: "Refferal",
    href: "https://uprock.com/register?ref=f7d47958",
    icon: () => <UprockIcon size={20} />,
  },
  {
    title: "Grass",
    description: "Refferal",
    href: "https://app.grass.io/register?referralCode=lRRJhq4oCOZe63z",
    icon: () => <GrassIcon size={20} />,
  },
  {
    title: "Marinade Finance",
    description: "Refferal",
    href: "https://app.marinade.finance/",
    icon: () => <MarinadeIcon size={20} />,
  },
  {
    title: "SolBlaze",
    description: "Refferal",
    href: "https://stake.solblaze.org/?r=428e683b8ed0b2da",
    icon: () => <SolBlazeIcon size={20} />,
  },
  {
    title: "MarginFi",
    description: "Refferal",
    href: "https://app.marginfi.com/refer/b00ada54-a135-4055-b80b-c50723f13eb6",
    icon: () => <MarginFiIcon size={20} />,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 25,
    },
  },
}

const GridPattern = ({ offsetX, offsetY }: { offsetX: any; offsetY: any }) => {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse" x={offsetX} y={offsetY}>
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground"
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  )
}

export function LinkBioPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - left)
    mouseY.set(e.clientY - top)
  }

  const gridOffsetX = useMotionValue(0)
  const gridOffsetY = useMotionValue(0)

  const speedX = 0.5
  const speedY = 0.5

  useAnimationFrame(() => {
    const currentX = gridOffsetX.get()
    const currentY = gridOffsetY.get()
    gridOffsetX.set((currentX + speedX) % 40)
    gridOffsetY.set((currentY + speedY) % 40)
  })

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`

  return (
    <main
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen px-6 py-10 flex flex-col overflow-hidden bg-background"
    >
      <div className="absolute inset-0 z-0 opacity-[0.05]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </div>
      <motion.div className="absolute inset-0 z-0 opacity-40" style={{ maskImage, WebkitMaskImage: maskImage }}>
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-orange-500/40 dark:bg-orange-600/20 blur-[120px]" />
        <div className="absolute right-[10%] top-[-10%] w-[20%] h-[20%] rounded-full bg-primary/30 blur-[100px]" />
        <div className="absolute left-[-10%] bottom-[-20%] w-[40%] h-[40%] rounded-full bg-blue-500/40 dark:bg-blue-600/20 blur-[120px]" />
      </div>

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.025,
        }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 mx-auto max-w-[400px] w-full flex flex-col flex-1 justify-between"
      >
        <motion.div variants={itemVariants} className="pt-2">
          <ProfileSection
            name="Seb Montgomery"
            bio="Helping the world understand Crypto and Solana, one step at a time"
            imageUrl="/images/seb-pfp.png"
          />
        </motion.div>

        <motion.div className="space-y-3 py-8" variants={containerVariants}>
          {links.map((link) => (
            <motion.div key={link.title} variants={itemVariants}>
              <LinkCard {...link} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="pb-2">
          <SocialFooter />
        </motion.div>
      </motion.div>
    </main>
  )
}
