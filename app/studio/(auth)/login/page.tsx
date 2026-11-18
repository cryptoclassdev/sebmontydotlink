import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/studio/LoginForm'
import { NotConfigured } from '@/components/studio/NotConfigured'
import { isAuthConfigured } from '@/lib/studio/auth'
import { getCurrentUser } from '@/lib/studio/session'
import { userCount } from '@/lib/studio/users'

export const metadata: Metadata = { title: 'Sign in' }
export const dynamic = 'force-dynamic'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ setup?: string }> }) {
  if (!isAuthConfigured()) return <NotConfigured />
  if (await getCurrentUser()) redirect('/studio/posts')
  if ((await userCount()) === 0) redirect('/studio/setup')
  const { setup } = await searchParams
  return (
    <main className="st-auth">
      <div className="st-auth-card">
        <div className="st-brand">
          <span className="st-brand-mark">S</span> sebmonty.link <small>Studio</small>
        </div>
        <h1>Sign in</h1>
        <p>Write, publish and moderate articles.</p>
        {setup === 'done' && <div className="st-banner success" style={{ margin: '0 0 16px' }}>Admin account created. Sign in with it.</div>}
        <LoginForm />
      </div>
    </main>
  )
}
