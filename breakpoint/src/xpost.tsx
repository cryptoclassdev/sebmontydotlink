// A post from X, drawn the way Discord embeds one: author with avatar and badge, the text with its links,
// photos, a playable video, a link preview or the quoted post, and the time. Data comes from the API's
// `embed` field (server/tweets.mjs). Without it (X did not answer yet, or the post was deleted) the same
// layout is drawn from what the X monitor stored: the account name, the handle and the post text.
import React, {useEffect, useState} from 'react';
import {ArrowUpRight, BadgeCheck, LoaderCircle, Play} from 'lucide-react';

type Item = Record<string, any>;
type Segment = {text: string; href?: string};
type Media = {type: 'photo' | 'video' | 'gif'; image: string; width: number; height: number; video?: string; durationMs?: number; alt?: string};
type Author = {name: string; handle: string; avatar?: string | null; square?: boolean; verified?: string | null};

const https = (s: any) => { try { const u = new URL(s); return u.protocol === 'https:' ? u.href : undefined; } catch { return undefined; } };
const initials = (name: string) => name.replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean).map(x => x[0]).slice(0, 2).join('').toUpperCase() || '?';
const stamp = (iso: string, tz: string) => new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz}).format(new Date(iso));
const duration = (ms: number) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
// X image sizes: small is 680 px wide, medium 1200. Card images already carry their size.
const sized = (url: string, name: string) => url.includes('?') ? url : `${url}?name=${name}`;
const BADGE: Record<string, [string, string]> = {business: ['#e2b719', 'Verified organisation'], government: ['#829aab', 'Government account'], blue: ['#1d9bf0', 'Verified account']};

// What the X monitor stored: "Cloudflare · @cloudflare on X" and the post text (with t.co links).
export function fallbackPost(e: Item): {author: Author; text: Segment[]; url: string} {
  const handle = /^https:\/\/(?:www\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\//.exec(e.sourceUrl || '')?.[1] || '';
  const name = String(e.sourceName || '').split(' · ')[0].replace(/ on X$/, '') || handle;
  const raw = String(e.excerpt || '').replace(/(\s*https:\/\/t\.co\/\w+)+\s*$/, '').trim();
  const text: Segment[] = raw.split(/(https:\/\/t\.co\/\w+|@[A-Za-z0-9_]{1,15}\b)/).filter(Boolean).map(part =>
    part.startsWith('https://t.co/') ? {text: part.replace('https://', ''), href: part} : part.startsWith('@') ? {text: part, href: `https://x.com/${part.slice(1)}`} : {text: part});
  return {author: {name, handle}, text, url: e.sourceUrl};
}

function Avatar({author, size = 40}: {author: Author; size?: number}) {
  const [failed, setFailed] = useState(false);
  const cls = `xe-avatar ${author.square ? 'square' : ''}`;
  if (author.avatar && !failed) return <img className={cls} src={author.avatar} alt="" width={size} height={size} loading="lazy" decoding="async" onError={() => setFailed(true)} style={{width: size, height: size}}/>;
  return <span className={`${cls} initials`} style={{width: size, height: size, fontSize: Math.round(size * .36)}} aria-hidden="true">{initials(author.name || author.handle)}</span>;
}

function Byline({author, size}: {author: Author; size?: number}) {
  const badge = author.verified ? BADGE[author.verified] : null;
  return <a className="xe-byline" href={`https://x.com/${author.handle}`} target="_blank" rel="noopener noreferrer">
    <Avatar author={author} size={size}/>
    <span className="xe-names">
      <strong>{author.name}{badge && <BadgeCheck className="xe-badge" size={size && size < 30 ? 13 : 15} fill={badge[0]} color="#fff" strokeWidth={2.4} aria-label={badge[1]}/>}</strong>
      {author.handle && <span>@{author.handle}</span>}
    </span>
  </a>;
}

function Text({segments, className}: {segments: Segment[]; className: string}) {
  return <p className={className}>{segments.map((s, i) => s.href && https(s.href) ? <a key={i} href={https(s.href)} target="_blank" rel="noopener noreferrer">{s.text}</a> : <React.Fragment key={i}>{s.text}</React.Fragment>)}</p>;
}

// X's video host refuses requests that carry another site's address, so the file is fetched without one
// (only when the reader presses play) and played from memory. Long videos and failures open on X instead.
function Video({m, href}: {m: Media; href: string}) {
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [src, setSrc] = useState('');
  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);
  const playable = !!m.video && (m.durationMs ?? 0) <= 180000;
  async function play() {
    setState('loading');
    try {
      const r = await fetch(m.video!, {referrerPolicy: 'no-referrer', credentials: 'omit'});
      if (!r.ok) throw new Error(String(r.status));
      setSrc(URL.createObjectURL(await r.blob()));
      setState('ready');
    } catch { setState('failed'); }
  }
  if (state === 'ready') return <video className="xe-video" src={src} poster={sized(m.image, 'small')} controls autoPlay playsInline muted={m.type === 'gif'} loop={m.type === 'gif'}/>;
  const label = m.type === 'gif' ? 'GIF' : m.durationMs ? duration(m.durationMs) : 'Video';
  const poster = <><img src={sized(m.image, 'small')} alt={m.alt || ''} loading="lazy" decoding="async"/><span className="xe-play" aria-hidden="true">{state === 'loading' ? <LoaderCircle className="xe-spin" size={22}/> : <Play size={22} fill="currentColor"/>}</span><span className="xe-duration">{label}</span></>;
  if (!playable || state === 'failed') return <a className="xe-video-poster" href={href} target="_blank" rel="noopener noreferrer" aria-label={`Watch the ${m.type === 'gif' ? 'GIF' : 'video'} on X`}>{poster}{state === 'failed' && <span className="xe-video-note">Play on X <ArrowUpRight size={12}/></span>}</a>;
  return <button type="button" className="xe-video-poster" onClick={play} disabled={state === 'loading'} aria-label={m.type === 'gif' ? 'Play GIF' : `Play video${m.durationMs ? `, ${duration(m.durationMs)}` : ''}`}>{poster}</button>;
}

