// X (Twitter) posts in articles. Used by the Studio editor (browser), the server action that
// fetches a post, and the site renderer (components/blog/XPostEmbed.tsx).
//
// When an editor inserts a post, the server reads X's public embed data (the same data behind
// publish.twitter.com embeds: cdn.syndication.twimg.com/tweet-result, no key) and keeps a small,
// cleaned-up copy in the article: author, text with its links, photos, video, link preview and a
// quoted post. The site draws that copy as a card, so pages load no X script, stay up if X is down,
// and keep showing the post if it is later deleted. Images still load from X's image server.
//
// The cleaning (normalizeXPost) is adapted from the Breakpoint guide's reader
// (breakpoint/server/tweets.mjs), copied rather than imported so the two can change independently.

export type XPostSegment = { text: string; href?: string }

export type XPostMedia = {
  type: 'photo' | 'video' | 'gif'
  image: string
  width: number
  height: number
  alt?: string
  /** MP4 on video.twimg.com, loaded only when the reader presses play. */
  video?: string
  durationMs?: number
}

export type XPostLinkCard = {
  url: string
  title: string
  description: string
  domain: string
  image: string | null
  large: boolean
}

export type XPostAuthor = {
  name: string
  handle: string
  avatar: string | null
  square: boolean
  verified: 'blue' | 'business' | 'government' | null
}

export type XPostSnapshot = {
  id: string
  url: string
  createdAt: string | null
  author: XPostAuthor
  text: XPostSegment[]
  /** Long post: X's embed data has only the first part. */
  truncated: boolean
  media: XPostMedia[]
  card?: XPostLinkCard
  quoted?: XPostSnapshot
}

/** The article block: the link the editor pasted, and the copy saved when it was inserted or refreshed. */
export type XPostBlock = { _type: 'xPost'; _key: string; url: string; post?: XPostSnapshot; fetchedAt?: string }

const STATUS = /^https:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/[A-Za-z0-9_]{1,15}\/status(?:es)?\/(\d{5,25})(?:[/?#]|$)/
const TEXT_LIMIT = 4000

/** The post id in an x.com or twitter.com post link, or null. */
export function xPostId(url: string): string | null {
  return STATUS.exec(String(url ?? '').trim())?.[1] ?? null
}

/** Token X's embed endpoint expects (derived from the id; the same formula X's own embed script uses). */
export function xEmbedToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '')
}

type Raw = Record<string, any> // X's embed JSON; only read through the guards below

