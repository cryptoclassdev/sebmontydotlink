// Share cards (1200 x 630) drawn with next/og for links posted on X, LinkedIn, Telegram and
// in chat apps. app/og/site/route.tsx draws the site card; app/og/blog/[slug]/route.tsx draws
// one per article from its cover photo and headline. Cards use General Sans from Fontshare
// (the site's font) and fall back to next/og's built-in font if Fontshare can't be reached.
import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const CARD_SIZE = { width: 1200, height: 630 }

/** Long cache: card URLs carry a ?v= hash of their content, so a changed card gets a new URL. */
export const CARD_HEADERS = { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable' }

const INK = '#211d16'
const SOFT = '#6e6557'
const PAPER = '#faf7f0'
const BONE = '#fffdf8'
const ACCENT = '#72bbca'

type Font = { name: string; data: ArrayBuffer; weight: 500 | 600; style: 'normal' }

let fontsPromise: Promise<Font[]> | null = null

/** General Sans 500 and 600 as TrueType files (next/og can't read woff2). */
export function loadFonts(): Promise<Font[]> {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      try {
        const css = await (await fetch('https://api.fontshare.com/v2/css?f[]=general-sans@500,600&display=swap', { signal: AbortSignal.timeout(4000) })).text()
        const fonts: Font[] = []
        for (const [, block] of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
          const weight = Number(/font-weight:\s*(\d+)/.exec(block)?.[1])
          const file = /url\('([^']+\.ttf)'\)/.exec(block)?.[1]
          if ((weight !== 500 && weight !== 600) || !file) continue
          const response = await fetch(file.startsWith('//') ? `https:${file}` : file, { signal: AbortSignal.timeout(4000) })
          if (!response.ok) continue
          fonts.push({ name: 'General Sans', data: await response.arrayBuffer(), weight, style: 'normal' })
        }
        if (!fonts.length) throw new Error('no fonts in the Fontshare stylesheet')
        return fonts
      } catch (error) {
        console.error('[og] General Sans not loaded; using the built-in font', error)
        fontsPromise = null // try again on the next card
        return []
      }
    })()
  }
  return fontsPromise
}

function dataUrl(bytes: ArrayBuffer | Buffer, type: string) {
  return `data:${type};base64,${Buffer.from(bytes as ArrayBuffer).toString('base64')}`
}

/** The avatar as a data URL (read from public/, so the file is bundled with the function). */
export async function avatarDataUrl() {
  try {
    return dataUrl(await readFile(path.join(process.cwd(), 'public/images/brand/seb-avatar.png')), 'image/png')
  } catch {
    return null
  }
}

/**
 * An image for a card as a data URL: a Blob URL is fetched, a site path is read from public/.
 * Only PNG and JPEG work in next/og; anything else (or a failed fetch) returns null and the card
 * is drawn without it.
 */
export async function imageDataUrl(src?: string): Promise<string | null> {
  if (!src) return null
  try {
    if (src.startsWith('/')) {
      const type = /\.png$/i.test(src) ? 'image/png' : /\.jpe?g$/i.test(src) ? 'image/jpeg' : null
      if (!type) return null
      return dataUrl(await readFile(path.join(process.cwd(), 'public', src)), type)
    }
    const response = await fetch(src, { signal: AbortSignal.timeout(6000) })
    const type = response.headers.get('content-type')?.split(';')[0] || ''
    if (!response.ok || !['image/png', 'image/jpeg'].includes(type)) return null
    return dataUrl(await response.arrayBuffer(), type)
  } catch {
    return null
  }
}

export function SiteCard({ avatar }: { avatar: string | null }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: PAPER, fontFamily: 'General Sans', color: INK, padding: '72px 80px', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, paddingRight: 48 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: SOFT }}>Crypto · Solana · AI</div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 92, fontWeight: 600, lineHeight: 1, letterSpacing: -2 }}>Seb Montgomery</div>
          <div style={{ display: 'flex', marginTop: 30, fontSize: 36, fontWeight: 500, lineHeight: 1.3, color: SOFT, maxWidth: 620 }}>
            Independent research on crypto, markets and the products reshaping finance.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 30, fontWeight: 600 }}>
          <div style={{ display: 'flex', width: 44, height: 8, borderRadius: 4, background: ACCENT, marginRight: 18 }} />
          sebmonty.link
        </div>
      </div>
      {avatar && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', padding: 14, paddingBottom: 54, background: BONE, borderRadius: 10, boxShadow: '0 18px 40px rgba(33,29,22,0.18)', transform: 'rotate(3deg)' }}>
            <img src={avatar} width={300} height={300} style={{ borderRadius: 4 }} alt="" />
          </div>
        </div>
      )}
    </div>
  )
}

type ArticleCardProps = {
  title: string
  category?: string
  dateLabel?: string
  author: string
  cover: string | null
  coverPosition?: string
  avatar: string | null
}

function headlineSize(title: string, withCover: boolean) {
  if (withCover) return title.length <= 50 ? 42 : title.length <= 80 ? 36 : 31
  if (title.length <= 48) return 72
  if (title.length <= 70) return 62
  if (title.length <= 95) return 54
  return 46
}

const COVER_HEIGHT = 430

/**
 * With a cover: the cover across the top (its own artwork and text untouched), and the headline
 * on a cream strip below. Without one: a cream card with a large headline.
 */
export function ArticleCard({ title, category, dateLabel, author, cover, coverPosition, avatar }: ArticleCardProps) {
  if (cover) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: PAPER, fontFamily: 'General Sans', color: INK }}>
        <img
          src={cover}
          width={1200}
          height={COVER_HEIGHT}
          alt=""
          style={{ width: 1200, height: COVER_HEIGHT, objectFit: 'cover', objectPosition: coverPosition === 'left' ? 'left center' : coverPosition === 'right' ? 'right center' : 'center' }}
        />
        <div style={{ display: 'flex', width: 1200, height: 6, background: ACCENT }} />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', padding: '0 56px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 820 }}>
            {category && (
              <div style={{ display: 'flex', fontSize: 19, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: SOFT, marginBottom: 10 }}>{category}</div>
            )}
            <div style={{ display: 'flex', fontSize: headlineSize(title, true), fontWeight: 600, lineHeight: 1.1, letterSpacing: -0.5 }}>{title}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 24, fontWeight: 600 }}>
              {avatar && <img src={avatar} width={44} height={44} style={{ borderRadius: 22, marginRight: 12 }} alt="" />}
              sebmonty.link
            </div>
            <div style={{ display: 'flex', marginTop: 8, fontSize: 19, fontWeight: 500, color: SOFT }}>
              {author}
              {dateLabel ? ` · ${dateLabel}` : ''}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: PAPER, fontFamily: 'General Sans', color: INK, padding: '64px 72px' }}>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 600 }}>
        <div style={{ display: 'flex', width: 44, height: 8, borderRadius: 4, background: ACCENT, marginRight: 18 }} />
        sebmonty.link
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {category && (
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', color: SOFT, marginBottom: 18 }}>{category}</div>
        )}
        <div style={{ display: 'flex', fontSize: headlineSize(title, false), fontWeight: 600, lineHeight: 1.08, letterSpacing: -1, maxWidth: 1060 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 30, fontSize: 26, fontWeight: 500, color: SOFT }}>
          {avatar && <img src={avatar} width={48} height={48} style={{ borderRadius: 24, marginRight: 16 }} alt="" />}
          {author}
          {dateLabel ? ` · ${dateLabel}` : ''}
        </div>
      </div>
    </div>
  )
}
