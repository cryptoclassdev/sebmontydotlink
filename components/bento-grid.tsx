"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { XIcon } from "./icons/x-icon"
import { TelegramIcon } from "./icons/telegram-icon"
import { YoutubeIcon } from "./icons/youtube-icon"
import { InfinexIcon } from "./icons/infinex-icon"
import { KastIcon } from "./icons/kast-icon"
import { CardContainer, CardBody } from "./ui/3d-card"
import { WobbleCard } from "./ui/wobble-card"
import { EmailSignupModal } from "./email-signup-modal"
import { CTAButton } from "./ui/cta-button"

// Brand colors from Figma
const brandColors = {
  navy: "#2d3c59",
  skyBlue: "#74b4e2",
  golden: "#e5ba41",
  sage: "#94a378",
  coral: "#d1855c",
}

// Primary social links for profile card with brand colors
const profileSocialLinks = [
  { title: "X/Twitter", icon: XIcon, href: "https://x.com/SebMontgomery", color: brandColors.skyBlue },
  { title: "YouTube", icon: YoutubeIcon, href: "https://youtube.com/@SebMontgomery", color: brandColors.coral },
  { title: "Telegram", icon: TelegramIcon, href: "https://t.me", color: brandColors.golden },
]

// All referrals - unified list with badges and brand colors
const allReferrals = [
  {
    name: "Infinex Referral",
    href: "https://infinex.xyz",
    badge: "Super Bullish",
    badgeColor: brandColors.coral,
    icon: <InfinexIcon size={36} />,
    highlighted: true, // Discord nameplate effect
  },
  {
    name: "Kast Referral",
    href: "https://kast.gg",
    badge: "My Personal Card",
    badgeColor: brandColors.golden,
    icon: <KastIcon size={36} />,
    highlighted: true, // Discord nameplate effect
  },
  { name: "Kamino Finance", href: "https://swap.kamino.finance/?ref=SEBMONTY", logo: "/referral-logos/kmno.png", badge: "DeFi", badgeColor: brandColors.sage },
  { name: "Ranger Finance", href: "https://www.app.ranger.finance/?ref_code=sebmonty", logo: "/referral-logos/ranger-finance.svg", badge: "Perps", badgeColor: brandColors.skyBlue },
  { name: "Binance", href: "https://www.binance.com/en/activity/referral/offers/claim?ref=CPA_00R34Q8Y0Q", logo: "/referral-logos/binance-logo.png", badge: "Exchange", badgeColor: brandColors.golden },
  { name: "Bluefin", href: "https://trade.bluefin.io/referral/v2-84kt7k", logo: "/referral-logos/bluefin.jpeg", badge: "Perps", badgeColor: brandColors.skyBlue },
  { name: "Bybit", href: "https://www.bybit.com/invite?ref=JAW8RO", logo: "/referral-logos/bybit-logo.png", badge: "Exchange", badgeColor: brandColors.golden },
  { name: "Hawk Fi", href: "https://www.hawkfi.ag/", logo: "/referral-logos/hawkfi.png", badge: "Yield", badgeColor: brandColors.sage },
  { name: "Huma Finance", href: "https://app.huma.finance/?ref=bwECKU", logo: "/referral-logos/huma.jpeg", badge: "PayFi", badgeColor: brandColors.coral },
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
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 28,
      mass: 0.8,
    },
  },
}

