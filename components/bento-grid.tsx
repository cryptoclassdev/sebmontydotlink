"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Grid3X3 } from "lucide-react"
import { LinkedinIcon } from "./icons/linkedin-icon"
import { XIcon } from "./icons/x-icon"
import { AtIcon } from "./icons/at-icon"
import { TelegramIcon } from "./icons/telegram-icon"
import { YoutubeIcon } from "./icons/youtube-icon"
import { SubstackIcon } from "./icons/substack-icon"
import { InfinexIcon } from "./icons/infinex-icon"
import { KastIcon } from "./icons/kast-icon"
import { FloatingDock } from "./ui/floating-dock"
import { CardContainer, CardBody } from "./ui/3d-card"
import { WobbleCard } from "./ui/wobble-card"
import { Modal } from "./ui/modal"
import { ReferralGrid } from "./referral-grid"
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

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

      {/* Desktop Layout */}
      <div className="max-w-[90rem] mx-auto hidden lg:grid lg:grid-cols-12 gap-5">
        {/* Left Column - Profile + Email CTA */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Hero Card with 3D Effect */}
          <motion.div variants={itemVariants} className="flex-1">
            <CardContainer className="h-full">
              <CardBody className="bg-[#f1f1f1] rounded-[2rem] overflow-hidden border-[2.5px] border-white shadow-lg w-full h-full flex flex-col">
                <div className="p-3 lg:p-4 flex-1">
                  <div className="relative h-full min-h-[20rem] overflow-hidden rounded-[1.25rem] border-2 border-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
                    <Image
                      src="/images/design-mode/seb-pfp_bs2cit.png"
                      alt="Seb Montgomery"
                      fill
                      className="object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
                      priority
                    />
                    {/* Subtle gradient overlay at bottom for text legibility */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/[0.04] to-transparent pointer-events-none" />
                  </div>
                </div>
                <div className="px-6 pb-6 lg:px-8 lg:pb-8 text-center">
                  <h1 className="text-2xl lg:text-4xl font-bold text-black mb-2 lowercase tracking-tight">seb montgomery</h1>
                  <p className="text-base lg:text-lg font-bold text-[#050505] mb-1">Crypto Content Creator & Educator</p>
                  <p className="text-sm lg:text-base text-[#050505]/70 leading-relaxed">
                    Helping the world understand Crypto and Solana, one step at a time
                  </p>
                </div>
              </CardBody>
            </CardContainer>
          </motion.div>

          {/* Email CTA Card - Highlighted */}
          <motion.div variants={itemVariants}>
            <CTAButton
              onClick={() => setIsEmailModalOpen(true)}
              title="Join the Private Group"
              subtitle="Get early access to exclusive content"
            />
          </motion.div>
        </div>

        {/* Middle Column - Project Cards */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <motion.div variants={itemVariants} className="flex-1 min-h-[20.5rem]">
            <WobbleCard containerClassName="h-full rounded-[1.75rem]">
              <a href="https://validator.com" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-[1.75rem] p-5 lg:p-6 h-full border-[2.5px] border-white/0 hover:border-white/40 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <div className="flex gap-[2px]">
                      <div className="w-[7px] h-[7px] bg-[#1a1a40] rounded-[1px]" />
                      <div className="w-[7px] h-[7px] bg-[#28c2ec] rounded-[1px]" />
                      <div className="w-[7px] h-[7px] bg-[#ec5228] rounded-[1px]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black leading-tight">Co-Founder of validator.com</h3>
                    <p className="text-[10px] text-black/80">Stake your SOL with us</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl overflow-hidden shadow-[inset_0_1px_4px_rgba(0,0,0,0.04)]">
                  <Image src="/validator-mockup.png" alt="validator.com-mockup" width={420} height={240} className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.01]" />
                </div>
              </a>
            </WobbleCard>
          </motion.div>

          <motion.div variants={itemVariants} className="flex-1 min-h-[20.5rem]">
            <WobbleCard containerClassName="h-full rounded-[1.75rem]">
              <a href="https://fogees.link" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-[1.75rem] p-5 lg:p-6 h-full border-[2.5px] border-white/0 hover:border-white/40 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <Image src="/fogees-logo.png" alt="Fogees Hub" width={36} height={36} className="rounded-full flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-black leading-tight">Co-Founder of Fogees Hub</h3>
                    <p className="text-[10px] text-black/80">Your Educational Fogo Chain Hub</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl overflow-hidden shadow-[inset_0_1px_4px_rgba(0,0,0,0.04)]">
                  <Image src="/fogees-mockup.png" alt="fogees hub mockup" width={420} height={240} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                </div>
              </a>
            </WobbleCard>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <motion.div variants={itemVariants} className="w-full">
            <FloatingDock items={socialLinks} desktopClassName="mx-0 w-full justify-evenly" />
          </motion.div>

          <motion.div variants={itemVariants} className="min-h-[22.5rem]">
            <WobbleCard containerClassName="h-full rounded-[1.75rem]">
              <a href="https://thecommunication.link" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-[1.75rem] p-5 lg:p-6 h-full flex flex-col border-[2.5px] border-white/0 hover:border-white/40 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <Image src="/images/seb-pfp.png" alt="Seb" width={36} height={36} className="rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-black leading-tight">Founder of thecommunication.link</h3>
                    <p className="text-[10px] text-black/80">Content & Branding Web 3 Consultancy</p>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden flex-1 shadow-[inset_0_1px_4px_rgba(0,0,0,0.04)]">
                  <Image src="/communication-mockup.png" alt="Communication Link preview" width={420} height={240} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                </div>
              </a>
            </WobbleCard>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <WobbleCard containerClassName="rounded-full">
              <a href="https://infinex.xyz" target="_blank" rel="noopener noreferrer" className="bg-[#f1f1f1] rounded-full px-4 py-3 flex items-center justify-between border-[2.5px] border-white hover:border-white/70 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"><InfinexIcon size={36} /></div>
                  <span className="font-bold text-black text-lg">Infinex Referral</span>
                </div>
                <span className="px-5 py-1.5 bg-[#494949] text-white text-sm font-bold rounded-full whitespace-nowrap border border-white">Super Bullish</span>
              </a>
            </WobbleCard>
            <WobbleCard containerClassName="rounded-full">
              <a href="https://kast.gg" target="_blank" rel="noopener noreferrer" className="bg-[#f1f1f1] rounded-full px-4 py-3 flex items-center justify-between border-[2.5px] border-white hover:border-white/70 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center flex-shrink-0"><KastIcon size={20} /></div>
                  <span className="font-bold text-black text-lg">Kast Referral</span>
                </div>
                <span className="px-5 py-1.5 bg-[#494949] text-white text-sm font-bold rounded-full whitespace-nowrap border border-white">My Personal Card</span>
              </a>
            </WobbleCard>
            <WobbleCard containerClassName="rounded-full">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-[#1a1a1a] rounded-full px-4 py-3 flex items-center justify-between border-[2.5px] border-white/20 hover:border-white/35 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.18] group-hover:scale-105 transition-all duration-200">
                    <Grid3X3 size={18} className="text-white group-hover:rotate-3 transition-transform duration-200" />
                  </div>
                  <span className="font-bold text-white text-lg">More Partners</span>
                </div>
                <span className="px-5 py-1.5 bg-white/10 text-white text-sm font-bold rounded-full whitespace-nowrap border border-white/20 group-hover:bg-white/[0.18] group-hover:border-white/30 transition-all duration-200">8 Referrals</span>
              </button>
            </WobbleCard>
          </motion.div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="w-full max-w-md mx-auto flex flex-col gap-5 lg:hidden">
        {/* 1. Seb Montgomery Profile */}
        <motion.div variants={itemVariants}>
          <CardContainer className="w-full">
            <CardBody className="bg-[#f1f1f1] rounded-[2rem] overflow-hidden border-[2.5px] border-white shadow-lg w-full">
              <div className="p-3">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border-2 border-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]">
                  <Image src="/images/design-mode/seb-pfp_bs2cit.png" alt="Seb Montgomery" fill className="object-cover object-top transition-transform duration-500" priority />
                  {/* Subtle gradient overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/[0.04] to-transparent pointer-events-none" />
                </div>
              </div>
              <div className="px-5 pb-5 text-center">
                <h1 className="text-2xl font-bold text-black mb-1 lowercase tracking-tight">seb montgomery</h1>
                <p className="text-sm font-bold text-[#050505] mb-1">Crypto Content Creator & Educator</p>
                <p className="text-xs text-[#050505]/70 leading-relaxed">Helping the world understand Crypto and Solana, one step at a time</p>
              </div>
            </CardBody>
          </CardContainer>
        </motion.div>

        {/* 2. Email CTA Card - Highlighted */}
        <motion.div variants={itemVariants}>
          <CTAButton
            onClick={() => setIsEmailModalOpen(true)}
            title="Join the Private Group"
            subtitle="Get early access to exclusive content"
          />
        </motion.div>

        {/* 3. Social Footer */}
        <motion.div variants={itemVariants}>
          <FloatingDock items={socialLinks} desktopClassName="mx-0 w-full justify-evenly" />
        </motion.div>

        {/* 3. Validator */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-[1.75rem]">
            <a href="https://validator.com" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-[1.75rem] p-4 border-[2.5px] border-white/0 hover:border-white/40 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <div className="flex gap-[2px]">
                    <div className="w-[6px] h-[6px] bg-[#1a1a40] rounded-[1px]" />
                    <div className="w-[6px] h-[6px] bg-[#28c2ec] rounded-[1px]" />
                    <div className="w-[6px] h-[6px] bg-[#ec5228] rounded-[1px]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black leading-tight">Co-Founder of validator.com</h3>
                  <p className="text-[10px] text-black/80">Stake your SOL with us</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <Image src="/validator-mockup.png" alt="validator.com-mockup" width={420} height={240} className="w-full h-auto" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 4. Fogees Hub */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-[1.75rem]">
            <a href="https://fogees.link" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-[1.75rem] p-4 border-[2.5px] border-white/0 hover:border-white/40 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <Image src="/fogees-logo.png" alt="Fogees Hub" width={32} height={32} className="rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-black leading-tight">Co-Founder of Fogees Hub</h3>
                  <p className="text-[10px] text-black/80">Your Educational Fogo Chain Hub</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <Image src="/fogees-mockup.png" alt="fogees hub mockup" width={420} height={240} className="w-full h-auto object-cover" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 5. Communication Link */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-[1.75rem]">
            <a href="https://thecommunication.link" target="_blank" rel="noopener noreferrer" className="block bg-[#f1f1f1] rounded-[1.75rem] p-4 border-[2.5px] border-white/0 hover:border-white/40 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <Image src="/images/seb-pfp.png" alt="Seb" width={32} height={32} className="rounded-full flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-black leading-tight">Founder of thecommunication.link</h3>
                  <p className="text-[10px] text-black/80">Content & Branding Web 3 Consultancy</p>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <Image src="/communication-mockup.png" alt="Communication Link preview" width={420} height={240} className="w-full h-auto object-cover" />
              </div>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 6. Infinex Referral */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-full">
            <a href="https://infinex.xyz" target="_blank" rel="noopener noreferrer" className="bg-[#f1f1f1] rounded-full px-4 py-3 flex items-center justify-between border-[2.5px] border-white hover:border-white/70 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"><InfinexIcon size={32} /></div>
                <span className="font-bold text-black text-base">Infinex Referral</span>
              </div>
              <span className="px-3 py-1 bg-[#494949] text-white text-xs font-bold rounded-full whitespace-nowrap border border-white">Super Bullish</span>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 7. Kast Referral */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-full">
            <a href="https://kast.gg" target="_blank" rel="noopener noreferrer" className="bg-[#f1f1f1] rounded-full px-4 py-3 flex items-center justify-between border-[2.5px] border-white hover:border-white/70 active:scale-[0.98] transition-all">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0"><KastIcon size={18} /></div>
                <span className="font-bold text-black text-base">Kast Referral</span>
              </div>
              <span className="px-3 py-1 bg-[#494949] text-white text-xs font-bold rounded-full whitespace-nowrap border border-white">My Personal Card</span>
            </a>
          </WobbleCard>
        </motion.div>

        {/* 8. More Partners */}
        <motion.div variants={itemVariants}>
          <WobbleCard containerClassName="rounded-full">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#1a1a1a] rounded-full px-4 py-3 flex items-center justify-between border-[2.5px] border-white/20 hover:border-white/35 active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.18] group-active:scale-95 transition-all duration-200">
                  <Grid3X3 size={16} className="text-white group-hover:rotate-3 transition-transform duration-200" />
                </div>
                <span className="font-bold text-white text-base">More Partners</span>
              </div>
              <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-full whitespace-nowrap border border-white/20 group-hover:bg-white/[0.18] group-hover:border-white/30 transition-all duration-200">8 Referrals</span>
            </button>
          </WobbleCard>
        </motion.div>
      </div>
    </motion.div>

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Partner Referrals">
      <ReferralGrid />
    </Modal>

    <EmailSignupModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />
    </>
  )
}
