"use client"

import { motion } from "framer-motion"

interface Referral {
  name: string
  href: string
  logo: React.ReactNode
}

const referrals: Referral[] = [
  {
    name: "Kamino Finance",
    href: "https://swap.kamino.finance/?ref=SEBMONTY",
    logo: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <path d="M16 4L4 12v8l12 8 12-8v-8L16 4z" fill="#00D4AA" />
        <path d="M16 12l-6 4v4l6 4 6-4v-4l-6-4z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Ranger Finance",
    href: "https://www.app.ranger.finance/?ref_code=sebmonty",
    logo: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <circle cx="16" cy="16" r="14" fill="#22c55e" />
        <path d="M12 12l10 4-10 4V12z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Binance",
    href: "https://www.binance.com/en/activity/referral/offers/claim?ref=CPA_00R34Q8Y0Q",
    logo: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <circle cx="16" cy="16" r="14" fill="#F0B90B" />
        <path d="M16 7l2.5 2.5-5.5 5.5-2.5-2.5L16 7zm-5.5 5.5l2.5 2.5-2.5 2.5-2.5-2.5 2.5-2.5zm11 0l2.5 2.5-2.5 2.5-2.5-2.5 2.5-2.5zm-5.5 5.5l2.5 2.5-5.5 5.5-2.5-2.5 5.5-5.5zm0-3l2.5 2.5-2.5 2.5-2.5-2.5 2.5-2.5z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Bluefin",
    href: "https://trade.bluefin.io/referral/v2-84kt7k",
    logo: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <circle cx="16" cy="16" r="14" fill="#0ea5e9" />
        <path d="M16 6c-2 4-6 6-8 6 2 8 5 12 8 14 3-2 6-6 8-14-2 0-6-2-8-6z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Bybit",
    href: "https://www.bybit.com/invite?ref=JAW8RO",
    logo: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <circle cx="16" cy="16" r="14" fill="#f7a600" />
        <path d="M10 10h5v8h-5V10zm7 0h5v12h-5v-4h-2v-3h2V10z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Hawk Fi",
    href: "https://www.hawkfi.ag/",
    logo: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <circle cx="16" cy="16" r="14" fill="#f97316" />
        <path d="M16 8l8 5v6l-8 5-8-5v-6l8-5z" fill="#fff" fillOpacity="0.9" />
      </svg>
    ),
  },
  {
    name: "Huma Finance",
    href: "https://app.huma.finance/?ref=bwECKU",
    logo: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <circle cx="16" cy="16" r="14" fill="#8b5cf6" />
        <circle cx="16" cy="16" r="8" stroke="#fff" strokeWidth="2" fill="none" />
        <circle cx="16" cy="16" r="3" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Kaito",
    href: "https://portal.kaito.ai/auth/entry?referralCode=55E051CF",
    logo: (
      <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
        <circle cx="16" cy="16" r="14" fill="#ec4899" />
        <path d="M16 6l10 10-10 10L6 16 16 6z" fill="#fff" fillOpacity="0.9" />
        <circle cx="16" cy="16" r="3" fill="#ec4899" />
      </svg>
    ),
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
}

export function ReferralGrid() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
    >
      {referrals.map((referral) => (
        <motion.a
          key={referral.name}
          href={referral.href}
          target="_blank"
          rel="noopener noreferrer"
          variants={itemVariants}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
          className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/60 hover:bg-white transition-all duration-200"
          aria-label={`${referral.name} referral link`}
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-black/[0.03] group-hover:bg-black/[0.06] transition-colors duration-200">
            {referral.logo}
          </div>
          <span className="text-[0.8125rem] font-medium text-black/70 text-center leading-tight group-hover:text-black transition-colors duration-200">
            {referral.name}
          </span>
        </motion.a>
      ))}
    </motion.div>
  )
}
