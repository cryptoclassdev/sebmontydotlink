'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { getAuthClient } from '@/lib/studio/auth-client'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setPending(true)
    setError('')
    const { error: signInError } = await getAuthClient().signIn.email({
      email: String(form.get('email') || '').trim(),
      password: String(form.get('password') || ''),
      rememberMe: form.get('remember') === 'on',
    })
    if (signInError) {
      setPending(false)
      setError(
        signInError.status === 429
          ? 'Too many attempts. Wait a few minutes and try again.'
          : signInError.status >= 500
            ? 'The Studio could not check your sign-in. Try again, or tell an admin if it keeps happening.'
            : 'Wrong email or password.',
      )
      return
    }
    router.replace('/studio/posts')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="st-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="st-input" />
      </div>
      <div className="st-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="st-input" />
      </div>
      <label className="st-check">
        <input type="checkbox" name="remember" defaultChecked /> Keep me signed in on this device
      </label>
      {error && (
        <p className="st-field-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="st-btn primary" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
