"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { LinkedinLogo, XLogo, EnvelopeSimple, TelegramLogo } from "@phosphor-icons/react"
import { YoutubeIcon } from "./icons/youtube-icon"
import { SubstackIcon } from "./icons/substack-icon"
import { ReferralsCarousel } from "./referrals-carousel"

const socialLinks = [
  { icon: LinkedinLogo, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: XLogo, href: "https://x.com/SebMontgomery", label: "X/Twitter" },
  { icon: EnvelopeSimple, href: "mailto:contact@example.com", label: "Email" },
  { icon: TelegramLogo, href: "https://t.me", label: "Telegram" },
  { icon: () => <YoutubeIcon size={24} />, href: "https://youtube.com/@SebMontgomery", label: "YouTube" },
  { icon: () => <SubstackIcon size={24} />, href: "https://sebmonty.substack.com", label: "Substack" },
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
      className="min-h-screen bg-[#1a1a1a] p-4 md:p-8 lg:p-12 relative overflow-hidden flex items-center justify-center"
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[20%] animate-pulse" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[30%] left-[60%] animate-pulse delay-100" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[60%] left-[80%] animate-pulse delay-200" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[80%] left-[30%] animate-pulse delay-300" />
        <div className="absolute w-1 h-1 bg-white rounded-full top-[20%] right-[15%] animate-pulse delay-150" />
        <div className="absolute w-1 h-1 bg-white rounded-full bottom-[25%] right-[40%] animate-pulse delay-250" />
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm rounded-3xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-[650px]"
        >
          <div className="relative flex-1 bg-black">
            <Image
              src="https://res.cloudinary.com/di6zkr8of/image/upload/v1764583245/seb-pfp_bs2cit.png"
              alt="Seb Montgomery"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          <div className="p-8 lg:p-10 text-center bg-white/95">
            <h1 className="text-3xl lg:text-5xl font-bold text-black mb-3 lowercase">seb montgomery</h1>
            <p className="text-lg lg:text-xl font-semibold text-black mb-2">Crypto Content Creator & Educator</p>
            <p className="text-sm lg:text-base text-black/70">
              Helping the world understand Crypto and Solana, one step at a time
            </p>
          </div>
        </motion.div>

        <div className="lg:col-span-4 flex flex-col gap-4 lg:gap-6">
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 flex-1 min-h-[280px]"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">Co-Founder of validator.com</h3>
                <p className="text-sm text-black/60">Stake your SOL with us</p>
              </div>
            </div>
            <div className="mt-8">
              <Image
                src="/images/validator-mockup.png"
                alt="validator.com mockup"
                width={400}
                height={200}
                className="w-full h-auto"
              />
            </div>
          </motion.div>

          {/* Fogees Hub Card */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 flex-1 min-h-[280px]"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <div className="text-white text-sm font-bold">FH</div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">Co-Founder of Fogees Hub</h3>
                <p className="text-sm text-black/60">Your Educational Fogo Chain Hub</p>
              </div>
            </div>
            <div className="mt-8 bg-[#0a1628] rounded-xl overflow-hidden">
              <Image
                src="/images/fogees-mockup.jpg"
                alt="fogees hub mockup"
                width={800}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-4 lg:gap-6">
          {/* Social Icons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap lg:flex-nowrap gap-3 justify-center lg:justify-start"
          >
            {socialLinks.map((social, index) => {
              const Icon = social.icon
              return (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 aspect-square bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  aria-label={social.label}
                >
                  {typeof Icon === "function" ? <Icon /> : <Icon size={24} weight="fill" className="text-black" />}
                </a>
              )
            })}
          </motion.div>

          {/* Communication Link Card */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm rounded-3xl p-6 lg:p-8 min-h-[280px] flex flex-col"
          >
            <div className="flex items-start gap-4 mb-6">
              <Image
                src="/images/seb-pfp.png"
                alt="Seb"
                width={56}
                height={56}
                className="rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-xl lg:text-2xl font-bold text-black mb-1">Founder of The Communication Link</h3>
                <p className="text-sm lg:text-base text-black/60">Content & Branding Web 3 Consultancy</p>
              </div>
            </div>
            <div className="bg-black rounded-2xl flex-1 min-h-[200px] lg:min-h-[280px] flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=280&width=400"
                alt="Communication Link preview"
                width={400}
                height={280}
                className="w-full h-auto rounded-xl opacity-80"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 bg-[#FF6B35] rounded-sm transform rotate-45" />
                </div>
                <span className="font-bold text-black text-lg">Infinex Referral</span>
              </div>
              <span className="px-5 py-2 bg-[#4a4a4a] text-white text-sm font-semibold rounded-full whitespace-nowrap">
                Super Bullish
              </span>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 bg-[#FF6B35] rounded-sm transform rotate-45" />
                </div>
                <span className="font-bold text-black text-lg">Infinex Referral</span>
              </div>
              <span className="px-5 py-2 bg-[#4a4a4a] text-white text-sm font-semibold rounded-full whitespace-nowrap">
                Super Bullish
              </span>
            </div>

            <ReferralsCarousel />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
