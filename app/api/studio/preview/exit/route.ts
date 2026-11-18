import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/** Turns draft mode off and goes back to the Studio (or the given site path). */
export async function GET(request: Request) {
  ;(await draftMode()).disable()
  const to = new URL(request.url).searchParams.get('to') || '/studio/posts'
  redirect(to.startsWith('/') && !to.startsWith('//') ? to : '/studio/posts')
}
