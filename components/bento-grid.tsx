"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LinkedinIcon } from "./icons/linkedin-icon"
import { XIcon } from "./icons/x-icon"
import { AtIcon } from "./icons/at-icon"
import { TelegramIcon } from "./icons/telegram-icon"
import { YoutubeIcon } from "./icons/youtube-icon"
import { SubstackIcon } from "./icons/substack-icon"
import { InfinexIcon } from "./icons/infinex-icon"
import { KastIcon } from "./icons/kast-icon"
import { ReferralsCarousel } from "./referrals-carousel"
import { FloatingDock } from "./ui/floating-dock"

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
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

export function BentoGrid() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 lg:p-12 relative overflow-hidden flex items-center justify-center"
    >
      {/* Background stars/dots */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[20%] animate-pulse" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[30%] left-[60%] animate-pulse delay-100" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[60%] left-[80%] animate-pulse delay-200" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[80%] left-[30%] animate-pulse delay-300" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[20%] right-[15%] animate-pulse delay-150" />
        <div className="absolute w-1 h-1 bg-white rounded-full bottom-[25%] right-[40%] animate-pulse delay-250" />
      </div>

      <div className="max-w-[90rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Hero Card - Left Column */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-4 bg-[#f1f1f1] rounded-[2rem] overflow-hidden border-[3px] border-white shadow-lg min-h-[31.25rem] lg:min-h-[43.5rem]"
        >
          <div className="relative h-[65%]">
            <Image
              src="/images/design-mode/seb-pfp_bs2cit.png"
              alt="Seb Montgomery"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          <div className="p-6 lg:p-8 text-center bg-[#f1f1f1] h-[35%] flex flex-col justify-center">
            <h1 className="text-2xl lg:text-4xl font-bold text-black mb-2 lowercase tracking-tight">seb montgomery</h1>
            <p className="text-base lg:text-lg font-bold text-[#050505] mb-1">Crypto Content Creator & Educator</p>
            <p className="text-sm lg:text-base text-[#050505]/70">
              Helping the world understand Crypto and Solana, one step at a time
            </p>
          </div>
        </motion.div>

        {/* Middle Column - Project Cards */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-5">
          {/* Validator.com Card */}
          <motion.a
            href="https://validator.com"
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            className="bg-[#f1f1f1] rounded-[1.75rem] p-5 lg:p-6 flex-1 min-h-[20.5rem] border-[2.5px] border-white/0 hover:border-white/40 transition-all"
          >
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
                <p className="text-[10px] text-black/60">Stake your SOL with us</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl overflow-hidden">
              <Image
                src="/validator-mockup.png"
                alt="validator.com-mockup"
                width={420}
                height={240}
                className="w-full h-auto"
              />
            </div>
          </motion.a>

          {/* Fogees Hub Card */}
          <motion.a
            href="https://fogees.link"
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            className="bg-[#f1f1f1] rounded-[1.75rem] p-5 lg:p-6 flex-1 min-h-[20.5rem] border-[2.5px] border-white hover:border-white/40 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-[#0c1825] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[8px] font-medium leading-none text-center">fogees<br/>hub</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-black leading-tight">Co-Founder of Fogees Hub</h3>
                <p className="text-[10px] text-black/60">Your Educational Fogo Chain Hub</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl overflow-hidden">
              <Image
                src="/fogees-mockup.png"
                alt="fogees hub mockup"
                width={420}
                height={240}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.a>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-5">
          {/* Social Icons Row - Floating Dock */}
          <motion.div variants={itemVariants} className="w-full">
            <FloatingDock items={socialLinks} desktopClassName="mx-0 w-full justify-evenly" />
          </motion.div>

          {/* Communication Link Card */}
          <motion.a
            href="https://thecommunication.link"
            target="_blank"
            rel="noopener noreferrer"
            variants={itemVariants}
            className="bg-[#f1f1f1] rounded-[1.75rem] p-5 lg:p-6 min-h-[22.5rem] flex flex-col border-[2.5px] border-white/0 hover:border-white/40 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/seb-pfp.png"
                alt="Seb"
                width={36}
                height={36}
                className="rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-black leading-tight">Founder of thecommunication.link</h3>
                <p className="text-[10px] text-black/60">Content & Branding Web 3 Consultancy</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden flex-1">
              <Image
                src="/communication-mockup.png"
                alt="Communication Link preview"
                width={420}
                height={240}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.a>

          {/* Referral Cards */}
          <motion.div variants={itemVariants} className="space-y-3">
            {/* Infinex Referral */}
            <a
              href="https://infinex.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#f1f1f1] rounded-full px-4 py-3 flex items-center justify-between border-[2.5px] border-white hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
                  <InfinexIcon size={36} />
                </div>
                <span className="font-bold text-black text-lg">Infinex Referral</span>
              </div>
              <span className="px-5 py-1.5 bg-[#494949] text-white text-sm font-bold rounded-full whitespace-nowrap border border-white">
                Super Bullish
              </span>
            </a>

            {/* Kast Referral */}
            <a
              href="https://kast.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#f1f1f1] rounded-full px-4 py-3 flex items-center justify-between border-[2.5px] border-white hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <KastIcon size={20} />
                </div>
                <span className="font-bold text-black text-lg">Kast Referral</span>
              </div>
              <span className="px-5 py-1.5 bg-[#494949] text-white text-sm font-bold rounded-full whitespace-nowrap border border-white">
                My Personal Card
              </span>
            </a>

            {/* Other Referrals Carousel */}
            <ReferralsCarousel />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
