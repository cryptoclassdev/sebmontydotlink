import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Agentation } from "agentation"
import { SiteJsonLd } from "@/components/seo/SiteJsonLd"
import { RSS_ALTERNATE, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_SHARE_IMAGE, SITE_URL, X_HANDLE } from "@/lib/seo"
import "./globals.css"

// Defaults every page inherits. Deliberately no canonical link here: a canonical in the root
// layout would make every page claim to be the homepage. Pages set their own through
// pageMetadata() in lib/seo.ts (see docs/seo.md).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Seb Montgomery | Crypto, Solana and AI research",
    template: "%s | Seb Montgomery",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: `${SITE_URL}/` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { types: RSS_ALTERNATE },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    images: [SITE_SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    site: X_HANDLE,
    creator: X_HANDLE,
    images: [{ url: SITE_SHARE_IMAGE.url, alt: SITE_SHARE_IMAGE.alt }],
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
        <SiteJsonLd />
        <Analytics />
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  )
}
