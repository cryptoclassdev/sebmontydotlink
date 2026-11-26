import type { Metadata } from 'next'

import { NewPostButton } from '@/components/studio/NewPostButton'

export const metadata: Metadata = { title: 'Posts' }

export default function PostsIndex() {
  return (
    <div className="st-empty">
      <div>
        <h2>Pick a post, or start a new one</h2>
        <p>Drafts save automatically. Nothing appears on the site until you press Publish.</p>
        <NewPostButton className="st-btn primary" label="New post" />
      </div>
    </div>
  )
}
