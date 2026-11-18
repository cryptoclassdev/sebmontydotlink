'use client'

import { useActionState } from 'react'

import { setupAction, type SetupState } from '@/app/studio/actions'

export function SetupForm() {
  const [state, formAction, pending] = useActionState<SetupState, FormData>(setupAction, {})
  return (
    <form action={formAction}>
      <div className="st-field">
        <label htmlFor="token">Setup code</label>
        <input id="token" name="token" type="password" required className="st-input" autoComplete="off" />
        <p className="st-hint">The value of STUDIO_SETUP_TOKEN.</p>
      </div>
      <div className="st-field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" required className="st-input" autoComplete="name" defaultValue={state.values?.name} />
      </div>
      <div className="st-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="st-input" autoComplete="username" defaultValue={state.values?.email} />
      </div>
      <div className="st-field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" minLength={10} required className="st-input" autoComplete="new-password" />
        <p className="st-hint">At least 10 characters.</p>
      </div>
      <div className="st-field">
        <label htmlFor="confirm">Repeat password</label>
        <input id="confirm" name="confirm" type="password" minLength={10} required className="st-input" autoComplete="new-password" />
      </div>
      {state.error && (
        <p className="st-field-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="st-btn primary" disabled={pending}>
        {pending ? 'Creating…' : 'Create admin account'}
      </button>
    </form>
  )
}
