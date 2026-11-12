'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { createTeamMemberAction, removeTeamMemberAction, resetPasswordAction, setRoleAction } from '@/app/studio/actions'

import { Dialog } from './Dialog'
import { formatDate, timeAgo } from './format'

type Member = { id: string; name: string; email: string; role: 'admin' | 'editor'; createdAt: string; lastSeenAt: string | null }

function randomPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

export function TeamManager({ team, isAdmin, currentUserId }: { team: Member[]; isAdmin: boolean; currentUserId: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [resetFor, setResetFor] = useState<Member | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'editor' as 'admin' | 'editor', password: '' })
  const [newPassword, setNewPassword] = useState('')
  const [shareNote, setShareNote] = useState('')

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) =>
    startTransition(async () => {
      setError('')
      const result = await action()
      if (!result.ok) return setError(result.error || 'Something went wrong.')
      after?.()
      router.refresh()
    })

  return (
    <main className="st-page">
      <div className="st-page-head">
        <div>
          <h1>Team</h1>
          <p>People who can sign in to this Studio. Editors write, publish and moderate; admins can also manage this list.</p>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="st-btn primary"
            onClick={() => {
              setForm({ name: '', email: '', role: 'editor', password: randomPassword() })
              setError('')
              setAdding(true)
            }}
          >
            Add person
          </button>
        )}
      </div>
      {shareNote && (
        <div className="st-banner success" style={{ margin: '0 0 14px' }}>
          <div>
            {shareNote}{' '}
            <button type="button" className="link" onClick={() => setShareNote('')}>
              Dismiss
            </button>
          </div>
        </div>
      )}
      {error && !adding && !resetFor && <div className="st-banner error" style={{ margin: '0 0 14px' }}>{error}</div>}
      <div className="st-card">
        <table className="st-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last active</th>
              {isAdmin && <th />}
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member.id}>
                <td>
                  <strong>{member.name}</strong>
                  {member.id === currentUserId && <span className="st-hint"> (you)</span>}
                </td>
                <td>{member.email}</td>
                <td>
                  {isAdmin && member.id !== currentUserId ? (
                    <select
                      className="st-select"
                      style={{ width: 'auto', minHeight: 30 }}
                      value={member.role}
                      disabled={pending}
                      aria-label={`Role for ${member.name}`}
                      onChange={(event) => run(() => setRoleAction(member.id, event.target.value as 'admin' | 'editor'))}
                    >
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`st-badge ${member.role}`}>{member.role}</span>
                  )}
                </td>
                <td suppressHydrationWarning>{member.lastSeenAt ? timeAgo(member.lastSeenAt) : `Added ${formatDate(member.createdAt)}`}</td>
                {isAdmin && (
                  <td className="actions">
                    <button
                      type="button"
                      className="st-btn small"
                      onClick={() => {
                        setNewPassword(randomPassword())
                        setError('')
                        setResetFor(member)
                      }}
                    >
                      Set password
                    </button>{' '}
                    {member.id !== currentUserId && (
                      <button
                        type="button"
                        className="st-btn small ghost"
                        disabled={pending}
                        onClick={() => confirm(`Remove ${member.name}'s access to the Studio?`) && run(() => removeTeamMemberAction(member.id))}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={adding}
        onClose={() => setAdding(false)}
        title="Add a person"
        onSubmit={() =>
          run(
            () => createTeamMemberAction(form),
            () => {
              setAdding(false)
              setShareNote(`${form.name} can now sign in at /studio with ${form.email} and the password you copied. They can change it under Account.`)
            },
          )
        }
        footer={
          <>
            <button type="button" className="st-btn" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="st-btn primary" disabled={pending}>
              Add
            </button>
          </>
        }
      >
        <div className="st-field">
          <label htmlFor="member-name">Name</label>
          <input id="member-name" className="st-input" autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </div>
        <div className="st-field">
          <label htmlFor="member-email">Email</label>
          <input id="member-email" type="email" className="st-input" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </div>
        <div className="st-field">
          <label htmlFor="member-role">Role</label>
          <select id="member-role" className="st-select" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as 'admin' | 'editor' })}>
            <option value="editor">Editor: write, publish, moderate</option>
            <option value="admin">Admin: also manages the team</option>
          </select>
        </div>
        <PasswordField id="member-password" value={form.password} onChange={(password) => setForm({ ...form, password })} />
        {error && <p className="st-field-error">{error}</p>}
      </Dialog>

      <Dialog
        open={Boolean(resetFor)}
        onClose={() => setResetFor(null)}
        title={`New password for ${resetFor?.name ?? ''}`}
        onSubmit={() =>
          resetFor &&
          run(
            () => resetPasswordAction(resetFor.id, newPassword),
            () => {
              setShareNote(`Password changed for ${resetFor.name}. They were signed out everywhere and need the new password to sign in.`)
              setResetFor(null)
            },
          )
        }
        footer={
          <>
            <button type="button" className="st-btn" onClick={() => setResetFor(null)}>
              Cancel
            </button>
            <button type="submit" className="st-btn primary" disabled={pending}>
              Set password
            </button>
          </>
        }
      >
        <PasswordField id="reset-password" value={newPassword} onChange={setNewPassword} />
        <p className="st-hint">This signs them out on every device.</p>
        {error && <p className="st-field-error">{error}</p>}
      </Dialog>
    </main>
  )
}

function PasswordField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="st-field">
      <label htmlFor={id}>Temporary password</label>
      <div className="st-row">
        <input id={id} className="st-input mono" value={value} minLength={10} onChange={(event) => onChange(event.target.value)} autoComplete="off" />
        <button
          type="button"
          className="st-btn"
          onClick={async () => {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="st-hint">Send it to them privately (not in a public channel). They can change it after signing in.</p>
    </div>
  )
}
