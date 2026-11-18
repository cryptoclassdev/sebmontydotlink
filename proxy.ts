import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

// Sends visitors without a Studio session cookie to the sign-in page before any Studio
// page renders. Pages and server actions still check the session itself; this is a first gate.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/studio/login') || pathname.startsWith('/studio/setup')) return NextResponse.next()
  if (!getSessionCookie(request, { cookiePrefix: 'studio' })) {
    return NextResponse.redirect(new URL('/studio/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/studio', '/studio/:path*'],
}
