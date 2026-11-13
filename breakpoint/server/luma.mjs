// Side events from the official Breakpoint community calendar on Luma
// (https://luma.com/BP-SideEvents). Fetched server-side, normalised to the
// event shape the guide already uses, cached in memory and at the CDN.
//
// Privacy rule carried over from the original build: a venue goes on the map
// only when Luma shows its address publicly. Obfuscated ("guests only")
// coordinates are dropped, never displayed.

export const LUMA_CALENDAR_ID = 'cal-NFEDisEmJoSg0TU';
export const LUMA_CALENDAR_URL = 'https://luma.com/BP-SideEvents';
const API = 'https://api.lu.ma/calendar/get-items';
const WINDOW_START = '2026-11-01T00:00:00.000Z';
const WINDOW_END = '2026-12-01T00:00:00.000Z';
const TTL_MS = 10 * 60 * 1000;
const SLUG = /^[a-zA-Z0-9_-]{1,100}$/;

let cache = null; // { at, value }

function durationMs(text) {
  const m = /^P(?:\d+Y)?(?:\d+M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(text || '');
  if (!m) return null;
  const [, d = 0, h = 0, min = 0, s = 0] = m.map((x) => Number(x || 0));
  const ms = (((d * 24 + h) * 60 + min) * 60 + s) * 1000;
  return ms > 0 ? ms : null;
}

const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export function normalizeLumaItem(item, observedAt = new Date().toISOString()) {
  const e = item && item.event;
  if (!e || !SLUG.test(e.url || '') || e.visibility && e.visibility !== 'public') return null;
  const start = Date.parse(e.start_at);
  if (!Number.isFinite(start)) return null;
  let end = Date.parse(e.end_at);
  if (!Number.isFinite(end) || end <= start) end = start + (durationMs(e.duration_interval) ?? 2 * 3600 * 1000);

  const geo = e.geo_address_info || {};
  const online = ['zoom', 'meet', 'twitter', 'online'].includes(e.location_type);
  const shown = !online && geo.mode === 'shown' && (!e.geo_address_visibility || e.geo_address_visibility === 'public');
  const lat = num(e.coordinate && e.coordinate.latitude), lng = num(e.coordinate && e.coordinate.longitude);
  const venuePublic = shown && lat != null && lng != null && !!str(geo.full_address || geo.address);

  const ticket = item.ticket_info || {};
  const availability = item.registration_availability;
  const registrationStatus = ['open', 'waitlist', 'sold-out'].includes(availability) ? availability : 'check-organizer';
  const price = ticket.is_free === true
    ? [{ name: 'Free', cents: 0, currency: null }]
    : ticket.price && num(ticket.price.cents) != null
      ? [{ name: 'Ticket', cents: ticket.price.cents, currency: str(ticket.price.currency, 8) || null }]
      : [];

  const organizers = [];
  const cal = item.calendar || {};
  if (!cal.is_personal && str(cal.name) && cal.api_id !== LUMA_CALENDAR_ID) organizers.push(str(cal.name, 120));
  for (const h of item.hosts || []) {
    const name = [str(h.first_name, 60), str(h.last_name, 60)].filter(Boolean).join(' ') || str(h.name, 120);
    if (name && !organizers.includes(name)) organizers.push(name);
    if (organizers.length >= 5) break;
  }

  const cover = str(e.cover_url, 500);
  return {
    id: e.url,
    title: str(e.name, 200) || 'Untitled event',
    startsAt: new Date(start).toISOString(),
    endsAt: new Date(end).toISOString(),
    timezone: str(e.timezone, 60) || 'Europe/London',
    venue: online ? 'Online' : venuePublic ? str(geo.address, 160) || str(geo.full_address, 160) : null,
    address: venuePublic ? str(geo.full_address, 300) : null,
    area: venuePublic || online ? null : str(geo.sublocality, 80) || str(geo.city, 80) || null,
    coordinates: venuePublic ? { latitude: lat, longitude: lng } : null,
    venuePublic,
    locationType: online ? 'online' : 'offline',
    sourceUrl: `https://luma.com/${e.url}`,
    observedAt,
    organizers,
    registrationStatus,
    approvalRequired: ticket.require_approval === true,
    isFree: ticket.is_free === true,
    price,
    coverUrl: /^https:\/\/images\.lumacdn\.com\//.test(cover) ? cover : null,
    tags: [],
  };
}

async function fetchPage(params, fetchImpl) {
  const url = API + '?' + new URLSearchParams(params).toString();
  const res = await fetchImpl(url, { headers: { accept: 'application/json' }, next: { revalidate: 600 } });
  if (!res.ok) throw new Error(`Luma responded ${res.status}`);
  return res.json();
}

export async function fetchLumaItems({ fetchImpl = fetch, maxPages = 12 } = {}) {
  const items = [];
  for (const period of ['future', 'past']) {
    let cursor = null;
    for (let page = 0; page < maxPages; page++) {
      const params = { calendar_api_id: LUMA_CALENDAR_ID, period, pagination_limit: '100' };
      if (cursor) params.pagination_cursor = cursor;
      const data = await fetchPage(params, fetchImpl);
      const entries = Array.isArray(data.entries) ? data.entries : [];
      items.push(...entries);
      cursor = data.next_cursor;
      // Past events come newest first; stop once we are before this year's event window.
      const oldest = entries.length ? entries[entries.length - 1].event?.start_at : null;
      if (!data.has_more || !cursor || (period === 'past' && oldest && oldest < WINDOW_START)) break;
    }
  }
  return items;
}

export function buildEvents(items, seedEvents = [], observedAt = new Date().toISOString()) {
  const byId = new Map();
  for (const item of items) {
    const at = item?.event?.start_at || '';
    if (at < WINDOW_START || at >= WINDOW_END) continue;
    const ev = normalizeLumaItem(item, observedAt);
    if (ev && !byId.has(ev.id)) byId.set(ev.id, ev);
  }
  // Keep curated notes from the original research, and keep researched events
  // that are not on the community calendar (e.g. the conference itself).
  for (const s of seedEvents) {
    const live = byId.get(s.id);
    if (live) { if (s.notes?.length) live.notes = s.notes; }
    else byId.set(s.id, { ...s, area: s.area ?? null, isFree: false, coverUrl: null });
  }
  return [...byId.values()].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}

export async function lumaEvents(seedEvents = [], { fetchImpl = fetch, now = Date.now() } = {}) {
  if (cache && now - cache.at < TTL_MS) return cache.value;
  try {
    const checkedAt = new Date(now).toISOString();
    const events = buildEvents(await fetchLumaItems({ fetchImpl }), seedEvents, checkedAt);
    if (events.length < seedEvents.length) throw new Error('Luma returned fewer events than the researched list');
    cache = { at: now, value: { events, source: 'luma', checkedAt } };
    return cache.value;
  } catch (error) {
    if (cache) return cache.value; // serve the last good copy
    throw error;
  }
}

export function _resetLumaCache() { cache = null; }
