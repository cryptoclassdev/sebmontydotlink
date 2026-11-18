'use client'

import { useState } from 'react'

import { getAuthClient } from '@/lib/studio/auth-client'

export function AccountForm() {
  const [message, setMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const newPassword = String(form.get('new') || '')
    if (newPassword !== String(form.get('confirm') || '')) return setMessage({ kind: 'error', text: 'The two new passwords do not match.' })
    if (newPassword.length < 10) return setMessage({ kind: 'error', text: 'Use at least 10 characters.' })
    setPending(true)
    const { error } = await getAuthClient().changePassword({
      currentPassword: String(form.get('current') || ''),
      newPassword,
      revokeOtherSessions: true,
    })
    setPending(false)
    if (error) return setMessage({ kind: 'error', text: error.status === 429 ? 'Too many attempts. Wait a few minutes.' : 'Your current password is wrong.' })
    formElement.reset()
    setMessage({ kind: 'success', text: 'Password changed. Other devices were signed out.' })
  }

  return (
    <form onSubmit={onSubmit}>
      <h2 style={{ margin: '0 0 14px', fontSize: 16 }}>Change password</h2>
      <div className="st-field">
        <label htmlFor="current">Current password</label>
        <input id="current" name="current" type="password" required className="st-input" autoComplete="current-password" />
      </div>
      <div className="st-field">
        <label htmlFor="new">New password</label>
        <input id="new" name="new" type="password" minLength={10} required className="st-input" autoComplete="new-password" />
      </div>
      <div className="st-field">
        <label htmlFor="confirm">Repeat new password</label>
        <input id="confirm" name="confirm" type="password" minLength={10} required className="st-input" autoComplete="new-password" />
      </div>
      {message && (
        <div className={`st-banner ${message.kind}`} role={message.kind === 'error' ? 'alert' : 'status'} style={{ margin: '0 0 14px' }}>
          {message.text}
        </div>
      )}
      <button type="submit" className="st-btn primary" disabled={pending}>
        {pending ? 'Saving…' : 'Change password'}
      </button>
    </form>
  )
}
