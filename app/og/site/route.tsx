// /og/site: the site's 1200 x 630 share card (Home, Blog, Skill Files and any page without its own).
import { ImageResponse } from 'next/og'

import { avatarDataUrl, CARD_HEADERS, CARD_SIZE, loadFonts, SiteCard } from '@/lib/og'

export const dynamic = 'force-static'

export async function GET() {
  const [fonts, avatar] = await Promise.all([loadFonts(), avatarDataUrl()])
  return new ImageResponse(<SiteCard avatar={avatar} />, { ...CARD_SIZE, fonts, headers: CARD_HEADERS })
}
