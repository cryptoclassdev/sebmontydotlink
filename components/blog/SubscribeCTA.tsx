'use client'

import { FormEvent, useState } from 'react'

type SubscribeCTAProps = {
  publicationName?: string
  description?: string
  variant?: 'inline' | 'card'
}

export function SubscribeCTA({
  publicationName = 'Blog',
  description = 'Get new research delivered to your inbox.',
  variant = 'inline',
}: SubscribeCTAProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email || status === 'submitting') return
    setStatus('submitting')
    setMessage('')
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const body = await response.json() as { error?: string }
      if (!response.ok) throw new Error(body.error || 'Subscription failed')
      setEmail('')
      setStatus('success')
      setMessage('You’re on the list. Check your inbox for the next piece.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Please try again.')
    }
  }

  return (
    <div className={`subscribe-cta subscribe-cta--${variant}`}>
      {variant === 'card' && (
        <div>
          <h3>Subscribe to {publicationName}</h3>
          <p>{description}</p>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor={`subscribe-email-${variant}`}>Email address</label>
        <input
          id={`subscribe-email-${variant}`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          autoComplete="email"
          required
        />
        <button type="submit" disabled={status === 'submitting' || !email}>
          {status === 'submitting' ? 'Joining…' : 'Subscribe'}
        </button>
      </form>
      <p className={`subscribe-cta__status${status === 'error' ? ' is-error' : ''}`} role="status" aria-live="polite">{message}</p>
    </div>
  )
}
