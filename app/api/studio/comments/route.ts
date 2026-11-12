import { submitComment } from '@/lib/studio/comments'
import { isDatabaseConfigured } from '@/lib/studio/db'

export const dynamic = 'force-dynamic'

// Public endpoint for reader comments. Every comment starts as "pending" and only
// appears on the site after someone approves it in Studio > Comments.
// Body: { slug, name, email?, body, website? }  (website is a honeypot and must stay empty)
export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return Response.json({ ok: false, error: 'Comments are not available yet.' }, { status: 503 })
  let input: Record<string, unknown>
  try {
    input = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'Send the comment as JSON.' }, { status: 400 })
  }
  const text = (value: unknown) => (typeof value === 'string' ? value : '')
  if (text(input.website)) return Response.json({ ok: true })
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || ''
  const result = await submitComment({
    slug: text(input.slug),
    name: text(input.name),
    email: text(input.email),
    body: text(input.body),
    ip,
    userAgent: request.headers.get('user-agent') || '',
  })
  return Response.json(result, { status: result.ok ? 201 : 400 })
}
