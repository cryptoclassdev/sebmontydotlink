import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { NotConfigured } from '@/components/studio/NotConfigured'
import { SetupForm } from '@/components/studio/SetupForm'
import { isAuthConfigured } from '@/lib/studio/auth'
import { userCount } from '@/lib/studio/users'

export const metadata: Metadata = { title: 'Set up' }
export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  if (!isAuthConfigured()) return <NotConfigured />
  if ((await userCount()) > 0) redirect('/studio/login')
  const tokenSet = Boolean(process.env.STUDIO_SETUP_TOKEN)
  return (
    <main className="st-auth">
      <div className="st-auth-card">
        <div className="st-brand">
          <span className="st-brand-mark">S</span> sebmonty.link <small>Studio</small>
        </div>
        <h1>Create the admin account</h1>
        <p>This page only works once, while the Studio has no accounts. The admin then adds everyone else on the Team page.</p>
        {tokenSet ? (
          <SetupForm />
        ) : (
          <div className="st-banner error" style={{ margin: 0 }}>
            Set <code>STUDIO_SETUP_TOKEN</code> in the environment first (see docs/studio.md).
          </div>
        )}
      </div>
    </main>
  )
}
