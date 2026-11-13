// Token prices for the guide's projects, from Jupiter's Price API v3
// (https://developers.jup.ag/docs/price). Context only, never a signal.
//
// Rules carried over from the evidence contract:
// - Only projects with a verified mint address (seed.json `mintAddress`, with
//   `mintSourceUrl`) are priced. Tickers alone are never looked up.
// - A token Jupiter does not price is left out, never estimated.
// - When Jupiter fails, the last good prices are served for up to 10 minutes,
//   marked stale. After that the guide shows no prices rather than old ones.

import { USER_AGENT } from './luma.mjs';

export const PRICE_API = 'https://api.jup.ag/price/v3';
export const PRICE_TTL_MS = 30 * 1000;
export const PRICE_STALE_LIMIT_MS = 10 * 60 * 1000;
const MINT = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

let cache = null; // { at, value }

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** Projects that have both a ticker and a verified mint address. */
export function priceTargets(projects) {
  return (projects || [])
    .filter((p) => p && typeof p.symbol === 'string' && p.symbol && MINT.test(p.mintAddress || ''))
    .map((p) => ({ id: p.id, symbol: p.symbol, mint: p.mintAddress }));
}

/** Map Jupiter's response (keyed by mint) to prices keyed by project id. */
export function normalizePrices(targets, body) {
  const out = {};
  for (const t of targets) {
    const row = body && typeof body === 'object' ? body[t.mint] : null;
    const usd = num(row?.usdPrice);
    if (usd == null || usd <= 0) continue;
    out[t.id] = { symbol: t.symbol, mint: t.mint, usd, change24h: num(row.priceChange24h), liquidity: num(row.liquidity) };
  }
  return out;
}

const empty = (error) => ({ source: 'jupiter', checkedAt: null, stale: false, error, prices: {} });

/**
 * @param {any[]} projects
 * @param {{apiKey?: string, fetchImpl?: typeof fetch, now?: number, timeoutMs?: number}} [options]
 */
export async function tokenPrices(projects, { apiKey, fetchImpl = fetch, now = Date.now(), timeoutMs = 4000 } = {}) {
  if (cache && now - cache.at < PRICE_TTL_MS) return cache.value;
  const targets = priceTargets(projects);
  if (!targets.length) return empty('No verified token mints');
  try {
    const headers = { accept: 'application/json', 'user-agent': USER_AGENT };
    if (apiKey) headers['x-api-key'] = apiKey;
    const url = `${PRICE_API}?ids=${targets.map((t) => t.mint).join(',')}`;
    const res = await fetchImpl(url, { headers, cache: 'no-store', signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) throw new Error(`Jupiter responded ${res.status}`);
    const prices = normalizePrices(targets, await res.json());
    if (!Object.keys(prices).length) throw new Error('Jupiter returned no prices');
    cache = { at: now, value: { source: 'jupiter', checkedAt: new Date(now).toISOString(), stale: false, error: null, prices } };
    return cache.value;
  } catch (error) {
    const message = String(error?.message ?? error).slice(0, 200);
    if (cache && now - cache.at < PRICE_STALE_LIMIT_MS) return { ...cache.value, stale: true, error: message };
    return empty(message);
  }
}

/** Source-status entry for the "market" row, derived from real fetches. */
export function marketHealth(result) {
  if (!result) return { state: 'not-connected', lastSeen: null, message: 'Awaiting connection' };
  const count = Object.keys(result.prices || {}).length;
  if (!count) return { state: 'error', lastSeen: null, message: 'Prices unavailable right now' };
  if (result.stale) return { state: 'stale', lastSeen: result.checkedAt, message: 'Showing the last prices from Jupiter' };
  return { state: 'live', lastSeen: result.checkedAt, message: `Jupiter prices for ${count} tokens` };
}

export function _resetPriceCache() { cache = null; }
