import { getAuth, isAuthConfigured } from '@/lib/studio/auth'

export const dynamic = 'force-dynamic'

async function handle(request: Request) {
  if (!isAuthConfigured()) return Response.json({ message: 'The Studio is not configured yet.' }, { status: 503 })
  return getAuth().handler(request)
}

export { handle as GET, handle as POST }
