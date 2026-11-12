import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES } from '@/lib/studio/media'
import { getCurrentUser } from '@/lib/studio/session'

export const dynamic = 'force-dynamic'

// Issues short-lived tokens so the browser can upload images straight to Vercel Blob
// (no 4.5 MB function limit). The Studio records the file afterwards with registerMedia.
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const user = await getCurrentUser()
        if (!user) throw new Error('Sign in to upload files.')
        if (!pathname.startsWith('studio/')) throw new Error('Uploads must go in the studio/ folder.')
        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: user.id }),
        }
      },
      // Not used: the Studio registers uploads itself, so this works on protected previews and locally.
      onUploadCompleted: async () => {},
    })
    return Response.json(result)
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Upload failed.' }, { status: 400 })
  }
}
