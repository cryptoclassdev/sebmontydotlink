import { getApprovedComments } from '@/lib/studio/public'

import { CommentForm } from './CommentForm'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })
}

/** Approved reader comments and the form for new ones (Studio articles only). */
export async function ArticleComments({ postId, slug }: { postId: string; slug: string }) {
  const comments = await getApprovedComments(postId).catch(() => [])
  return (
    <section className="article-comments" aria-labelledby="article-comments-title">
      <span className="site-eyebrow">Discussion</span>
      <h2 id="article-comments-title">
        {comments.length ? `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'}` : 'Comments'}
      </h2>
      {comments.length > 0 && (
        <ol className="article-comments__list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <p className="article-comments__meta">
                <strong>{comment.name}</strong> <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
              </p>
              <p className="article-comments__body">{comment.body}</p>
            </li>
          ))}
        </ol>
      )}
      <CommentForm slug={slug} />
    </section>
  )
}
