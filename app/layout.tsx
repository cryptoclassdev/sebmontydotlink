import type React from "react"
import type { Metadata, Viewport } from "next"
import { Agentation } from "agentation"
import "./globals.css"

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
    { media: "(prefers-color-scheme: light)", color: "#faf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1417" },
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
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  )
}
