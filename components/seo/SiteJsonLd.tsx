// Structured data on every page: who Seb is (Person) and what the site is (WebSite).
// Articles point their author and publisher at the Person's @id (components/seo/ArticleJsonLd.tsx).
// Every fact here is also visible on the homepage.
import { absoluteUrl, AVATAR_PATH, jsonLdString, PROFILE_LINKS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo'

export const PERSON_ID = `${SITE_URL}/#seb`
export const WEBSITE_ID = `${SITE_URL}/#website`

export function SiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': PERSON_ID,
        name: SITE_NAME,
        alternateName: 'Seb Monty',
        url: `${SITE_URL}/`,
        image: absoluteUrl(AVATAR_PATH),
        description: 'Independent researcher writing about crypto, Solana and AI. Co-founder of validator.com and founder of thecommunication.link.',
        sameAs: Object.values(PROFILE_LINKS),
        worksFor: [
          { '@type': 'Organization', name: 'validator.com', url: 'https://validator.com' },
          { '@type': 'Organization', name: 'thecommunication.link', url: 'https://thecommunication.link' },
        ],
        knowsAbout: ['Cryptocurrency', 'Solana', 'Decentralized finance', 'Crypto exchanges', 'AI agents'],
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        alternateName: 'sebmonty.link',
        description: SITE_DESCRIPTION,
        inLanguage: 'en-GB',
        publisher: { '@id': PERSON_ID },
        author: { '@id': PERSON_ID },
      },
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
}
