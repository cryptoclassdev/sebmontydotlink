import { Suspense } from 'react'
import { BlogHeader } from '@/components/blog'
import { client } from '@/sanity/client'
import { siteSettingsQuery } from '@/sanity/queries'
import { urlFor } from '@/sanity/client'
import type { SiteSettings } from '@/sanity/types'

async function getSettings() {
  return client.fetch<SiteSettings>(siteSettingsQuery)
}

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()
  const logoUrl = settings?.logo ? urlFor(settings.logo).width(64).height(64).url() : undefined

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
        <BlogHeader
          publicationName={settings?.publicationName || 'Seb Montgomery'}
          logo={logoUrl}
        />
      </Suspense>
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 mt-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h4 className="font-semibold text-gray-900">
                {settings?.publicationName || 'Seb Montgomery'}
              </h4>
              {settings?.tagline && (
                <p className="text-sm text-gray-600 mt-1">{settings.tagline}</p>
              )}
            </div>
            <nav className="flex flex-wrap gap-4 text-sm text-gray-600">
              <a href="/blog" className="hover:text-gray-900 transition-colors">
                Archive
              </a>
              <a href="/" className="hover:text-gray-900 transition-colors">
                Home
              </a>
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {settings?.publicationName || 'Seb Montgomery'}
          </div>
        </div>
      </footer>
    </div>
  )
}
