"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { ExternalLink, ChevronDown } from "lucide-react"
import { LinkedinIcon } from "./icons/linkedin-icon"
import { XIcon } from "./icons/x-icon"
import { AtIcon } from "./icons/at-icon"
import { TelegramIcon } from "./icons/telegram-icon"
import { YoutubeIcon } from "./icons/youtube-icon"
import { SubstackIcon } from "./icons/substack-icon"
import { InfinexIcon } from "./icons/infinex-icon"
import { KastIcon } from "./icons/kast-icon"
import { KaitoIcon } from "./icons/kaito-icon"
import { FloatingDock } from "./ui/floating-dock"
import { CardContainer, CardBody } from "./ui/3d-card"
import { WobbleCard } from "./ui/wobble-card"
import { EmailSignupModal } from "./email-signup-modal"
import { CTAButton } from "./ui/cta-button"

const socialLinks = [
  { title: "LinkedIn", icon: <LinkedinIcon size={24} />, href: "https://linkedin.com" },
  { title: "X/Twitter", icon: <XIcon size={24} />, href: "https://x.com/SebMontgomery" },
  { title: "Threads", icon: <AtIcon size={24} />, href: "https://threads.net" },
  { title: "Telegram", icon: <TelegramIcon size={24} />, href: "https://t.me" },
  { title: "YouTube", icon: <YoutubeIcon size={24} />, href: "https://youtube.com/@SebMontgomery" },
  { title: "Substack", icon: <SubstackIcon size={24} />, href: "https://sebmonty.substack.com" },
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

// Other referrals - Miller's Law: Chunked into groups of 4 for better cognitive load
const otherReferrals = [
  { name: "Kaito", href: "https://portal.kaito.ai/auth/entry?referralCode=55E051CF" },
  { name: "Kamino Finance", href: "https://swap.kamino.finance/?ref=SEBMONTY" },
  { name: "Ranger Finance", href: "https://www.app.ranger.finance/?ref_code=sebmonty" },
  { name: "Binance", href: "https://www.binance.com/en/activity/referral/offers/claim?ref=CPA_00R34Q8Y0Q" },
  { name: "Bluefin", href: "https://trade.bluefin.io/referral/v2-84kt7k" },
  { name: "Bybit", href: "https://www.bybit.com/invite?ref=JAW8RO" },
  { name: "Hawk Fi", href: "https://www.hawkfi.ag/" },
  { name: "Huma Finance", href: "https://app.huma.finance/?ref=bwECKU" },
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
  // Progressive disclosure - Hick's Law: Show only 4 referrals initially
  const [showAllReferrals, setShowAllReferrals] = useState(false)
  const visibleReferrals = showAllReferrals ? otherReferrals : otherReferrals.slice(0, 4)

  return (
    <>
    <motion.div
      id="main-content"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 lg:p-12 relative overflow-hidden flex items-center justify-center"
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

      {/* Desktop Layout - 3 Columns */}
      <div className="max-w-[90rem] mx-auto hidden lg:grid lg:grid-cols-12 gap-5">
        {/* ============================================
            COLUMN 1 (Left) - Profile + Other Projects
            ============================================ */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Hero Card with 3D Effect + Badges - Primary focal point, seamless design */}
          <motion.div variants={itemVariants} className="flex-1">
            <CardContainer className="h-full">
              <CardBody className="relative rounded-[2rem] overflow-hidden border-[2.5px] border-white shadow-lg w-full h-full min-h-[24rem]">
                {/* Full bleed image */}
                <Image
                  src="https://res.cloudinary.com/di6zkr8of/image/upload/v1768296580/seb-new-dp_nkb9tp.png"
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

                  {/* Embedded Badges - Higher visual hierarchy, larger size */}
                  <div className="flex flex-wrap justify-center gap-2.5">
                    <a
                      href="https://validator.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-5 py-3 min-h-[48px] bg-white/95 backdrop-blur-sm text-black text-sm font-semibold rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                    >
                      <div className="flex gap-[2px]">
                        <div className="w-[7px] h-[7px] bg-[#1a1a40] rounded-[1px]" />
                        <div className="w-[7px] h-[7px] bg-[#28c2ec] rounded-[1px]" />
                        <div className="w-[7px] h-[7px] bg-[#ec5228] rounded-[1px]" />
                      </div>
                      Co-founder at validator.com
                    </a>
                    <a
                      href="https://fogees.link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-5 py-3 min-h-[48px] bg-white/95 backdrop-blur-sm text-black text-sm font-semibold rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                    >
                      <Image src="/fogees-logo.png" alt="" width={18} height={18} className="rounded-full" />
                      Co-founder at Fogees Hub
                    </a>
                  </div>
                </div>
              </CardBody>
            </CardContainer>
          </motion.div>

          {/* Other Projects Card - Proximity: tighter internal spacing */}
          <motion.div variants={itemVariants}>
            <WobbleCard containerClassName="rounded-2xl">
              <a
                href="https://thecommunication.link"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#f1f1f1] rounded-2xl p-5 lg:p-6 border-[2.5px] border-white/0 hover:border-white/40 transition-all duration-200 group"
              >
                {/* Header - Proximity: grouped elements with tight spacing */}
                <div className="flex items-center gap-3 mb-4">
                  <Image src="/images/seb-pfp.png" alt="Seb" width={40} height={40} className="rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs text-black/50 font-medium uppercase tracking-wider">Other Projects</p>
                    <h3 className="text-lg font-bold text-black leading-tight">Founder of thecommunication.link</h3>
                    <p className="text-xs text-black/70">Content & Branding Web 3 Consultancy</p>
                  </div>
                </div>
                {/* Image - Aesthetic-Usability: consistent border-radius */}
                <div className="rounded-xl overflow-hidden shadow-[inset_0_1px_4px_rgba(0,0,0,0.04)]">
                  <Image src="/communication-mockup.png" alt="Communication Link preview" width={420} height={240} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                </div>
              </a>
            </WobbleCard>
          </motion.div>
        </div>

        {/* ============================================
            COLUMN 2 (Middle) - CTA + Feature Cards
            Hick's Law: One clear primary CTA at top
            ============================================ */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Join the Private Group CTA - Primary focal point */}
          <motion.div variants={itemVariants}>
            <CTAButton onClick={() => setIsEmailModalOpen(true)} />
          </motion.div>

          {/* Co-founder at Validator Card - Consistent spacing & typography */}
          <motion.div variants={itemVariants} className="flex-1 min-h-[18rem]">
            <WobbleCard containerClassName="h-full rounded-2xl">
              <a href="https://validator.com" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-2xl p-5 lg:p-6 h-full border-[2.5px] border-white/0 hover:border-white/40 transition-all duration-200 group">
                {/* Header - Proximity: grouped elements */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                    <div className="flex gap-[2px]">
                      <div className="w-[7px] h-[7px] bg-[#1a1a40] rounded-[1px]" />
                      <div className="w-[7px] h-[7px] bg-[#28c2ec] rounded-[1px]" />
                      <div className="w-[7px] h-[7px] bg-[#ec5228] rounded-[1px]" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-lg lg:text-xl font-bold text-black leading-tight">Co-Founder of validator.com</h3>
                    <p className="text-xs text-black/70">Stake your SOL with us</p>
                  </div>
                </div>
                {/* Image - consistent border-radius */}
                <div className="mt-4 rounded-xl overflow-hidden shadow-[inset_0_1px_4px_rgba(0,0,0,0.04)]">
                  <Image src="/validator-mockup.png" alt="validator.com-mockup" width={420} height={240} className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.01]" />
                </div>
              </a>
            </WobbleCard>
          </motion.div>

          {/* Fogees Hub Card - Consistent styling */}
          <motion.div variants={itemVariants} className="flex-1 min-h-[18rem]">
            <WobbleCard containerClassName="h-full rounded-2xl">
              <a href="https://fogees.link" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-2xl p-5 lg:p-6 h-full border-[2.5px] border-white/0 hover:border-white/40 transition-all duration-200 group">
                {/* Header - Proximity: grouped elements */}
                <div className="flex items-center gap-3 mb-4">
                  <Image src="/fogees-logo.png" alt="Fogees Hub" width={40} height={40} className="rounded-full flex-shrink-0 shadow-sm" />
                  <div className="space-y-0.5">
                    <h3 className="text-lg lg:text-xl font-bold text-black leading-tight">Co-Founder of Fogees Hub</h3>
                    <p className="text-xs text-black/70">Your Educational Fogo Chain Hub</p>
                  </div>
                </div>
                {/* Image - consistent border-radius */}
                <div className="mt-4 rounded-xl overflow-hidden shadow-[inset_0_1px_4px_rgba(0,0,0,0.04)]">
                  <Image src="/fogees-mockup.png" alt="fogees hub mockup" width={420} height={240} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                </div>
              </a>
            </WobbleCard>
          </motion.div>
        </div>

        {/* ============================================
            COLUMN 3 (Right) - Social Icons + Links Card
            Jakob's Law: Familiar patterns for social links
            ============================================ */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Social Icons at Top - Jakob's Law: familiar social icon placement */}
          <motion.div variants={itemVariants} className="w-full">
            <FloatingDock items={socialLinks} desktopClassName="mx-0 w-full justify-evenly" />
          </motion.div>

          {/* Links Card - Miller's Law: chunked information */}
          <motion.div variants={itemVariants} className="flex-1">
            <div className="bg-[#f1f1f1] rounded-2xl p-5 lg:p-6 border-[2.5px] border-white h-full">
              <h3 className="text-lg font-bold text-black mb-5">Links & Referrals</h3>

              {/* Featured/Highlighted Referrals - Hick's Law: limited primary options */}
              <div className="space-y-3 mb-6">
                {featuredReferrals.map((referral) => (
                  <WobbleCard key={referral.name} containerClassName="rounded-full">
                    <a
                      href={referral.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-full px-4 py-3.5 min-h-[52px] flex items-center justify-between border-[2px] border-black/5 hover:border-black/15 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                          {referral.icon}
                        </div>
                        <span className="font-bold text-black text-base">{referral.name}</span>
                      </div>
                      <span className="px-4 py-2 bg-[#494949] text-white text-xs font-bold rounded-full whitespace-nowrap border border-white">
                        {referral.badge}
                      </span>
                    </a>
                  </WobbleCard>
                ))}
              </div>

              {/* Divider - Visual separation */}
              <div className="h-px bg-black/10 mb-5" />

              {/* Other Referrals List - Progressive disclosure with Fitts's Law touch targets */}
              <div className="space-y-1">
                {visibleReferrals.map((referral) => (
                  <a
                    key={referral.name}
                    href={referral.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-3 min-h-[48px] rounded-xl hover:bg-white/80 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-black/80 group-hover:text-black transition-colors duration-150">
                        {referral.name}
                      </span>
                      {referral.badge && (
                        <span className="px-2.5 py-1 bg-black/5 text-black/60 text-xs font-semibold rounded-full">
                          {referral.badge}
                        </span>
                      )}
                    </div>
                    <ExternalLink size={16} className="text-black/30 group-hover:text-black/60 transition-colors duration-150" />
                  </a>
                ))}
              </div>

              {/* Progressive disclosure toggle - Hick's Law */}
              {otherReferrals.length > 4 && (
                <button
                  onClick={() => setShowAllReferrals(!showAllReferrals)}
                  className="w-full mt-3 px-4 py-3 min-h-[48px] flex items-center justify-center gap-2 text-sm font-medium text-black/60 hover:text-black hover:bg-white/60 rounded-xl transition-all duration-200"
                >
                  <span>{showAllReferrals ? "Show less" : `Show ${otherReferrals.length - 4} more`}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${showAllReferrals ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Layout - Optimized for thumb-friendly zones (Fitts's Law) */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-6 lg:hidden pb-8">
        {/* 1. CTA - PRIMARY FOCAL POINT (comes first on mobile) */}
        <motion.div variants={itemVariants}>
          <CTAButton onClick={() => setIsEmailModalOpen(true)} />
        </motion.div>

        {/* 2. Seb Montgomery Profile with Badges - Seamless design */}
        <motion.div variants={itemVariants}>
          <CardContainer className="w-full">
            <CardBody className="relative rounded-[2rem] overflow-hidden border-[2.5px] border-white shadow-lg w-full aspect-[3/4]">
              {/* Full bleed image */}
              <Image src="https://res.cloudinary.com/di6zkr8of/image/upload/v1768296580/seb-new-dp_nkb9tp.png" alt="Seb Montgomery" fill className="object-cover object-top transition-transform duration-500" priority />
              {/* Gradient overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Overlaid content at bottom */}
              <div className="absolute inset-x-0 bottom-0 px-5 pb-6 text-center space-y-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-white lowercase tracking-tight drop-shadow-lg">seb montgomery</h1>
                  <p className="text-sm text-white/80">Crypto Content Creator</p>
                </div>

                {/* Embedded Badges - Higher visual hierarchy, larger size */}
                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href="https://validator.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[46px] bg-white/95 backdrop-blur-sm text-black text-sm font-semibold rounded-full hover:bg-white active:scale-[0.97] transition-all duration-150 shadow-lg"
                  >
                    <div className="flex gap-[2px]">
                      <div className="w-[6px] h-[6px] bg-[#1a1a40] rounded-[1px]" />
                      <div className="w-[6px] h-[6px] bg-[#28c2ec] rounded-[1px]" />
                      <div className="w-[6px] h-[6px] bg-[#ec5228] rounded-[1px]" />
                    </div>
                    Co-founder at validator.com
                  </a>
                  <a
                    href="https://fogees.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[46px] bg-white/95 backdrop-blur-sm text-black text-sm font-semibold rounded-full hover:bg-white active:scale-[0.97] transition-all duration-150 shadow-lg"
                  >
                    <Image src="/fogees-logo.png" alt="" width={16} height={16} className="rounded-full" />
                    Co-founder at Fogees Hub
                  </a>
                </div>
              </div>
            </CardBody>
          </CardContainer>
        </motion.div>

        {/* 3. Social Footer - Jakob's Law: familiar social link placement */}
        <motion.div variants={itemVariants}>
          <FloatingDock items={socialLinks} desktopClassName="mx-0 w-full justify-evenly" />
        </motion.div>

        {/* 4. Validator - Consistent card styling */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-2xl">
            <a href="https://validator.com" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-2xl p-5 border-[2.5px] border-white/0 hover:border-white/40 active:scale-[0.98] transition-all duration-150">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                  <div className="flex gap-[2px]">
                    <div className="w-[6px] h-[6px] bg-[#1a1a40] rounded-[1px]" />
                    <div className="w-[6px] h-[6px] bg-[#28c2ec] rounded-[1px]" />
                    <div className="w-[6px] h-[6px] bg-[#ec5228] rounded-[1px]" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-black leading-tight">Co-Founder of validator.com</h3>
                  <p className="text-xs text-black/70">Stake your SOL with us</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <Image src="/validator-mockup.png" alt="validator.com-mockup" width={420} height={240} className="w-full h-auto" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 5. Fogees Hub - Consistent card styling */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-2xl">
            <a href="https://fogees.link" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-2xl p-5 border-[2.5px] border-white/0 hover:border-white/40 active:scale-[0.98] transition-all duration-150">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/fogees-logo.png" alt="Fogees Hub" width={40} height={40} className="rounded-full flex-shrink-0 shadow-sm" />
                <div className="space-y-0.5">
                  <h3 className="text-lg font-bold text-black leading-tight">Co-Founder of Fogees Hub</h3>
                  <p className="text-xs text-black/70">Your Educational Fogo Chain Hub</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <Image src="/fogees-mockup.png" alt="fogees hub mockup" width={420} height={240} className="w-full h-auto object-cover" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 6. Communication Link - Consistent card styling */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-2xl">
            <a href="https://thecommunication.link" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-2xl p-5 border-[2.5px] border-white/0 hover:border-white/40 active:scale-[0.98] transition-all duration-150">
              <div className="flex items-center gap-3 mb-4">
                <Image src="/images/seb-pfp.png" alt="Seb" width={40} height={40} className="rounded-full flex-shrink-0 shadow-sm" />
                <div className="space-y-0.5">
                  <p className="text-xs text-black/50 font-medium uppercase tracking-wider">Other Projects</p>
                  <h3 className="text-lg font-bold text-black leading-tight">Founder of thecommunication.link</h3>
                  <p className="text-xs text-black/70">Content & Branding Web 3 Consultancy</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <Image src="/communication-mockup.png" alt="Communication Link preview" width={420} height={240} className="w-full h-auto object-cover" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 7. Featured Referrals - Fitts's Law: larger touch targets */}
        <motion.div variants={itemVariants} className="space-y-3">
          {featuredReferrals.map((referral) => (
            <WobbleCard key={referral.name} containerClassName="rounded-full">
              <a
                href={referral.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#f1f1f1] rounded-full px-4 py-3.5 min-h-[56px] flex items-center justify-between border-[2.5px] border-white hover:border-white/70 active:scale-[0.98] transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    {referral.icon}
                  </div>
                  <span className="font-bold text-black text-base">{referral.name}</span>
                </div>
                <span className="px-4 py-2 bg-[#494949] text-white text-xs font-bold rounded-full whitespace-nowrap border border-white">
                  {referral.badge}
                </span>
              </a>
            </WobbleCard>
          ))}
        </motion.div>

        {/* 8. Other Referrals Card - Progressive disclosure with Miller's Law */}
        <motion.div variants={itemVariants}>
          <div className="bg-[#f1f1f1] rounded-2xl p-5 border-[2.5px] border-white">
            <h3 className="text-base font-bold text-black mb-4">More Referrals</h3>
            <div className="space-y-1">
              {visibleReferrals.map((referral) => (
                <a
                  key={referral.name}
                  href={referral.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 min-h-[48px] rounded-xl hover:bg-white/80 active:scale-[0.98] transition-all duration-150 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-black/80 group-hover:text-black transition-colors">
                      {referral.name}
                    </span>
                    {referral.badge && (
                      <span className="px-2.5 py-1 bg-black/5 text-black/60 text-xs font-semibold rounded-full">
                        {referral.badge}
                      </span>
                    )}
                  </div>
                  <ExternalLink size={16} className="text-black/30 group-hover:text-black/60 transition-colors" />
                </a>
              ))}
            </div>

            {/* Progressive disclosure toggle - Hick's Law */}
            {otherReferrals.length > 4 && (
              <button
                onClick={() => setShowAllReferrals(!showAllReferrals)}
                className="w-full mt-3 px-4 py-3 min-h-[48px] flex items-center justify-center gap-2 text-sm font-medium text-black/60 hover:text-black hover:bg-white/60 active:scale-[0.98] rounded-xl transition-all duration-150"
              >
                <span>{showAllReferrals ? "Show less" : `Show ${otherReferrals.length - 4} more`}</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${showAllReferrals ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>

    <EmailSignupModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </>
  )
}