export function BentoGrid() {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  return (
    <>
    <motion.div
      id="main-content"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen lg:h-screen lg:max-h-screen bg-[#0a0a0a] p-4 md:p-8 lg:p-[clamp(1rem,2vh,3rem)] relative overflow-hidden flex items-center justify-center"
    >
      {/* Background ambient effects - Brand colored */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Brand gradient - coral/golden warm glow from top */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(209,133,92,0.08),transparent)]" />
        {/* Sky blue accent from bottom right */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_90%_90%,rgba(116,180,226,0.05),transparent)]" />
        {/* Golden accent from bottom left */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_80%,rgba(229,186,65,0.04),transparent)]" />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,transparent_20%,rgba(0,0,0,0.4))]" />

        {/* Animated stars with brand colors */}
        {/* Coral stars */}
        <div className="absolute w-[0.1875rem] h-[0.1875rem] bg-[#d1855c]/60 rounded-full top-[8%] left-[22%] animate-pulse [animation-duration:2.8s] shadow-[0_0_6px_rgba(209,133,92,0.4)]" />
        <div className="absolute w-1 h-1 bg-[#d1855c]/50 rounded-full top-[65%] right-[22%] animate-pulse [animation-duration:3.8s] [animation-delay:0.7s] shadow-[0_0_4px_rgba(209,133,92,0.3)]" />

        {/* Sky blue stars */}
        <div className="absolute w-1 h-1 bg-[#74b4e2]/55 rounded-full top-[18%] right-[12%] animate-pulse [animation-duration:3.2s] [animation-delay:0.4s] shadow-[0_0_5px_rgba(116,180,226,0.3)]" />
        <div className="absolute w-[0.1875rem] h-[0.1875rem] bg-[#74b4e2]/45 rounded-full top-[55%] left-[85%] animate-pulse [animation-duration:3.5s] [animation-delay:0.9s] shadow-[0_0_6px_rgba(116,180,226,0.35)]" />

        {/* Golden stars */}
        <div className="absolute w-1 h-1 bg-[#e5ba41]/50 rounded-full top-[32%] left-[58%] animate-pulse [animation-duration:4s] [animation-delay:0.5s] shadow-[0_0_4px_rgba(229,186,65,0.3)]" />
        <div className="absolute w-0.5 h-0.5 bg-[#e5ba41]/40 rounded-full top-[75%] left-[28%] animate-pulse [animation-duration:4.5s] [animation-delay:0.2s]" />

        {/* Sage green stars */}
        <div className="absolute w-0.5 h-0.5 bg-[#94a378]/45 rounded-full bottom-[18%] right-[45%] animate-pulse [animation-duration:4.2s] [animation-delay:1.1s]" />
        <div className="absolute w-0.5 h-0.5 bg-[#94a378]/35 rounded-full top-[42%] left-[8%] animate-pulse [animation-duration:5s] [animation-delay:0.15s]" />

        {/* Subtle white stars for balance */}
        <div className="absolute w-0.5 h-0.5 bg-white/18 rounded-full top-[88%] left-[72%] animate-pulse [animation-duration:5.5s] [animation-delay:1.3s]" />
        <div className="absolute w-0.5 h-0.5 bg-white/22 rounded-full top-[25%] left-[42%] animate-pulse [animation-duration:4.8s] [animation-delay:0.6s]" />
        <div className="absolute w-0.5 h-0.5 bg-white/16 rounded-full bottom-[35%] left-[92%] animate-pulse [animation-duration:5.2s] [animation-delay:0.85s]" />
      </div>

      {/* Desktop Layout - 3 Columns (4-4-3 = 11 cols) - Viewport contained, centered */}
      <div className="max-w-[85rem] w-full mx-auto hidden lg:grid lg:grid-cols-11 gap-[clamp(1rem,2vh,1.5rem)] h-full max-h-[calc(100vh-clamp(3rem,6vh,8rem))]">
        {/* ============================================
            COLUMN 1 (Left) - Profile + Communication Link
            ============================================ */}
        <div className="lg:col-span-4 flex flex-col gap-[clamp(1rem,2vh,1.5rem)] min-h-0">
          {/* Hero Card with 3D Effect - PRIMARY focal point, larger */}
          <motion.div variants={itemVariants} className="w-full flex-[1.6] min-h-0">
            <CardContainer className="h-full">
              <CardBody className="relative rounded-[2rem] overflow-hidden border-[2.5px] border-white shadow-lg w-full h-full min-h-0">
                {/* Full bleed image */}
                <Image
                  src="/images/design-mode/seb-new-dp_nkb9tp.png"
                  alt="Seb Montgomery"
                  fill
                  className="object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
                  priority
                />
                {/* Gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Overlaid content at bottom */}
                <div className="absolute inset-x-0 bottom-0 px-6 pb-6 lg:px-8 lg:pb-8 text-center space-y-4">
                  <div className="space-y-1">
                    {/* Typography: using clamp for responsive sizing */}
                    <h1 className="text-[clamp(1.5rem,4vw,1.875rem)] font-bold text-white lowercase tracking-tight leading-tight drop-shadow-lg">seb montgomery</h1>
                    <p className="text-sm lg:text-base text-white/80">Crypto Content Creator</p>
                  </div>

                  {/* Social Icons - Integrated into profile card with brand colors */}
                  <div className="flex justify-center gap-4">
                    {profileSocialLinks.map((social) => (
                      <a
                        key={social.title}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-md border-2 hover:scale-110 transition-all duration-200"
                        style={{
                          backgroundColor: `${social.color}50`,
                          borderColor: `${social.color}90`,
                          boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 ${social.color}60, 0 0 20px ${social.color}30`,
                        }}
                        aria-label={social.title}
                      >
                        <div className="brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">
                          <social.icon size={26} />
                        </div>
                        {/* Hover glow effect */}
                        <div
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
                          style={{ backgroundColor: `${social.color}70` }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </CardBody>
            </CardContainer>
          </motion.div>

          {/* Communication Link Card - Tertiary (lower hierarchy), minimal, dark - identical size to Fogees Hub */}
          <motion.div variants={itemVariants} className="w-full h-[clamp(11.25rem,24vh,16.25rem)] flex-shrink-0">
            <WobbleCard containerClassName="h-full rounded-xl">
              <a href="https://thecommunication.link" target="_blank" rel="noopener noreferrer" className="flex flex-col h-full bg-[#141414] rounded-xl p-[clamp(0.375rem,0.75vh,0.625rem)] border-[0.125rem] border-white/10 hover:border-white/25 transition-all duration-200 group">
                {/* Header - Compact */}
                <div className="flex items-center gap-2 mb-[clamp(0.125rem,0.375vh,0.375rem)]">
                  <Image src="/images/seb-pfp.png" alt="Communication Link" width={24} height={24} className="rounded-full flex-shrink-0 ring-1 ring-white/10" />
                  <div className="space-y-0">
                    <h3 className="text-xs lg:text-[13px] font-semibold text-white leading-tight">Founder of thecommunication.link</h3>
                    <p className="text-[10px] text-white/50">Content & Branding Consultancy</p>
                  </div>
                </div>
                {/* Image - compact */}
                <div className="rounded-md overflow-hidden ring-1 ring-white/5 flex-1 min-h-0">
                  <Image src="/communication-mockup.png" alt="Communication Link preview" width={420} height={180} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                </div>
              </a>
            </WobbleCard>
          </motion.div>
        </div>

        {/* ============================================
            COLUMN 2 (Middle) - CTA + Validator + Fogees
            ============================================ */}
        <div className="lg:col-span-4 flex flex-col gap-[clamp(1rem,2vh,1.5rem)] min-h-0">
          {/* Join the Private Group CTA - shares height with Validator */}
          <motion.div variants={itemVariants} className="w-full flex-1 min-h-0">
            <div className="h-full w-full">
              <CTAButton onClick={() => setIsEmailModalOpen(true)} className="h-full" />
            </div>
          </motion.div>

          {/* Validator Card - shares height with CTA */}
          <motion.div variants={itemVariants} className="w-full flex-1 min-h-0">
            <WobbleCard containerClassName="h-full rounded-xl">
              <a href="https://validator.com" target="_blank" rel="noopener noreferrer" className="flex flex-col h-full bg-[#f1f1f1] rounded-xl p-[clamp(0.5rem,1vh,0.75rem)] border-[0.125rem] border-white/0 hover:border-white/40 transition-all duration-200 group">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-[clamp(0.25rem,0.5vh,0.5rem)]">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                    <div className="flex gap-[0.09375rem]">
                      <div className="w-[0.3125rem] h-[0.3125rem] bg-[#1a1a40] rounded-[0.0625rem]" />
                      <div className="w-[0.3125rem] h-[0.3125rem] bg-[#28c2ec] rounded-[0.0625rem]" />
                      <div className="w-[0.3125rem] h-[0.3125rem] bg-[#ec5228] rounded-[0.0625rem]" />
                    </div>
                  </div>
                  <div className="space-y-0">
                    <h3 className="text-sm lg:text-[15px] font-semibold text-black leading-tight">Co-Founder of validator.com</h3>
                    <p className="text-[11px] text-black/60">Stake your SOL with us</p>
                  </div>
                </div>
                {/* Image - fills remaining space */}
                <div className="rounded-lg overflow-hidden flex-1 min-h-0">
                  <Image src="/validator-mockup.png" alt="validator.com-mockup" width={420} height={180} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                </div>
              </a>
            </WobbleCard>
          </motion.div>

          {/* Fogees Hub Card - Tertiary (lower hierarchy), identical size to Communication Link */}
          <motion.div variants={itemVariants} className="w-full h-[clamp(11.25rem,24vh,16.25rem)] flex-shrink-0">
            <WobbleCard containerClassName="h-full rounded-xl">
              <a href="https://fogees.link" target="_blank" rel="noopener noreferrer" className="flex flex-col h-full bg-[#141414] rounded-xl p-[clamp(0.375rem,0.75vh,0.625rem)] border-[0.125rem] border-white/10 hover:border-white/25 transition-all duration-200 group">
                {/* Header - Compact */}
                <div className="flex items-center gap-2 mb-[clamp(0.125rem,0.375vh,0.375rem)]">
                  <Image src="/fogees-logo.png" alt="Fogees Hub" width={24} height={24} className="rounded-full flex-shrink-0 ring-1 ring-white/10" />
                  <div className="space-y-0">
                    <h3 className="text-xs lg:text-[13px] font-semibold text-white leading-tight">Co-Founder of Fogees Hub</h3>
                    <p className="text-[10px] text-white/50">Your Educational Fogo Chain Hub</p>
                  </div>
                </div>
                {/* Image - compact */}
                <div className="rounded-md overflow-hidden ring-1 ring-white/5 flex-1 min-h-0">
                  <Image src="/fogees-mockup.png" alt="fogees hub mockup" width={420} height={180} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                </div>
              </a>
            </WobbleCard>
          </motion.div>
        </div>

        {/* ============================================
            COLUMN 3 (Right) - Links Card (narrower)
            ============================================ */}
        <div className="lg:col-span-3 flex flex-col gap-[clamp(1rem,2vh,1.5rem)] min-h-0">
          {/* Links Card - Dark theme with 3D hover effect */}
          <motion.div variants={itemVariants} className="flex-1 min-h-0">
            <CardContainer className="h-full">
              <CardBody className="bg-[#141414] rounded-2xl p-[clamp(0.75rem,1.5vh,1.5rem)] border-[0.125rem] border-white/10 h-full overflow-hidden flex flex-col justify-center">
                {/* All Referrals - centrally aligned with heading */}
                <div className="flex flex-col gap-[clamp(0.5rem,1vh,0.75rem)]">
                  <h3 className="text-lg font-bold text-white">Links & Referrals</h3>
                    {allReferrals.map((referral) => {
                      const isHighlighted = 'highlighted' in referral && referral.highlighted
                      return (
                      <a
                        key={referral.name}
                        href={referral.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between px-[clamp(0.75rem,1.5vh,1rem)] py-[clamp(0.5rem,1vh,0.75rem)] min-h-[clamp(2.5rem,5vh,3.25rem)] rounded-full bg-white/10 backdrop-blur-sm border-[0.125rem] border-white/10 hover:border-white/25 hover:bg-white/15 transition-all duration-200 group ${isHighlighted ? 'discord-nameplate' : ''}`}
                      >
                        {isHighlighted && <div className="discord-shimmer" />}
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {referral.icon ? (
                            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                              {referral.icon}
                            </div>
                          ) : referral.logo ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                              <Image src={referral.logo} alt={referral.name} width={32} height={32} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-white/20 flex items-center justify-center">
                              <span className="text-white font-bold text-xs">{referral.name.charAt(0)}</span>
                            </div>
                          )}
                          <span className="font-bold text-white text-sm truncate">{referral.name}</span>
                        </div>
                        <span
                          className="px-2.5 py-1.5 text-white text-[10px] font-bold rounded-full whitespace-nowrap flex-shrink-0"
                          style={{
                            backgroundColor: `${referral.badgeColor}30`,
                            borderWidth: '1px',
                            borderColor: `${referral.badgeColor}60`,
                          }}
                        >
                          {referral.badge}
                        </span>
                      </a>
                    )})}
                </div>
              </CardBody>
            </CardContainer>
          </motion.div>
        </div>
      </div>

      {/* Mobile Layout - Optimized for thumb-friendly zones (Fitts's Law) */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-6 lg:hidden pb-8">
        {/* 1. CTA - PRIMARY FOCAL POINT with whitespace isolation (comes first on mobile) */}
        <motion.div variants={itemVariants} className="py-2 px-1">
          <CTAButton onClick={() => setIsEmailModalOpen(true)} />
        </motion.div>

        {/* 2. Seb Montgomery Profile with Badges - Seamless design */}
        <motion.div variants={itemVariants}>
          <CardContainer className="w-full">
            <CardBody className="relative rounded-[2rem] overflow-hidden border-[2.5px] border-white shadow-lg w-full aspect-[3/4]">
              {/* Full bleed image */}
              <Image src="/images/design-mode/seb-new-dp_nkb9tp.png" alt="Seb Montgomery" fill className="object-cover object-top transition-transform duration-500" priority />
              {/* Gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Overlaid content at bottom */}
              <div className="absolute inset-x-0 bottom-0 px-5 pb-6 text-center space-y-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-white lowercase tracking-tight drop-shadow-lg">seb montgomery</h1>
                  <p className="text-sm text-white/80">Crypto Content Creator</p>
                </div>

                {/* Social Icons - Integrated into profile card with brand colors */}
                <div className="flex justify-center gap-4">
                  {profileSocialLinks.map((social) => (
                    <a
                      key={social.title}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-center w-14 h-14 rounded-full backdrop-blur-md border-2 active:scale-95 transition-all duration-150"
                      style={{
                        backgroundColor: `${social.color}50`,
                        borderColor: `${social.color}90`,
                        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 ${social.color}60, 0 0 20px ${social.color}30`,
                      }}
                      aria-label={social.title}
                    >
                      <div className="brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">
                        <social.icon size={28} />
                      </div>
                      {/* Hover glow effect */}
                      <div
                        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
                        style={{ backgroundColor: `${social.color}70` }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            </CardBody>
          </CardContainer>
        </motion.div>

        {/* 4. Validator - Minimal tertiary card */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-xl">
            <a href="https://validator.com" target="_blank" rel="noopener noreferrer" className="flex flex-col bg-[#f1f1f1] rounded-xl p-[1rem] border-[0.125rem] border-white/0 hover:border-white/40 active:scale-[0.98] transition-all duration-150 h-[clamp(11.25rem,24vh,16.25rem)]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                  <div className="flex gap-[0.09375rem]">
                    <div className="w-[0.3125rem] h-[0.3125rem] bg-[#1a1a40] rounded-[0.0625rem]" />
                    <div className="w-[0.3125rem] h-[0.3125rem] bg-[#28c2ec] rounded-[0.0625rem]" />
                    <div className="w-[0.3125rem] h-[0.3125rem] bg-[#ec5228] rounded-[0.0625rem]" />
                  </div>
                </div>
                <div className="space-y-0">
                  <h3 className="text-base font-semibold text-black leading-tight">Co-Founder of validator.com</h3>
                  <p className="text-[11px] text-black/60">Stake your SOL with us</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden relative flex-1 min-h-0">
                <Image src="/validator-mockup.png" alt="validator.com-mockup" fill className="object-cover" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 5. Fogees Hub - Minimal tertiary card, dark */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-xl">
            <a href="https://fogees.link" target="_blank" rel="noopener noreferrer" className="flex flex-col bg-[#141414] rounded-xl p-[1rem] border-[0.125rem] border-white/10 hover:border-white/25 active:scale-[0.98] transition-all duration-150 h-[clamp(11.25rem,24vh,16.25rem)]">
              <div className="flex items-center gap-2.5 mb-3">
                <Image src="/fogees-logo.png" alt="Fogees Hub" width={32} height={32} className="rounded-full flex-shrink-0 ring-1 ring-white/10" />
                <div className="space-y-0">
                  <h3 className="text-base font-semibold text-white leading-tight">Co-Founder of Fogees Hub</h3>
                  <p className="text-[11px] text-white/50">Your Educational Fogo Chain Hub</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden ring-1 ring-white/5 relative flex-1 min-h-0">
                <Image src="/fogees-mockup.png" alt="fogees hub mockup" fill className="object-cover" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 6. Communication Link - Minimal tertiary card */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-xl">
            <a href="https://thecommunication.link" target="_blank" rel="noopener noreferrer" className="flex flex-col bg-[#f1f1f1] rounded-xl p-[1rem] border-[0.125rem] border-white/0 hover:border-white/40 active:scale-[0.98] transition-all duration-150 h-[clamp(11.25rem,24vh,16.25rem)]">
              <div className="flex items-center gap-2.5 mb-3">
                <Image src="/images/seb-pfp.png" alt="Communication Link" width={32} height={32} className="rounded-full flex-shrink-0 shadow-sm" />
                <div className="space-y-0">
                  <h3 className="text-base font-semibold text-black leading-tight">Founder of thecommunication.link</h3>
                  <p className="text-[11px] text-black/60">Content & Branding Consultancy</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden relative flex-1 min-h-0">
                <Image src="/communication-mockup.png" alt="Communication Link preview" fill className="object-cover" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 7. All Referrals - Show all links */}
        <motion.div variants={itemVariants}>
          <div className="bg-[#141414] rounded-2xl p-5 border-[0.125rem] border-white/10">
            <h3 className="text-base font-bold text-white mb-4">Links & Referrals</h3>
            <div className="space-y-3">
              {allReferrals.map((referral) => {
                const isHighlighted = 'highlighted' in referral && referral.highlighted
                return (
                <a
                  key={referral.name}
                  href={referral.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between px-4 py-3 min-h-[3.25rem] rounded-full bg-white/10 backdrop-blur-sm border-[0.125rem] border-white/10 hover:border-white/25 hover:bg-white/15 active:scale-[0.98] transition-all duration-150 group ${isHighlighted ? 'discord-nameplate' : ''}`}
                >
                  {isHighlighted && <div className="discord-shimmer" />}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {referral.icon ? (
                      <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                        {referral.icon}
                      </div>
                    ) : referral.logo ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                        <Image src={referral.logo || "/placeholder.svg"} alt={referral.name} width={36} height={36} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full flex-shrink-0 bg-white/20 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{referral.name.charAt(0)}</span>
                      </div>
                    )}
                    <span className="font-bold text-white text-sm truncate">
                      {referral.name}
                    </span>
                  </div>
                  <span
                    className="px-3 py-1.5 text-white text-[10px] font-bold rounded-full whitespace-nowrap flex-shrink-0"
                    style={{
                      backgroundColor: `${referral.badgeColor}30`,
                      borderWidth: '1px',
                      borderColor: `${referral.badgeColor}60`,
                    }}
                  >
                    {referral.badge}
                  </span>
                </a>
              )})}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>

    <EmailSignupModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </>
  )
}
