'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

type MintAddress = {
  symbol: 'BOT' | 'BOTon'
  detail: string
  address: string
}

const mintAddressPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/

function mintAddressesFromCode(code: string): MintAddress[] {
  const entries: MintAddress[] = []

  for (const section of code.trim().split(/\n\s*\n/)) {
    const address = section.match(mintAddressPattern)?.[0]
    if (!address) continue

    const heading = section.split('\n').find((line) => line.trim() && !mintAddressPattern.test(line))?.trim() ?? ''

    if (/^BOT\s*(?:\(|:|$)/i.test(heading)) {
      entries.push({
        symbol: 'BOT' as const,
        detail: 'The verified on-chain version from Backpack Securities and Sunrise.',
        address,
      })
      continue
    }

    if (/^BOTON\s*(?:\(|:|$)/i.test(heading)) {
      entries.push({
        symbol: 'BOTon' as const,
        detail: 'A separate cash-settled version from Ondo.',
        address,
      })
    }
  }

  return entries.filter((entry, index, all) => all.findIndex((candidate) => candidate.symbol === entry.symbol) === index)
}

export function CopyCodeBlock({ code, language = 'Text' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState<string | null>(null)
  const mintAddresses = mintAddressesFromCode(code)

  function fallbackCopy(value: string) {
    const field = document.createElement('textarea')
    field.value = value
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.append(field)
    field.select()
    const copied = document.execCommand('copy')
    field.remove()
    return copied
  }

  async function copy(value: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else if (!fallbackCopy(value)) {
        return
      }
    } catch {
      if (!fallbackCopy(value)) return
    }

    setCopied(value)
    window.setTimeout(() => setCopied(null), 1800)
  }

  if (mintAddresses.length > 0) {
    return (
      <section className="article-mint-addresses" aria-label="Official BOT token mint addresses">
        <ul>
          {mintAddresses.map((mint) => (
            <li key={mint.symbol}>
              <div className="article-mint-addresses__heading">
                <div>
                  <h3>{mint.symbol}</h3>
                  <p>{mint.detail}</p>
                </div>
                <button type="button" onClick={() => copy(mint.address)} aria-label={`Copy ${mint.symbol} mint address`}>
                  {copied === mint.address ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied === mint.address ? 'Copied' : 'Copy address'}
                </button>
              </div>
              <code>{mint.address}</code>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <div className="article-code">
      <div className="article-code__toolbar">
        <span>{language}</span>
        <button type="button" onClick={() => copy(code)}>{copied === code ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {copied === code ? 'Copied' : 'Copy'}</button>
      </div>
      <pre tabIndex={0}><code>{code}</code></pre>
    </div>
  )
}
