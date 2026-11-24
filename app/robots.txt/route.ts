// /robots.txt: every crawler may read the public site; the Studio, APIs and the internal
// Markdown route stay out. A route (not app/robots.ts) because Next's robots helper cannot
// write the Content-Signal line. See docs/seo.md.
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

export function GET() {
  const lines = [
    '# sebmonty.link: independent research by Seb Montgomery.',
    '# Search engines and AI assistants are welcome to read, cite and learn from the public site.',
    '# Content signals: https://contentsignals.org',
    '',
    'User-agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=yes',
    'Disallow: /api/',
    'Disallow: /studio',
    'Disallow: /agent/',
    'Disallow: /breakpoint/api/',
    'Allow: /',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ]
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
