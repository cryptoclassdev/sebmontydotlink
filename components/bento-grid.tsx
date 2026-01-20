"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { ExternalLink, ChevronDown } from "lucide-react"
import { XIcon } from "./icons/x-icon"
import { TelegramIcon } from "./icons/telegram-icon"
import { YoutubeIcon } from "./icons/youtube-icon"
import { InfinexIcon } from "./icons/infinex-icon"
import { KastIcon } from "./icons/kast-icon"
import { CardContainer, CardBody } from "./ui/3d-card"
import { WobbleCard } from "./ui/wobble-card"
import { EmailSignupModal } from "./email-signup-modal"
import { CTAButton } from "./ui/cta-button"

// Primary social links for profile card
const profileSocialLinks = [
  { title: "X/Twitter", icon: XIcon, href: "https://x.com/SebMontgomery" },
  { title: "YouTube", icon: YoutubeIcon, href: "https://youtube.com/@SebMontgomery" },
  { title: "Telegram", icon: TelegramIcon, href: "https://t.me" },
]

// Featured referrals (highlighted at top) - Hick's Law: Limited to 2 primary options
const featuredReferrals = [
  {
    name: "Infinex Referral",
    href: "https://infinex.xyz",
    badge: "Super Bullish",
    icon: <InfinexIcon size={36} />,
    iconBg: "transparent",
  },
  {
    name: "Kast Referral",
    href: "https://kast.gg",
    badge: "My Personal Card",
    icon: <KastIcon size={36} />,
    iconBg: "transparent",
  },
]

