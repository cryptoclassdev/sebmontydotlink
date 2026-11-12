'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { getAuthClient } from '@/lib/studio/auth-client'
import type { StudioUser } from '@/lib/studio/session'

const NAV = [
  { href: '/studio/posts', label: 'Posts' },
  { href: '/studio/media', label: 'Media' },
  { href: '/studio/comments', label: 'Comments' },
  { href: '/studio/categories', label: 'Categories' },
  { href: '/studio/authors', label: 'Authors' },
  { href: '/studio/team', label: 'Team' },
]

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function TopBar({ user, pendingComments }: { user: StudioUser; pendingComments: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  async function signOut() {
    await getAuthClient().signOut()
    router.replace('/studio/login')
    router.refresh()
  }

  return (
    <header className="st-top">
      <Link href="/studio/posts" className="st-brand">
        <span className="st-brand-mark" aria-hidden="true">
          S
        </span>
        sebmonty.link <small>Studio</small>
      </Link>
      <nav className="st-nav" aria-label="Studio">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? 'page' : undefined}>
            {item.label}
            {item.href === '/studio/comments' && pendingComments > 0 && (
              <span className="st-count" aria-label={`${pendingComments} waiting`}>
                {pendingComments}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="st-top-right">
        <a className="st-btn ghost small st-hide-sm" href="/blog" target="_blank" rel="noreferrer">
          View blog ↗
        </a>
        <div className="st-menu" ref={menuRef}>
          <button type="button" className="st-icon-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} aria-label="Account menu">
            <span className="st-avatar">{initials(user.name)}</span>
          </button>
          {open && (
            <div className="st-menu-list" role="menu">
              <header>
                <strong>{user.name}</strong>
                <span>
                  {user.email} · {user.role}
                </span>
              </header>
              <Link role="menuitem" className="st-menu-item" href="/studio/account" onClick={() => setOpen(false)}>
                Account and password
              </Link>
              <button role="menuitem" type="button" className="st-menu-item" onClick={signOut}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
