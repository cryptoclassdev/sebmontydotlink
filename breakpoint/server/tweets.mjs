// Post embeds for entries that come from X, so Catch up can show them the way Discord does:
// author, avatar, the post text with its links, photos, video posters, link previews and quoted posts.
//
// Source: X's public embed data (cdn.syndication.twimg.com/tweet-result, the same data behind
// publish.twitter.com embeds). No key, no cost. Each post is fetched once, normalised to a small
// object and kept in storage under tweets/<id>.json, then attached to the entry as `embed` when
// /api/live and /api/feed are served. Entries are never changed. If X does not answer, the card
// falls back to the excerpt the collector already stored, and the post is tried again 10 minutes later.

const STATUS = /^https:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/[A-Za-z0-9_]{1,15}\/status\/(\d{5,25})(?:[/?#]|$)/;
const SYNDICATION = 'https://cdn.syndication.twimg.com/tweet-result';
const RETRY_FAILED_MS = 10 * 60 * 1000; // a post X did not return
const REFRESH_MS = 6 * 60 * 60 * 1000; // re-check a stored post (deleted since, edited) at most every 6 h
const MAX_FETCH = 12; // per request; the rest fill on later requests
const TIMEOUT_MS = 2500;
const TEXT_LIMIT = 1500;

export const tweetIdOf = (url) => STATUS.exec(String(url ?? ''))?.[1] ?? null;
// Token the embed endpoint expects (derived from the id; the same formula X's own embed script uses).
export const embedToken = (id) => ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');

const https = (u) => {
  try {
    const url = new URL(String(u));
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};
const twimg = (u) => {
  const href = https(u);
  return href && /^https:\/\/pbs\.twimg\.com\//.test(href) ? href : null;
};
const unescape = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

function author(user = {}) {
  const avatar = twimg(user.profile_image_url_https);
  return {
    name: clip(String(user.name ?? ''), 80),
    handle: String(user.screen_name ?? '').replace(/[^A-Za-z0-9_]/g, '').slice(0, 15),
    // _normal is 48 px; 200x200 stays sharp on retina at the 40 px the card uses.
    avatar: avatar ? avatar.replace(/_normal(\.\w+)$/, '_200x200$1') : null,
    square: user.profile_image_shape === 'Square',
    verified: user.verified_type === 'Business' ? 'business' : user.verified_type === 'Government' ? 'government' : user.is_blue_verified || user.verified ? 'blue' : null,
  };
}

// Text as segments: plain text, plus links for URLs, @mentions, #hashtags and $cashtags.
// Indices are code points into the escaped text (as X sends it); media links at the end are dropped.
function segments(tweet) {
  const chars = Array.from(String(tweet.text ?? ''));
  const [start, end] = Array.isArray(tweet.display_text_range) ? tweet.display_text_range : [0, chars.length];
  const e = tweet.entities ?? {};
  const marks = [];
  for (const u of e.urls ?? []) {
    const href = https(u.expanded_url);
    if (href) marks.push({ at: u.indices, text: u.display_url || href, href });
  }
  for (const m of e.user_mentions ?? []) marks.push({ at: m.indices, text: '@' + m.screen_name, href: `https://x.com/${m.screen_name}` });
  for (const h of e.hashtags ?? []) marks.push({ at: h.indices, text: '#' + h.text, href: `https://x.com/hashtag/${encodeURIComponent(h.text)}` });
  for (const s of e.symbols ?? []) marks.push({ at: s.indices, text: '$' + s.text, href: `https://x.com/search?q=%24${encodeURIComponent(s.text)}` });
  marks.sort((a, b) => a.at[0] - b.at[0]);
  const out = [];
  let pos = start;
  const plain = (to) => {
    if (to > pos) out.push({ text: unescape(chars.slice(pos, to).join('')) });
  };
  for (const m of marks) {
    const [a, b] = m.at ?? [];
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < pos || b > end || b <= a) continue;
    plain(a);
    out.push({ text: m.text, href: m.href });
    pos = b;
  }
  plain(Math.min(end, chars.length));
  // Trim, and keep the total small enough for the live feed.
  if (out.length) {
    out[0].text = out[0].text.replace(/^\s+/, '');
    out[out.length - 1].text = out[out.length - 1].text.replace(/\s+$/, '');
  }
  const result = [];
  let total = 0;
  for (const s of out) {
    if (!s.text) continue;
    if (total + s.text.length > TEXT_LIMIT) {
      const room = TEXT_LIMIT - total;
      if (room > 1) result.push({ text: s.text.slice(0, room - 1) + '…' });
      break;
    }
    result.push(s);
    total += s.text.length;
  }
  return result;
}

function media(tweet) {
  return (tweet.mediaDetails ?? [])
    .slice(0, 4)
    .map((m) => {
      const image = twimg(m.media_url_https);
      if (!image) return null;
      const w = m.original_info?.width || m.sizes?.large?.w || 16;
      const h = m.original_info?.height || m.sizes?.large?.h || 9;
      const item = { type: m.type === 'video' ? 'video' : m.type === 'animated_gif' ? 'gif' : 'photo', image, width: w, height: h };
      if (typeof m.ext_alt_text === 'string' && m.ext_alt_text.trim()) item.alt = clip(m.ext_alt_text.trim(), 400);
      if (item.type !== 'photo') {
        // Smallest MP4 at or above ~800 kbps (fine at card size), else the best available.
        const mp4 = (m.video_info?.variants ?? [])
          .filter((v) => v.content_type === 'video/mp4' && /^https:\/\/video\.twimg\.com\//.test(v.url ?? ''))
          .sort((a, b) => (a.bitrate ?? 0) - (b.bitrate ?? 0));
        const pick = mp4.find((v) => (v.bitrate ?? 0) >= 800000) ?? mp4[mp4.length - 1];
        if (pick) item.video = pick.url;
        if (m.video_info?.duration_millis) item.durationMs = m.video_info.duration_millis;
      }
      return item;
    })
    .filter(Boolean);
}

function linkCard(tweet) {
  const c = tweet.card;
  if (!c || !/^summary/.test(c.name ?? '')) return null;
  const v = c.binding_values ?? {};
  const str = (k) => (typeof v[k]?.string_value === 'string' ? v[k].string_value : '');
  const img = (...keys) => keys.map((k) => twimg(v[k]?.image_value?.url)).find(Boolean) ?? null;
  const target = (tweet.entities?.urls ?? []).find((u) => u.url === c.url);
  const url = https(target?.expanded_url) ?? https(str('card_url'));
  if (!url) return null;
  return {
    url,
    title: clip(str('title'), 140),
    description: clip(str('description'), 220),
    domain: clip(str('vanity_url') || str('domain') || new URL(url).hostname, 60),
    image: c.name === 'summary_large_image' ? img('summary_photo_image_large', 'photo_image_full_size_large', 'thumbnail_image_large') : img('thumbnail_image_large', 'thumbnail_image'),
    large: c.name === 'summary_large_image',
  };
}

/** Normalise X's embed data into what a card needs. Returns {deleted:true} for a removed post, null if unusable. */
export function normalizeTweet(raw, { quoted = false } = {}) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.__typename === 'TweetTombstone' || raw.tombstone) return { deleted: true };
  if (!raw.id_str || !raw.user) return null;
  const who = author(raw.user);
  if (!who.handle) return null;
  const embed = {
    id: String(raw.id_str),
    url: `https://x.com/${who.handle}/status/${raw.id_str}`,
    createdAt: raw.created_at && !Number.isNaN(Date.parse(raw.created_at)) ? new Date(raw.created_at).toISOString() : null,
    author: who,
    text: segments(raw),
    truncated: !!raw.note_tweet, // long post: X sends the first part only
    media: media(raw),
  };
  const card = embed.media.length ? null : linkCard(raw);
  if (card) embed.card = card;
  if (!quoted && raw.quoted_tweet) {
    const q = normalizeTweet(raw.quoted_tweet, { quoted: true });
    if (q && !q.deleted) {
      q.media = q.media.slice(0, 1);
      delete q.card;
      embed.quoted = q;
    }
  }
  return embed;
}

async function fetchTweet(id, fetchImpl) {
  const url = `${SYNDICATION}?id=${id}&lang=en&token=${embedToken(id)}`;
  const res = await fetchImpl(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(TIMEOUT_MS), cache: 'no-store' });
  if (res.status === 404) return { deleted: true };
  if (!res.ok) throw new Error(`X embed request failed (${res.status})`);
  const embed = normalizeTweet(await res.json());
  if (!embed) throw new Error('X embed data was not usable');
  return embed;
}

