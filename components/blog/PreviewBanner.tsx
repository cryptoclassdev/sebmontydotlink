/** Shown to Studio users while they look at a draft (Next.js draft mode). */
export function PreviewBanner({ postId }: { postId: string }) {
  return (
    <div className="article-preview-banner" role="status">
      <span>
        <strong>Preview.</strong> You&apos;re looking at the draft; readers still see the published version (or nothing, if it isn&apos;t published yet).
      </span>
      <span className="article-preview-banner__links">
        <a href={`/studio/posts/${postId}`}>Back to the Studio</a>
        <a href={`/api/studio/preview/exit?to=${encodeURIComponent(`/studio/posts/${postId}`)}`}>Exit preview</a>
      </span>
    </div>
  )
}
