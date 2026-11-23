import 'server-only'

import { normalizeXPost, xEmbedToken, xPostId, type XPostSnapshot } from './xpost'

const SYNDICATION = 'https://cdn.syndication.twimg.com/tweet-result'
const TIMEOUT_MS = 8000

export type XPostFetchResult = { ok: true; post: XPostSnapshot; fetchedAt: string } | { ok: false; error: string }

/** Reads an X post from X's public embed data and returns the cleaned-up copy the article keeps. */
export async function fetchXPost(url: string): Promise<XPostFetchResult> {
  const id = xPostId(url)
  if (!id) return { ok: false, error: 'Paste the link to a post, like https://x.com/name/status/1234567890.' }
  let response: Response
  try {
    response = await fetch(`${SYNDICATION}?id=${id}&lang=en&token=${xEmbedToken(id)}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    })
  } catch {
    return { ok: false, error: 'X did not answer. Try again in a minute.' }
  }
  if (response.status === 404) return { ok: false, error: 'X says this post does not exist. It may be deleted, or from a private account.' }
  if (!response.ok) return { ok: false, error: `X did not return the post (error ${response.status}). Try again in a minute.` }
  let raw: unknown
  try {
    raw = await response.json()
  } catch {
    return { ok: false, error: 'X sent something that is not a post. Try again in a minute.' }
  }
  const post = normalizeXPost(raw)
  if (post === 'deleted') return { ok: false, error: 'This post has been deleted or hidden on X.' }
  if (!post) return { ok: false, error: 'X sent the post in a form the Studio cannot read. Check the link.' }
  return { ok: true, post, fetchedAt: new Date().toISOString() }
}