/**
 * createTweetEmbeds({fetchImpl, now}) → attach(bucket, entries)
 * attach returns the entries with `embed` set on every entry whose sourceUrl is an X post that could be
 * resolved. It reads stored embeds in one batch and fetches at most 12 missing ones per call. It never throws.
 */
export function createTweetEmbeds({ fetchImpl = fetch, now = () => Date.now() } = {}) {
  const memory = new Map(); // id -> stored record, for warm server instances (and runs without storage)
  const stale = (r) => !r || (r.embed ? now() - r.checkedAt > REFRESH_MS : now() - r.checkedAt > RETRY_FAILED_MS);

  return async function attach(bucket, entries) {
    try {
      const ids = [...new Set(entries.map((e) => tweetIdOf(e.sourceUrl)).filter(Boolean))];
      if (!ids.length) return entries;
      const unknown = ids.filter((id) => stale(memory.get(id)));
      if (bucket && unknown.length) {
        const keys = unknown.map((id) => `tweets/${id}.json`);
        const objects = bucket.getMany ? await bucket.getMany(keys) : await Promise.all(keys.map((k) => bucket.get(k)));
        await Promise.all(
          objects.map(async (o, i) => {
            if (!o) return;
            const r = await o.json();
            const old = memory.get(unknown[i]);
            if (r && (!old || r.checkedAt > old.checkedAt)) memory.set(unknown[i], r);
          }),
        );
      }
      const due = ids.filter((id) => stale(memory.get(id))).slice(0, MAX_FETCH);
      await Promise.all(
        due.map(async (id) => {
          const old = memory.get(id);
          let record;
          try {
            record = { id, checkedAt: now(), embed: await fetchTweet(id, fetchImpl) };
          } catch (error) {
            // Keep a good embed we already have; otherwise remember the failure so we wait before retrying.
            record = old?.embed ? { ...old, checkedAt: now() } : { id, checkedAt: now(), embed: null, error: String(error?.message ?? error).slice(0, 120) };
          }
          memory.set(id, record);
          if (bucket) await bucket.put(`tweets/${id}.json`, JSON.stringify(record)).catch(() => {});
        }),
      );
      return entries.map((e) => {
        const id = tweetIdOf(e.sourceUrl);
        const embed = id && memory.get(id)?.embed;
        return embed ? { ...e, embed } : e;
      });
    } catch {
      return entries;
    }
  };
}
