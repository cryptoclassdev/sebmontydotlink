'use client'

import { useEffect, useRef } from 'react'

/** Native <dialog>: traps focus, closes on Escape, restores focus when it closes. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  wide?: boolean
  onSubmit?: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const body = (
    <>
      <header>
        <h2>{title}</h2>
        <button type="button" className="st-icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>
      <div className="st-dialog-body">{children}</div>
      {footer && <footer>{footer}</footer>}
    </>
  )

  return (
    <dialog
      ref={ref}
      className={`st-dialog${wide ? ' wide' : ''}`}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      {open &&
        (onSubmit ? (
          <form
            method="dialog"
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            {body}
          </form>
        ) : (
          <div>{body}</div>
        ))}
    </dialog>
  )
}
