'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyCodeBlock({ code, language = 'Text' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="article-code">
      <div className="article-code__toolbar">
        <span>{language}</span>
        <button type="button" onClick={copy}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre tabIndex={0}><code>{code}</code></pre>
    </div>
  )
}
