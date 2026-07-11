import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Agentation } from "agentation"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.sebmonty.link"),
  title: {
    default: "Seb Montgomery — Independent research",
    template: "%s — Seb Montgomery",
  },
  description: "Independent research on crypto, markets, and the products reshaping finance.",
  openGraph: {
    type: "website",
    siteName: "Seb Montgomery",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdf8" },
    { media: "(prefers-color-scheme: dark)", color: "#171714" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md focus:font-medium">
          Skip to main content
        </a>
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  )
}