// Other referrals with logos - pill-shaped like featured referrals
const otherReferrals = [
  { name: "Kamino Finance", href: "https://swap.kamino.finance/?ref=SEBMONTY", logo: "/referral-logos/kmno.png" },
  { name: "Ranger Finance", href: "https://www.app.ranger.finance/?ref_code=sebmonty", logo: "/referral-logos/ranger-finance.svg" },
  { name: "Binance", href: "https://www.binance.com/en/activity/referral/offers/claim?ref=CPA_00R34Q8Y0Q", logo: "/referral-logos/binance-logo.png" },
  { name: "Bluefin", href: "https://trade.bluefin.io/referral/v2-84kt7k", logo: "/referral-logos/bluefin.jpeg" },
  { name: "Bybit", href: "https://www.bybit.com/invite?ref=JAW8RO", logo: "/referral-logos/bybit-logo.png" },
  { name: "Hawk Fi", href: "https://www.hawkfi.ag/", logo: "/referral-logos/hawkfi.png" },
  { name: "Huma Finance", href: "https://app.huma.finance/?ref=bwECKU", logo: "/referral-logos/huma.jpeg" },
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
  // Progressive disclosure for mobile - Hick's Law: Show only 4 referrals initially
  const [showAllReferrals, setShowAllReferrals] = useState(false)

  // Mobile: use progressive disclosure (4 items initially)
  const visibleReferrals = showAllReferrals ? otherReferrals : otherReferrals.slice(0, 4)

  return (
    <>
    <motion.div
      id="main-content"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen lg:h-screen lg:max-h-screen bg-[#0a0a0a] p-4 md:p-8 lg:p-[clamp(1rem,2vh,3rem)] relative overflow-hidden flex items-center justify-center"
    >
      {/* Background ambient effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Subtle radial gradient for depth - warm center glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.035),transparent)]" />
        {/* Secondary gradient for bottom depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_120%,rgba(255,255,255,0.015),transparent)]" />
        {/* Soft vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,transparent_20%,rgba(0,0,0,0.4))]" />

        {/* Animated stars with varied sizes, opacity, and timing - layered for depth */}
        {/* Bright foreground stars */}
        <div className="absolute w-[3px] h-[3px] bg-white/50 rounded-full top-[8%] left-[22%] animate-pulse [animation-duration:2.8s] shadow-[0_0_4px_rgba(255,255,255,0.3)]" />
        <div className="absolute w-1 h-1 bg-white/45 rounded-full top-[18%] right-[12%] animate-pulse [animation-duration:3.2s] [animation-delay:0.4s] shadow-[0_0_3px_rgba(255,255,255,0.2)]" />
        <div className="absolute w-[3px] h-[3px] bg-white/40 rounded-full top-[55%] left-[85%] animate-pulse [animation-duration:3.5s] [animation-delay:0.9s] shadow-[0_0_4px_rgba(255,255,255,0.25)]" />

        {/* Mid-layer stars */}
        <div className="absolute w-1 h-1 bg-white/35 rounded-full top-[32%] left-[58%] animate-pulse [animation-duration:4s] [animation-delay:0.5s]" />
        <div className="absolute w-0.5 h-0.5 bg-white/30 rounded-full top-[75%] left-[28%] animate-pulse [animation-duration:4.5s] [animation-delay:0.2s]" />
        <div className="absolute w-1 h-1 bg-white/32 rounded-full top-[65%] right-[22%] animate-pulse [animation-duration:3.8s] [animation-delay:0.7s]" />
        <div className="absolute w-0.5 h-0.5 bg-white/28 rounded-full bottom-[18%] right-[45%] animate-pulse [animation-duration:4.2s] [animation-delay:1.1s]" />

        {/* Distant background stars */}
        <div className="absolute w-0.5 h-0.5 bg-white/20 rounded-full top-[42%] left-[8%] animate-pulse [animation-duration:5s] [animation-delay:0.15s]" />
        <div className="absolute w-0.5 h-0.5 bg-white/18 rounded-full top-[88%] left-[72%] animate-pulse [animation-duration:5.5s] [animation-delay:1.3s]" />
        <div className="absolute w-0.5 h-0.5 bg-white/22 rounded-full top-[25%] left-[42%] animate-pulse [animation-duration:4.8s] [animation-delay:0.6s]" />
        <div className="absolute w-0.5 h-0.5 bg-white/16 rounded-full bottom-[35%] left-[92%] animate-pulse [animation-duration:5.2s] [animation-delay:0.85s]" />
      </div>

      {/* Desktop Layout - 3 Columns (4-4-3 = 11 cols) - Viewport contained, centered */}
      <div className="max-w-[85rem] w-full mx-auto hidden lg:grid lg:grid-cols-11 gap-[clamp(0.75rem,1.5vh,1.25rem)] h-full max-h-[calc(100vh-clamp(2rem,4vh,6rem))]">
        {/* ============================================
            COLUMN 1 (Left) - Profile + Communication Link
            ============================================ */}
        <div className="lg:col-span-4 flex flex-col gap-[clamp(0.75rem,1.5vh,1.25rem)] min-h-0">
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

                  {/* Social Icons - Integrated into profile card */}
                  <div className="flex justify-center gap-3">
                    {profileSocialLinks.map((social) => (
                      <a
                        key={social.title}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-110 transition-all duration-200 shadow-lg"
                        aria-label={social.title}
                      >
                        <social.icon size={20} className="brightness-0 invert" />
                      </a>
                    ))}
                  </div>
                </div>
              </CardBody>
            </CardContainer>
          </motion.div>

          {/* Communication Link Card - Tertiary (lower hierarchy), minimal, dark */}
          <motion.div variants={itemVariants} className="w-full flex-[0.65] min-h-0">
            <WobbleCard containerClassName="h-full rounded-xl">
              <a href="https://thecommunication.link" target="_blank" rel="noopener noreferrer" className="flex flex-col h-full bg-[#141414] rounded-xl p-[clamp(0.375rem,0.75vh,0.625rem)] border-[2px] border-white/10 hover:border-white/25 transition-all duration-200 group">
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
        <div className="lg:col-span-4 flex flex-col gap-[clamp(0.75rem,1.5vh,1.25rem)] min-h-0">
          {/* Join the Private Group CTA - PRIMARY focal point with isolation for visual hierarchy */}
          <motion.div variants={itemVariants} className="w-full py-[clamp(0.5rem,1vh,1.5rem)] flex-shrink-0">
            <div className="h-full w-full flex items-center px-2">
              <CTAButton onClick={() => setIsEmailModalOpen(true)} />
            </div>
          </motion.div>

          {/* Validator Card - Tertiary, minimal, light */}
          <motion.div variants={itemVariants} className="w-full flex-1 min-h-0">
            <WobbleCard containerClassName="h-full rounded-xl">
              <a href="https://validator.com" target="_blank" rel="noopener noreferrer" className="flex flex-col h-full bg-[#f1f1f1] rounded-xl p-[clamp(0.5rem,1vh,0.875rem)] border-[2px] border-white/0 hover:border-white/40 transition-all duration-200 group">
                {/* Header - Minimal */}
                <div className="flex items-center gap-2.5 mb-[clamp(0.25rem,0.5vh,0.5rem)]">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                    <div className="flex gap-[1.5px]">
                      <div className="w-[5px] h-[5px] bg-[#1a1a40] rounded-[1px]" />
                      <div className="w-[5px] h-[5px] bg-[#28c2ec] rounded-[1px]" />
                      <div className="w-[5px] h-[5px] bg-[#ec5228] rounded-[1px]" />
                    </div>
                  </div>
                  <div className="space-y-0">
                    <h3 className="text-sm lg:text-[15px] font-semibold text-black leading-tight">Co-Founder of validator.com</h3>
                    <p className="text-[11px] text-black/60">Stake your SOL with us</p>
                  </div>
                </div>
                {/* Image - minimal */}
                <div className="rounded-lg overflow-hidden flex-1 min-h-0">
                  <Image src="/validator-mockup.png" alt="validator.com-mockup" width={420} height={180} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                </div>
              </a>
            </WobbleCard>
          </motion.div>

          {/* Fogees Hub Card - Tertiary (lower hierarchy, matches Communication Link), minimal, dark */}
          <motion.div variants={itemVariants} className="w-full flex-[0.65] min-h-0">
            <WobbleCard containerClassName="h-full rounded-xl">
              <a href="https://fogees.link" target="_blank" rel="noopener noreferrer" className="flex flex-col h-full bg-[#141414] rounded-xl p-[clamp(0.375rem,0.75vh,0.625rem)] border-[2px] border-white/10 hover:border-white/25 transition-all duration-200 group">
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
        <div className="lg:col-span-3 flex flex-col gap-[clamp(0.75rem,1.5vh,1.25rem)] min-h-0">
          {/* Links Card - Dark theme */}
          <motion.div variants={itemVariants} className="flex-1 min-h-0">
            <div className="bg-[#141414] rounded-2xl p-[clamp(0.75rem,1.5vh,1.5rem)] border-[2px] border-white/10 h-full overflow-hidden flex flex-col">
              <div className="flex flex-col min-h-0 h-full overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-[clamp(0.75rem,1.5vh,1.25rem)] flex-shrink-0">Links & Referrals</h3>

                {/* Featured/Highlighted Referrals */}
                <div className="space-y-[clamp(0.5rem,1vh,0.75rem)] mb-[clamp(0.75rem,1.5vh,1.5rem)] flex-shrink-0">
                  {featuredReferrals.map((referral) => (
                    <WobbleCard key={referral.name} containerClassName="rounded-full">
                      <a
                        href={referral.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/10 backdrop-blur-sm rounded-full px-[clamp(0.75rem,1.5vh,1rem)] py-[clamp(0.5rem,1vh,0.875rem)] min-h-[clamp(40px,5vh,52px)] flex items-center justify-between gap-2 border-[2px] border-white/10 hover:border-white/25 hover:bg-white/15 transition-all duration-200"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            {referral.icon}
                          </div>
                          <span className="font-bold text-white text-sm truncate">{referral.name}</span>
                        </div>
                        <span className="px-2.5 py-1.5 bg-white/20 text-white text-[10px] font-bold rounded-full whitespace-nowrap border border-white/20 flex-shrink-0">
                          {referral.badge}
                        </span>
                      </a>
                    </WobbleCard>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-[clamp(0.75rem,1.5vh,1.25rem)] flex-shrink-0" />

                {/* Other Referrals List - Pill shaped with logos like featured */}
                <div className="relative flex-1 min-h-0">
                  <div className="space-y-[clamp(0.5rem,1vh,0.75rem)]">
                    {otherReferrals.map((referral) => (
                      <a
                        key={referral.name}
                        href={referral.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-[clamp(0.75rem,1.5vh,1rem)] py-[clamp(0.5rem,1vh,0.75rem)] min-h-[clamp(40px,5vh,52px)] rounded-full bg-white/10 backdrop-blur-sm border-[2px] border-white/10 hover:border-white/25 hover:bg-white/15 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          {referral.logo ? (
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                              <Image src={referral.logo || "/placeholder.svg"} alt={referral.name} width={36} height={36} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full flex-shrink-0 bg-white/20 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{referral.name.charAt(0)}</span>
                            </div>
                          )}
                          <span className="font-semibold text-white text-sm group-hover:text-white transition-colors duration-150">
                            {referral.name}
                          </span>
                        </div>
                        <ExternalLink size={16} className="text-white/40 group-hover:text-white/70 transition-colors duration-150" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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

                {/* Social Icons - Integrated into profile card */}
                <div className="flex justify-center gap-3">
                  {profileSocialLinks.map((social) => (
                    <a
                      key={social.title}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 active:scale-95 transition-all duration-150 shadow-lg"
                      aria-label={social.title}
                    >
                      <social.icon size={22} className="brightness-0 invert" />
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
            <a href="https://validator.com" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-xl p-4 border-[2px] border-white/0 hover:border-white/40 active:scale-[0.98] transition-all duration-150">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                  <div className="flex gap-[1.5px]">
                    <div className="w-[5px] h-[5px] bg-[#1a1a40] rounded-[1px]" />
                    <div className="w-[5px] h-[5px] bg-[#28c2ec] rounded-[1px]" />
                    <div className="w-[5px] h-[5px] bg-[#ec5228] rounded-[1px]" />
                  </div>
                </div>
                <div className="space-y-0">
                  <h3 className="text-base font-semibold text-black leading-tight">Co-Founder of validator.com</h3>
                  <p className="text-[11px] text-black/60">Stake your SOL with us</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/validator-mockup.png" alt="validator.com-mockup" width={420} height={200} className="w-full h-auto" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 5. Fogees Hub - Minimal tertiary card, dark */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-xl">
            <a href="https://fogees.link" target="_blank" rel="noopener noreferrer" className="block bg-[#141414] rounded-xl p-4 border-[2px] border-white/10 hover:border-white/25 active:scale-[0.98] transition-all duration-150">
              <div className="flex items-center gap-2.5 mb-3">
                <Image src="/fogees-logo.png" alt="Fogees Hub" width={32} height={32} className="rounded-full flex-shrink-0 ring-1 ring-white/10" />
                <div className="space-y-0">
                  <h3 className="text-base font-semibold text-white leading-tight">Co-Founder of Fogees Hub</h3>
                  <p className="text-[11px] text-white/50">Your Educational Fogo Chain Hub</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden ring-1 ring-white/5">
                <Image src="/fogees-mockup.png" alt="fogees hub mockup" width={420} height={200} className="w-full h-auto object-cover" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 6. Communication Link - Minimal tertiary card */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-xl">
            <a href="https://thecommunication.link" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-xl p-4 border-[2px] border-white/0 hover:border-white/40 active:scale-[0.98] transition-all duration-150">
              <div className="flex items-center gap-2.5 mb-3">
                <Image src="/images/seb-pfp.png" alt="Communication Link" width={32} height={32} className="rounded-full flex-shrink-0 shadow-sm" />
                <div className="space-y-0">
                  <h3 className="text-base font-semibold text-black leading-tight">Founder of thecommunication.link</h3>
                  <p className="text-[11px] text-black/60">Content & Branding Consultancy</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <Image src="/communication-mockup.png" alt="Communication Link preview" width={420} height={200} className="w-full h-auto object-cover" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 7. Featured Referrals - Fitts's Law: larger touch targets, dark theme */}
        <motion.div variants={itemVariants} className="space-y-3">
          {featuredReferrals.map((referral) => (
            <WobbleCard key={referral.name} containerClassName="rounded-full">
              <a
                href={referral.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-3.5 min-h-[56px] flex items-center justify-between border-[2px] border-white/10 hover:border-white/25 hover:bg-white/15 active:scale-[0.98] transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {referral.icon}
                  </div>
                  <span className="font-bold text-white text-base">{referral.name}</span>
                </div>
                <span className="px-4 py-2 bg-white/20 text-white text-xs font-bold rounded-full whitespace-nowrap border border-white/20">
                  {referral.badge}
                </span>
              </a>
            </WobbleCard>
          ))}
        </motion.div>

        {/* 8. Other Referrals Card - Progressive disclosure with Miller's Law, dark theme */}
        <motion.div variants={itemVariants}>
          <div className="bg-[#141414] rounded-2xl p-5 border-[2px] border-white/10">
            <h3 className="text-base font-bold text-white mb-4">More Referrals</h3>
            <div className="relative">
              <div className="space-y-3">
                {visibleReferrals.map((referral, index) => (
                  <motion.a
                    key={referral.name}
                    href={referral.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={index >= 4 ? { opacity: 0, height: 0 } : false}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex items-center justify-between px-4 py-3 min-h-[52px] rounded-full bg-white/10 backdrop-blur-sm border-[2px] border-white/10 hover:border-white/25 hover:bg-white/15 active:scale-[0.98] transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-3">
                      {referral.logo ? (
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                          <Image src={referral.logo || "/placeholder.svg"} alt={referral.name} width={36} height={36} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full flex-shrink-0 bg-white/20 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{referral.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-semibold text-white text-sm group-hover:text-white transition-colors">
                        {referral.name}
                      </span>
                    </div>
                    <ExternalLink size={16} className="text-white/40 group-hover:text-white/70 transition-colors" />
                  </motion.a>
                ))}
              </div>

              {/* Integrated expansion trigger */}
              {otherReferrals.length > 4 && !showAllReferrals && (
                <div className="relative">
                  <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-[#141414] to-transparent pointer-events-none" />
                  <button
                    onClick={() => setShowAllReferrals(true)}
                    className="w-full px-4 py-3 flex items-center gap-3 group active:scale-[0.98] transition-transform"
                  >
                    <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white/40 group-hover:text-white/70 transition-colors uppercase tracking-wider">
                      {otherReferrals.length - 4} more
                      <ChevronDown size={12} />
                    </span>
                    <span className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </button>
                </div>
              )}

              {/* Collapse trigger */}
              {otherReferrals.length > 4 && showAllReferrals && (
                <button
                  onClick={() => setShowAllReferrals(false)}
                  className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-xs font-medium text-white/30 hover:text-white/60 active:scale-[0.98] transition-all"
                >
                  <ChevronDown size={12} className="rotate-180" />
                  <span>Show less</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>

    <EmailSignupModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </>
  )
}
