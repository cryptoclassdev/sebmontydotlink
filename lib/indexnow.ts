// Tells Bing (and the other IndexNow search engines: Yandex, Seznam, Naver) the moment an
// article goes live, changes or is taken down, instead of waiting for their next crawl.
// Bing's index also feeds ChatGPT search and Copilot. Production only; never blocks the Studio.
// The key is public by design: it is served at /<key>.txt so the search engines can check
// that pings for this host come from its owner. See docs/seo.md.
import 'server-only'

import { after } from 'next/server'

import { SITE_URL } from '@/lib/seo'

export const INDEXNOW_KEY = 'bbb991b7e857dbb153321542a98303af'

async function submit(paths: string[]) {
  const urlList = [...new Set(paths)].map((path) => `${SITE_URL}${path}`)
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(SITE_URL).host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`, urlList }),
      signal: AbortSignal.timeout(8000),
    })
    // 200 and 202 both mean accepted.
    console.log(`[indexnow] ${response.status} ${urlList.join(' ')}`)
  } catch (error) {
    console.error('[indexnow] ping failed', error)
  }
}

/** Ping IndexNow with these site paths after the response is sent (production only). */
export function notifyIndexNow(paths: Array<string | null | undefined>) {
  if (process.env.VERCEL_ENV !== 'production') return
  const list = paths.filter(Boolean) as string[]
  if (!list.length) return
  const task = () => submit(list)
  try {
    after(task)
  } catch {
    void task() // outside a request (scripts): send it straight away
  }
}