const https = (value: unknown): string | null => {
  try {
    const url = new URL(String(value))
    return url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}
const twimg = (value: unknown) => {
  const href = https(value)
  return href && /^https:\/\/pbs\.twimg\.com\//.test(href) ? href : null
}
const unescapeHtml = (text: string) =>
  text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
const clip = (text: string, length: number) => (text.length > length ? `${text.slice(0, length - 1)}…` : text)

function author(user: Raw = {}): XPostAuthor {
  const avatar = twimg(user.profile_image_url_https)
  return {
    name: clip(String(user.name ?? ''), 80),
    handle: String(user.screen_name ?? '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 15),
    // _normal is 48 px; 200x200 stays sharp on retina at the size the card uses.
    avatar: avatar ? avatar.replace(/_normal(\.\w+)$/, '_200x200$1') : null,
    square: user.profile_image_shape === 'Square',
    verified:
      user.verified_type === 'Business' ? 'business' : user.verified_type === 'Government' ? 'government' : user.is_blue_verified || user.verified ? 'blue' : null,
  }
}

/** The text as plain segments plus links for URLs, @mentions, #hashtags and $cashtags. */
function segments(tweet: Raw): XPostSegment[] {
  const chars = Array.from(String(tweet.text ?? ''))
  const [start, end] = Array.isArray(tweet.display_text_range) ? tweet.display_text_range : [0, chars.length]
  const entities = tweet.entities ?? {}
  const marks: Array<{ at: [number, number]; text: string; href: string }> = []
  for (const u of entities.urls ?? []) {
    const href = https(u.expanded_url)
    if (href) marks.push({ at: u.indices, text: u.display_url || href, href })
  }
  for (const m of entities.user_mentions ?? []) marks.push({ at: m.indices, text: `@${m.screen_name}`, href: `https://x.com/${m.screen_name}` })
  for (const h of entities.hashtags ?? []) marks.push({ at: h.indices, text: `#${h.text}`, href: `https://x.com/hashtag/${encodeURIComponent(h.text)}` })
  for (const s of entities.symbols ?? []) marks.push({ at: s.indices, text: `$${s.text}`, href: `https://x.com/search?q=%24${encodeURIComponent(s.text)}` })
  marks.sort((a, b) => a.at[0] - b.at[0])

  const out: XPostSegment[] = []
  let position = start
  const plain = (to: number) => {
    if (to > position) out.push({ text: unescapeHtml(chars.slice(position, to).join('')) })
  }
  for (const mark of marks) {
    const [a, b] = mark.at ?? []
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < position || b > end || b <= a) continue
    plain(a)
    out.push({ text: mark.text, href: mark.href })
    position = b
  }
  plain(Math.min(end, chars.length))
  if (out.length) {
    out[0].text = out[0].text.replace(/^\s+/, '')
    out[out.length - 1].text = out[out.length - 1].text.replace(/\s+$/, '')
  }

  const result: XPostSegment[] = []
  let total = 0
  for (const segment of out) {
    if (!segment.text) continue
    if (total + segment.text.length > TEXT_LIMIT) {
      const room = TEXT_LIMIT - total
      if (room > 1) result.push({ text: `${segment.text.slice(0, room - 1)}…` })
      break
    }
    result.push(segment)
    total += segment.text.length
  }
  return result
}

function media(tweet: Raw): XPostMedia[] {
  const items: XPostMedia[] = []
  for (const m of (tweet.mediaDetails ?? []).slice(0, 4)) {
    const image = twimg(m.media_url_https)
    if (!image) continue
    const item: XPostMedia = {
      type: m.type === 'video' ? 'video' : m.type === 'animated_gif' ? 'gif' : 'photo',
      image,
      width: m.original_info?.width || m.sizes?.large?.w || 16,
      height: m.original_info?.height || m.sizes?.large?.h || 9,
    }
    if (typeof m.ext_alt_text === 'string' && m.ext_alt_text.trim()) item.alt = clip(m.ext_alt_text.trim(), 400)
    if (item.type !== 'photo') {
      // Smallest MP4 at or above ~800 kbps (fine at card size), else the best available.
      const mp4 = (m.video_info?.variants ?? [])
        .filter((v: Raw) => v.content_type === 'video/mp4' && /^https:\/\/video\.twimg\.com\//.test(v.url ?? ''))
        .sort((a: Raw, b: Raw) => (a.bitrate ?? 0) - (b.bitrate ?? 0))
      const pick = mp4.find((v: Raw) => (v.bitrate ?? 0) >= 800000) ?? mp4[mp4.length - 1]
      if (pick) item.video = pick.url
      if (m.video_info?.duration_millis) item.durationMs = m.video_info.duration_millis
    }
    items.push(item)
  }
  return items
}

function linkCard(tweet: Raw): XPostLinkCard | null {
  const card = tweet.card
  if (!card || !/^summary/.test(card.name ?? '')) return null
  const values = card.binding_values ?? {}
  const str = (key: string) => (typeof values[key]?.string_value === 'string' ? values[key].string_value : '')
  const img = (...keys: string[]) => keys.map((key) => twimg(values[key]?.image_value?.url)).find(Boolean) ?? null
  const target = (tweet.entities?.urls ?? []).find((u: Raw) => u.url === card.url)
  const url = https(target?.expanded_url) ?? https(str('card_url'))
  if (!url) return null
  return {
    url,
    title: clip(str('title'), 140),
    description: clip(str('description'), 220),
    domain: clip(str('vanity_url') || str('domain') || new URL(url).hostname, 60),
    image:
      card.name === 'summary_large_image'
        ? img('summary_photo_image_large', 'photo_image_full_size_large', 'thumbnail_image_large')
        : img('thumbnail_image_large', 'thumbnail_image'),
    large: card.name === 'summary_large_image',
  }
}

/** Clean up X's embed data. Returns 'deleted' for a removed post, null if unusable. */
export function normalizeXPost(raw: unknown, { quoted = false } = {}): XPostSnapshot | 'deleted' | null {
  if (!raw || typeof raw !== 'object') return null
  const tweet = raw as Raw
  if (tweet.__typename === 'TweetTombstone' || tweet.tombstone) return 'deleted'
  if (!tweet.id_str || !tweet.user) return null
  const who = author(tweet.user)
  if (!who.handle) return null
  const post: XPostSnapshot = {
    id: String(tweet.id_str),
    url: `https://x.com/${who.handle}/status/${tweet.id_str}`,
    createdAt: tweet.created_at && !Number.isNaN(Date.parse(tweet.created_at)) ? new Date(tweet.created_at).toISOString() : null,
    author: who,
    text: segments(tweet),
    truncated: Boolean(tweet.note_tweet),
    media: media(tweet),
  }
  const card = post.media.length ? null : linkCard(tweet)
  if (card) post.card = card
  if (!quoted && tweet.quoted_tweet) {
    const inner = normalizeXPost(tweet.quoted_tweet, { quoted: true })
    if (inner && inner !== 'deleted') {
      inner.media = inner.media.slice(0, 1)
      delete inner.card
      post.quoted = inner
    }
  }
  return post
}

/** The post's text as one plain string (for Markdown copies, alt text and search). */
export function xPostPlainText(post: XPostSnapshot): string {
  return post.text.map((segment) => segment.text).join('')
}
