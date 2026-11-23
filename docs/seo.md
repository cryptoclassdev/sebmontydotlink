# Search and AI readability

How sebmonty.link tells Google, Bing and AI assistants (ChatGPT search, Claude, Perplexity, Copilot) what is on the site, and what to do for each new article. Added in the "Search and AI readability" pull request (see the README change log).

## What runs on its own

Everything below updates itself when an article is published, edited or taken down in the Studio. `revalidatePublicPages()` in `lib/studio/revalidate.ts` refreshes every one of these addresses.

| Address | What it is | Code |
| --- | --- | --- |
| `/robots.txt` | Lets every crawler read the public site; blocks `/api/`, `/studio`, `/agent/`, `/breakpoint/api/`; carries `Content-Signal: search=yes, ai-input=yes, ai-train=yes` and the sitemap link | `app/robots.txt/route.ts` |
| `/sitemap.xml` | Home, Blog, every live article (with its Updated date as `lastmod`), Skill Files, Breakpoint | `app/sitemap.ts` |
| `/blog/rss.xml` | RSS 2.0 feed of the 20 newest articles | `app/blog/rss.xml/route.ts` |
| `/llms.txt` | Plain-text map for AI agents: who Seb is, every article with its `.md` link, profile links, feed and sitemap | `app/llms.txt/route.ts` |
| `/blog/<slug>.md` | Plain-Markdown copy of each article; sends `Link: <article URL>; rel="canonical"` | `app/agent/articles/[slug]/route.ts`, `lib/studio/markdown.ts` |
| `/og/site` | The site's 1200 x 630 share card | `app/og/site/route.tsx`, `lib/og.tsx` |
| `/og/blog/<slug>` | An article's 1200 x 630 share card: cover across the top, headline below | `app/og/blog/[slug]/route.tsx`, `lib/og.tsx` |
| `/bbb991b7e857dbb153321542a98303af.txt` | IndexNow key file (public by design) | `public/`, `lib/indexnow.ts` |

Articles not listed: posts marked **noindex** in the Studio's SEO tab, or whose canonical URL points elsewhere, are left out of the sitemap, feed and `llms.txt` (`isIndexablePost()` in `lib/seo.ts`).

## Metadata on every page

- `lib/seo.ts` holds the canonical host (`SITE_URL`, www), the profile links and `pageMetadata()`.
- Every page passes its metadata through `pageMetadata(path, title, description)`. That gives it its own canonical link, `og:url`, share image, X large card and the RSS link. Next.js replaces `alternates`, `openGraph` and `twitter` whole when a page sets them, so set them through the helper, never by hand.
- The root layout (`app/layout.tsx`) sets defaults and deliberately has **no canonical**. A canonical there would make every page claim to be the homepage.
- `next.config.mjs` sets `htmlLimitedBots: /.*/`, so metadata is always in `<head>`. Without it, AI crawlers would get it streamed into `<body>` on pages rendered per request (such as `/blog`).
- Article pages (`app/blog/[slug]/page.tsx`):
    - **Title:** the Studio's search title (else the article title), without the " | Seb Montgomery" suffix.
    - **Description:** the Studio's meta description (else the excerpt).
    - **Share image:** the Studio's share image (else the auto card).
    - **Also sent:** published and modified times, and a link to the `.md` copy.
- Card URLs carry `?v=<hash>` of the headline, cover, category and date (`articleShareImage()`). So an edit gives a new URL, and X or LinkedIn fetch the new card.

## Structured data (JSON-LD)

- **Every page** (`components/seo/SiteJsonLd.tsx`):
    - Person: Seb, with `sameAs` links to X, YouTube, LinkedIn and Telegram, and his validator.com and thecommunication.link roles.
    - WebSite.
- **Articles** (`components/seo/ArticleJsonLd.tsx`, with helpers in `lib/blog/structured-data.ts`):
    - BlogPosting: headline, description, images, dates, author and publisher, section, word count, and `citation` from the article's **Sources** list.
    - BreadcrumbList: Home > Blog > article.
    - FAQPage, when the article has **2 or more h2 headings ending in "?"**. Each answer is up to three paragraphs under the heading, stopping at the next heading, picture or chart. So the FAQ always matches the page.
- Google shows FAQ rich results only for a few government and health sites. The markup is there for AI tools and other engines.

## IndexNow (instant notice to Bing)

`lib/indexnow.ts` pings `api.indexnow.org` after a Studio publish or unpublish (`lib/studio/posts.ts`), with the article URL, `/blog` and `/`.

- **Production only:** it runs when `VERCEL_ENV` is `production`, after the response is sent, and never blocks the Studio.
- **Scheduled posts aren't pinged,** because their URL is a 404 until they go live. The sitemap picks them up.
- **Logs:** Vercel's runtime logs show `[indexnow] 200 ...` or `202`; both mean accepted.
- **Who receives it:** Bing, Yandex, Seznam and Naver share the pings. Bing's index feeds ChatGPT search and Copilot.

## Checklist for every new article (in the Studio)

1. **SEO title** of 60 characters or fewer, with the searched term first. The SEO tab counts.
2. **Meta description** of 140 to 155 characters, written as the answer to the search.
3. **Question headings** (h2 ending in "?") where natural, with the direct answer in the first sentence under each. Three to eight of them become the FAQ markup.
4. **Dated figures**: "$29,937 on October 27, 2026", never "recently".
5. **A Sources section** at the end, with a link for every figure. Those links become the article's citations.
6. **The Updated date**, set whenever a figure changes. It shows on the page as "Updated <date>" and in the sitemap, feed and `.md` copy.
7. **Alt text and a caption** on every image and chart.
8. **Leave Share image empty** to use the auto card, or upload a 1200 x 630 image.
9. **Same day:** publish on the site the day the X post goes out, and link the site version from it.

## Checking it

```bash
S=https://www.sebmonty.link
for p in robots.txt sitemap.xml llms.txt blog/rss.xml og/site; do curl -s -o /dev/null -w "%{http_code} /$p\n" $S/$p; done
curl -sI https://sebmonty.link/ | grep -iE '^(HTTP|location)'        # expect 308 to www
curl -s -A GPTBot $S/blog/<slug> | sed 's#</head>.*##' | grep -oE '<title>[^<]*|rel="canonical" href="[^"]*"|og:image" content="[^"]*"'
```

Tools:

- Google's [Rich Results Test](https://search.google.com/test/rich-results) for an article's structured data.
- X's post composer, to preview a link's card.
