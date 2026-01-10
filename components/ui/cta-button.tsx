"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface CTAButtonProps {
  onClick: () => void
  title: string
  subtitle: string
  className?: string
}

export function CTAButton({ onClick, title, subtitle, className }: CTAButtonProps) {
  return (
    <motion.div
      className={cn("relative group", className)}
      whileHover="hover"
      initial="initial"
    >
      {/* Animated glow effect - pulses subtly */}
      <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-amber-500/20 via-orange-500/30 to-amber-500/20 blur-xl cta-glow-pulse opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Secondary glow layer for depth */}
      <div className="absolute -inset-0.5 rounded-[1.875rem] bg-gradient-to-r from-amber-400/0 via-orange-400/20 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Animated border gradient */}
      <div className="absolute -inset-[2px] rounded-[1.875rem] overflow-hidden">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60deg,rgba(251,191,36,0.4)_120deg,rgba(249,115,22,0.5)_180deg,rgba(251,191,36,0.4)_240deg,transparent_300deg,transparent_360deg)] cta-border-spin" />
        {/* Static subtle border visible always */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/20 to-amber-500/10" />
      </div>

      {/* Main button */}
      <button
        onClick={onClick}
        className="relative w-full bg-gradient-to-br from-[#1a1a1a] via-[#1f1f1f] to-[#141414] rounded-[1.75rem] p-5 lg:p-6 border border-white/[0.08] text-left overflow-hidden transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.03)_35%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.03)_65%,transparent_80%)] cta-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <motion.div
                variants={{
                  initial: { rotate: 0, scale: 1 },
                  hover: { rotate: 15, scale: 1.1 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Sparkles size={14} className="text-amber-400" />
              </motion.div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90">
                Exclusive
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1 tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-white/50 group-hover:text-white/60 transition-colors">
              {subtitle}
            </p>
          </div>

          {/* Arrow button with glow */}
          <div className="relative">
            {/* Arrow glow */}
            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-150" />

            <motion.div
              variants={{
                initial: { scale: 1, x: 0 },
                hover: { scale: 1.08, x: 2 },
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-shadow duration-300"
            >
              {/* Inner highlight */}
              <div className="absolute inset-[1px] rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />

              <motion.div
                variants={{
                  initial: { x: 0 },
                  hover: { x: 3 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ArrowRight size={18} className="text-white drop-shadow-sm" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </button>
    </motion.div>
  )
}
