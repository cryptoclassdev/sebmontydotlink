import { PostsPanes } from '@/components/studio/PostsPanes'
import { listPosts } from '@/lib/studio/posts'

export default async function PostsLayout({ children }: { children: React.ReactNode }) {
  const posts = await listPosts()
  return <PostsPanes posts={posts}>{children}</PostsPanes>
}