function MediaGrid({media, href, full}: {media: Media[]; href: string; full?: boolean}) {
  if (!media.length) return null;
  const one = media.length === 1 ? media[0] : null;
  // A single item keeps its shape, from square up to wide; several share a 16:9 grid.
  const ratio = one ? Math.min(Math.max(one.width / one.height, full ? .8 : 1.2), 2.4) : 16 / 9;
  return <div className={`xe-media count-${media.length} ${full ? 'full' : ''}`} style={{aspectRatio: String(ratio)}}>
    {media.map((m, i) => m.type === 'photo'
      ? <a key={i} href={`${href}/photo/${i + 1}`} target="_blank" rel="noopener noreferrer"><img src={sized(m.image, 'small')} srcSet={`${sized(m.image, 'small')} 680w, ${sized(m.image, 'medium')} 1200w`} sizes="(max-width: 960px) 100vw, 600px" alt={m.alt || ''} loading="lazy" decoding="async"/></a>
      : <Video key={i} m={m} href={href}/>)}
  </div>;
}

function LinkCard({card}: {card: Item}) {
  const href = https(card.url);
  if (!href) return null;
  return <a className={`xe-card ${card.large && card.image ? 'large' : ''}`} href={href} target="_blank" rel="noopener noreferrer">
    {card.image && <img src={card.image} alt="" loading="lazy" decoding="async"/>}
    <span><small>{card.domain}</small>{card.title && <strong>{card.title}</strong>}{!card.large && card.description && <em>{card.description}</em>}</span>
  </a>;
}

function Quoted({post}: {post: Item}) {
  const thumb = post.media?.[0];
  return <a className="xe-quote" href={https(post.url)} target="_blank" rel="noopener noreferrer">
    <span className="xe-quote-head"><Avatar author={post.author} size={18}/><strong>{post.author.name}</strong><span>@{post.author.handle}</span></span>
    <span className="xe-quote-body"><span className="xe-quote-text">{post.text.map((s: Segment) => s.text).join('')}</span>{thumb && <img src={sized(thumb.image, 'small')} alt={thumb.alt || ''} loading="lazy" decoding="async"/>}</span>
  </a>;
}

export function XPost({entry: e, tz, full = false}: {entry: Item; tz: string; full?: boolean}) {
  const embed = e.embed && !e.embed.deleted ? e.embed : null;
  const post = embed ?? fallbackPost(e);
  const href = https(post.url) || https(e.sourceUrl) || 'https://x.com';
  return <div className={`xe-post ${full ? 'full' : ''}`}>
    <div className="xe-head"><Byline author={post.author}/></div>
    {post.text.length > 0 && <Text segments={post.text} className="xe-text"/>}
    {embed?.truncated && <a className="xe-more" href={href} target="_blank" rel="noopener noreferrer">Show more on X</a>}
    {embed && <MediaGrid media={embed.media || []} href={href} full={full}/>}
    {embed?.card && <LinkCard card={embed.card}/>}
    {embed?.quoted && <Quoted post={embed.quoted}/>}
    {e.embed?.deleted && <p className="xe-note">This post has since been deleted on X. The text above is what the desk saved.</p>}
    <div className="xe-foot"><span>X</span><span aria-hidden="true">·</span><time dateTime={embed?.createdAt || e.occurredAt}>{stamp(embed?.createdAt || e.occurredAt, tz)}</time></div>
  </div>;
}
