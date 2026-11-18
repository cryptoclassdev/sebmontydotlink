import type { Metadata } from 'next'

import { createPostAction } from '@/app/studio/actions'

export const metadata: Metadata = { title: 'Posts' }

export default function PostsIndex() {
  return (
    <div className="st-empty">
      <div>
        <h2>Pick a post, or start a new one</h2>
        <p>Drafts save automatically. Nothing appears on the site until you press Publish.</p>
        <form action={createPostAction}>
          <button type="submit" className="st-btn primary">
            New post
          </button>
        </form>
      </div>
    </div>
  )
}
