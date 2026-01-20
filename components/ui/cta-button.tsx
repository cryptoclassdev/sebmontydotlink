"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Brand colors from Figma
// Coral Orange: #d1855c (primary)
// Golden Yellow: #e5ba41 (accent)
// Sky Blue: #74b4e2 (secondary)
// Dark Navy: #2d3c59

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
      {/* LAYER 1: Outer pulsing ring - brand coral */}
      <div className="absolute -inset-4 rounded-[2.5rem] border-2 border-[#d1855c]/25 animate-pulse [animation-duration:2s] pointer-events-none" />

      {/* LAYER 2: Large ambient glow - warm coral/orange */}
      <div className="absolute -inset-6 rounded-[3rem] bg-[#d1855c]/20 blur-3xl cta-glow-pulse pointer-events-none" />

      {/* LAYER 3: Secondary glow layer - golden accent */}
      <div className="absolute -inset-3 rounded-[2.5rem] bg-[#e5ba41]/12 blur-2xl pointer-events-none" />

      {/* LAYER 4: Intense hover glow - warm blend */}
      <div className="absolute -inset-2 rounded-[2.25rem] bg-[#d1855c]/15 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* LAYER 5: Spinning border gradient (4s loop) - brand colors */}
      <div className="absolute -inset-[3px] rounded-[2.25rem] overflow-hidden">
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_45deg,rgba(209,133,92,0.7)_90deg,rgba(229,186,65,0.9)_180deg,rgba(209,133,92,0.7)_270deg,transparent_315deg,transparent_360deg)] cta-border-spin" />
        {/* Static subtle border visible always */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#d1855c]/20 via-[#e5ba41]/35 to-[#d1855c]/20" />
      </div>

      {/* Main card */}
      <button
        onClick={onClick}
        className="relative w-full bg-[#0c0c0c] rounded-[2.15rem] p-7 lg:p-10 border border-white/[0.08] text-left overflow-hidden transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d1855c]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] active:scale-[0.99]"
      >
        {/* Inner gradient for depth - warm tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d1855c]/[0.04] via-transparent to-[#e5ba41]/[0.02] pointer-events-none" />

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
        <div className="relative space-y-6 lg:space-y-8">
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

          {/* CTA Button - Brand coral with golden hover */}
          <motion.div
            variants={{
              initial: { scale: 1 },
              hover: { scale: 1.04 },
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative inline-flex"
          >
            {/* Button glow - warm coral */}
            <div className="absolute inset-0 rounded-full bg-[#d1855c]/40 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300 scale-125" />

            <div className="relative inline-flex items-center gap-3 px-8 py-5 min-h-[60px] bg-gradient-to-r from-[#d1855c] to-[#c47a52] rounded-full text-white font-bold text-lg transition-all duration-200 group-hover:from-[#e5ba41] group-hover:to-[#d1855c] group-hover:shadow-[0_0_60px_rgba(209,133,92,0.6)]">
              {/* Inner highlight */}
              <div className="absolute inset-[1px] rounded-full bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none" />

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

        {/* Corner accent glow - warm coral */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-[radial-gradient(circle_at_100%_0%,rgba(209,133,92,0.15),transparent_50%)] pointer-events-none" />

        {/* Bottom left accent - golden */}
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[radial-gradient(circle_at_0%_100%,rgba(229,186,65,0.08),transparent_60%)] pointer-events-none" />

        {/* Bottom accent line - brand gradient */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-[#d1855c]/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      </button>
    </motion.div>
  )
}
