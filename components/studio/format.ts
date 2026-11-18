const dateTime = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const dateOnly = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return ''
  return dateTime.format(new Date(value))
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return ''
  return dateOnly.format(new Date(value))
}

/** "just now", "5 min ago", "3 h ago", then a date. */
export function timeAgo(value: string | Date | null | undefined, now = Date.now()) {
  if (!value) return ''
  const seconds = Math.round((now - new Date(value).getTime()) / 1000)
  if (seconds < 45) return 'just now'
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h ago`
  return formatDate(value)
}

/** ISO string ⇄ value for <input type="datetime-local"> in the browser's time zone. */
export function isoToLocalInput(iso: string) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function localInputToIso(value: string) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
