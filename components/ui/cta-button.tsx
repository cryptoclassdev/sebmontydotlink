"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CTAButtonProps {
  onClick: () => void
  className?: string
}

export function CTAButton({ onClick, className }: CTAButtonProps) {
  return (
    <motion.div
      className={cn("relative group", className)}
      whileHover="hover"
      initial="initial"
    >
      {/* Pulsing ambient glow (2s loop) */}
      <div className="absolute -inset-2 rounded-[2.25rem] bg-[#0055FF]/25 blur-2xl cta-glow-pulse pointer-events-none" />

      {/* Secondary glow layer for depth */}
      <div className="absolute -inset-1 rounded-[2.1rem] bg-[#0055FF]/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Spinning border gradient (4s loop) */}
      <div className="absolute -inset-[2px] rounded-[2.1rem] overflow-hidden">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60deg,rgba(0,85,255,0.5)_120deg,rgba(0,120,255,0.6)_180deg,rgba(0,85,255,0.5)_240deg,transparent_300deg,transparent_360deg)] cta-border-spin" />
        {/* Static subtle border visible always */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0055FF]/15 via-[#0077FF]/25 to-[#0055FF]/15" />
      </div>

      {/* Main card - Hick's Law: One clear primary action */}
      <button
        onClick={onClick}
        className="relative w-full bg-[#111] rounded-[2rem] p-6 lg:p-8 border border-white/[0.06] text-left overflow-hidden transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0055FF]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] active:scale-[0.99]"
      >
        {/* Shimmer sweep on hover (2.5s loop) */}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.02)_35%,rgba(255,255,255,0.06)_50%,rgba(255,255,255,0.02)_65%,transparent_80%)] opacity-0 group-hover:opacity-100 cta-shimmer pointer-events-none" />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.012] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content - Visual hierarchy: clear headline, subtitle, CTA */}
        <div className="relative space-y-6 lg:space-y-8">
          {/* Text group - Proximity: tight spacing between related elements */}
          <div className="space-y-2">
            {/* Headline - Typography: responsive sizing with clamp */}
            <h2 className="text-[clamp(1.5rem,4vw,1.875rem)] font-bold text-white tracking-tight leading-tight">
              Join the Private Group
            </h2>

            {/* Subtitle */}
            <p className="text-base lg:text-lg text-white/45 leading-relaxed">
              Get early access to alpha and insights
            </p>
          </div>

          {/* CTA Button with spring micro-interactions - Fitts's Law: large touch target */}
          <motion.div
            variants={{
              initial: { scale: 1 },
              hover: { scale: 1.03 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative inline-flex"
          >
            {/* Button glow */}
            <div className="absolute inset-0 rounded-full bg-[#0055FF]/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110" />

            <div className="relative inline-flex items-center gap-3 px-7 py-4 min-h-[52px] bg-[#0055FF] rounded-full text-white font-semibold text-base transition-all duration-200 group-hover:bg-[#0044DD] group-hover:shadow-[0_0_40px_rgba(0,85,255,0.5)]">
              {/* Inner highlight */}
              <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/15 via-transparent to-transparent pointer-events-none" />

              <span className="relative">Join the Waitlist</span>

              {/* Arrow with spring animation - translates right on hover */}
              <motion.div
                variants={{
                  initial: { x: 0 },
                  hover: { x: 5 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative"
              >
                <ArrowRight size={18} strokeWidth={2.5} />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Corner accent glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_100%_0%,rgba(0,85,255,0.12),transparent_60%)] pointer-events-none" />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#0055FF]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </button>
    </motion.div>
  )
}
