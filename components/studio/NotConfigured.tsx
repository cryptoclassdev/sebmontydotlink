/** Shown instead of the Studio until its database and secret are set in the environment. */
export function NotConfigured() {
  const missing = [
    !process.env.DATABASE_URL && 'DATABASE_URL',
    !process.env.BETTER_AUTH_SECRET && 'BETTER_AUTH_SECRET',
  ].filter(Boolean)
  return (
    <main className="st-auth">
      <div className="st-auth-card">
        <div className="st-brand">
          <span className="st-brand-mark">S</span> Studio
        </div>
        <h1>The Studio isn&apos;t connected yet</h1>
        <p>
          It needs a database and a secret before anyone can sign in. Missing: <code>{missing.join(', ')}</code>. The steps are in{' '}
          <code>docs/studio.md</code>.
        </p>
      </div>
    </main>
  )
}
