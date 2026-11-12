import type { Metadata } from 'next'

import { AccountForm } from '@/components/studio/AccountForm'
import { requireUser } from '@/lib/studio/session'

export const metadata: Metadata = { title: 'Account' }

export default async function AccountPage() {
  const user = await requireUser()
  return (
    <main className="st-page" style={{ maxWidth: 560 }}>
      <div className="st-page-head">
        <div>
          <h1>Your account</h1>
          <p>
            {user.name} · {user.email} · {user.role}
          </p>
        </div>
      </div>
      <div className="st-card" style={{ padding: 20 }}>
        <AccountForm />
      </div>
    </main>
  )
}
