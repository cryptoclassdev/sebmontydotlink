import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="publication-page">
      <SiteHeader current="writing" />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
