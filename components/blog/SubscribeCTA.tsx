'use client'

import { useState } from 'react'

interface SubscribeCTAProps {
  publicationName?: string
  description?: string
  variant?: 'inline' | 'card'
}

export function SubscribeCTA({
  publicationName = 'Blog',
  description = 'Get the latest posts delivered right to your inbox.',
  variant = 'inline',
}: SubscribeCTAProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    // TODO: Implement actual subscription logic
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setEmail('')
  }

  if (variant === 'card') {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Subscribe to {publicationName}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Type your email..."
            className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#ff6719] hover:bg-[#e55a14] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Type your email..."
        className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting || !email}
        className="px-6 py-2.5 text-sm font-medium text-white bg-[#ff6719] hover:bg-[#e55a14] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors"
      >
        {isSubmitting ? '...' : 'Subscribe'}
      </button>
    </form>
  )
}
