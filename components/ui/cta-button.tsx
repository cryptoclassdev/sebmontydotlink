"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Single accent color - rich deep blue
const accentBlue = "#2563eb"

interface CTAButtonProps {
  onClick: () => void
  className?: string
}

export function CTAButton({ onClick, className }: CTAButtonProps) {
  return (
    <motion.div
      className={cn("relative group w-full", className)}
      whileHover="hover"
      initial="initial"
    >
      {/* LAYER 1: Outer pulsing ring */}
      <div className="absolute -inset-2 rounded-[2.25rem] border-2 border-[#2563eb]/35 animate-pulse [animation-duration:2s] pointer-events-none" />

      {/* LAYER 2: Large ambient glow */}
      <div className="absolute -inset-3 rounded-[2.5rem] bg-[#2563eb]/20 blur-3xl cta-glow-pulse pointer-events-none" />

      {/* LAYER 3: Secondary glow layer */}
      <div className="absolute -inset-2 rounded-[2.25rem] bg-[#2563eb]/15 blur-2xl pointer-events-none" />

      {/* LAYER 4: Spinning border gradient (4s loop) - single color */}
      <div className="absolute -inset-[2px] rounded-[2.2rem] overflow-hidden">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60deg,rgba(37,99,235,0.85)_180deg,transparent_300deg,transparent_360deg)] cta-border-spin" />
        {/* Static subtle border */}
        <div className="absolute inset-0 bg-[#2563eb]/25" />
      </div>

      {/* Main card */}
      <button
        onClick={onClick}
        className="relative w-full bg-[#0c0c0c] rounded-[2.15rem] p-5 lg:p-6 border border-white/[0.08] text-left overflow-hidden transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] active:scale-[0.99]"
      >
        {/* Inner gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563eb]/[0.06] via-transparent to-transparent pointer-events-none" />

        {/* Shimmer sweep on hover */}
        <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.03)_35%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.03)_65%,transparent_80%)] opacity-0 group-hover:opacity-100 cta-shimmer pointer-events-none" />

        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative space-y-4 lg:space-y-5">
          {/* Text group */}
          <div className="space-y-3">
            {/* Headline */}
            <h2 className="text-[clamp(1.75rem,5vw,2.5rem)] font-extrabold text-white tracking-tight leading-[1.1]">
              Join the Private Group
            </h2>

            {/* Subtitle */}
            <p className="text-base lg:text-xl text-white/50 leading-relaxed max-w-md">
              Get early access to alpha, insights, and exclusive opportunities
            </p>
          </div>

          {/* CTA Button - Single color, no hover change */}
          <motion.div
            variants={{
              initial: { scale: 1 },
              hover: { scale: 1.04 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative inline-flex"
          >
            {/* Button glow */}
            <div className="absolute inset-0 rounded-full bg-[#2563eb]/50 blur-2xl opacity-80 scale-125" />

            <div className="relative inline-flex items-center gap-3 px-8 py-5 min-h-[60px] bg-[#2563eb] group-hover:bg-[#1d4ed8] rounded-full text-white font-bold text-lg shadow-[0_0_35px_rgba(37,99,235,0.5)] transition-colors duration-300">
              {/* Inner highlight */}
              <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />

              <span className="relative">Join the Waitlist</span>

              {/* Arrow with spring animation */}
              <motion.div
                variants={{
                  initial: { x: 0 },
                  hover: { x: 6 },
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative"
              >
                <ArrowRight size={20} strokeWidth={2.5} />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Corner accent glow */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none" />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-[#2563eb]/50 to-transparent opacity-80" />
      </button>
    </motion.div>
  )
}
