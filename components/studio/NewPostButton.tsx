'use client'

import { useRef } from 'react'
import { useFormStatus } from 'react-dom'

import { createPostAction } from '@/app/studio/actions'

function SubmitButton({ className, label }: { className: string; label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? 'Creating…' : label}
    </button>
  )
}

/**
 * "New post": creates a draft and opens it. Only one draft per press: the button is disabled while
 * the draft is being created, and a second click that lands before that is ignored.
 */
export function NewPostButton({ className, label }: { className: string; label: string }) {
  const busy = useRef(false)
  return (
    <form
      action={createPostAction}
      onSubmit={(event) => {
        if (busy.current) {
          event.preventDefault()
          return
        }
        busy.current = true
        // If creating fails and the page stays, allow another try after a few seconds.
        window.setTimeout(() => {
          busy.current = false
        }, 5000)
      }}
    >
      <SubmitButton className={className} label={label} />
    </form>
  )
}
