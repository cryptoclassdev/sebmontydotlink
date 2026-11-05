# Publishing an article

Articles are Markdown files in this repo. The site turns each file into a blog page, a blog card, a search result, and a plain-text copy that AI agents can read. Publishing means opening a pull request with the file and its images; the article goes live when a reviewer merges it.

## 1. Where things go

```
content/articles/<slug>.md          the article
public/articles/<slug>/              its images
content/categories.yml               the list of categories
content/authors.yml                  the list of authors
```

- `<slug>` is the web address: `content/articles/papertrade-saga.md` becomes `sebmonty.link/blog/papertrade-saga`.
- Use lowercase words joined by hyphens. Never rename a published article's file: that breaks its link.

## 2. The top of the file (frontmatter)

Every article starts with a block between two `---` lines:

```yaml
---
title: "Papertrade Saga: The Hype, Lock & Exodus"
deck: "One or two sentences under the title, also used on cards and link previews."
date: 2026-11-05
category: defi
author: seb-montgomery
cover:
  src: banner.jpg
  alt: "What the image shows, for screen readers and search engines."
  position: left
status: draft
disclosure: "I've traded on Papertrade. I also co-founded validator.com, which runs a Solana validator. This is information, not investment advice."
---
```

| Field | Required | What it does |
| --- | --- | --- |
| `title` | yes | The headline. |
| `deck` | no | The standfirst under the headline. Also the card text unless `excerpt` is set. |
| `excerpt` | no | A shorter summary for cards, search and link previews. |
| `date` | yes | Publication date, `2026-11-05` or `2026-11-05T09:00:00Z`. Articles are listed newest first. |
| `updated` | no | Date of a later correction or refresh. |
| `category` | yes | A slug from `content/categories.yml` (`stocks`, `solana`, `defi`). Add new categories there first. |
| `author` | no | A slug from `content/authors.yml`. Defaults to `seb-montgomery`. |
| `cover.src` | yes | The cover image, normally a file in `public/articles/<slug>/`. |
| `cover.alt` | yes | Describes the cover image. |
| `cover.caption` | no | Caption under the cover on the article page. |
| `cover.position` | no | Which part of the cover stays visible when cards crop it: `left`, `right`, `center`, `top`, `bottom`, two of those (`right top`) or percentages (`30% 50%`). |
| `status` | no | `published` (default) or `draft`. Drafts show on local and preview builds with a "Draft" label and never on the live site. |
| `readTime` | no | Minutes. Calculated from the word count if left out. |
| `disclosure` | no | The closing note in italics after the article, above Sources. Put holdings, affiliations and the validator.com mention here. |

Wrap a value in double quotes if it contains a colon, `#`, or starts with a quote mark.

## 3. Writing the article

Standard Markdown, with these rules:

- **Headings:** `##` for sections, `###` and `####` below that. Don't use `#`; the title comes from the frontmatter.
- **Bold, italic, links:** `**bold**`, `_italic_`, `[link text](https://example.com)`. Links must start with `https://`, `http://`, `mailto:`, `/` or `#`.
- **Lists:** `- item` or `1. item`, one paragraph per item; indent to nest.
- **Quotes:** start the line with `>`.
- **Code:** wrap it in three backticks; readers get a copy button.
- **Images:** on their own line, with alt text and an optional caption in quotes:

  ```markdown
  ![Column chart of daily USDC paid to PAPER stakers](staker-payouts.png "Daily USDC paid to PAPER stakers. Source: Papertrade stats API.")
  ```

  A bare file name points to `public/articles/<slug>/`. A path starting with `/` points anywhere in `public/`. Images open full screen when clicked. Images must be files in the repo, not links to other sites.
- **YouTube:** paste the video link alone on its own line; it becomes an embedded player.
- **Sources:** end the article with a `## Sources` heading and a list of links. Everything after that heading goes into the collapsed Sources box.
- **Referral links:** write them out as normal links in the text, and say that you may earn a fee, as the Meteora guide does.

Not supported yet, and the check will tell you if you use them: tables, footnotes, raw HTML, strikethrough, horizontal rules, images inside a sentence, and embeds other than YouTube. Use an image for a table.

## 4. Check your article

```bash
pnpm articles:check
```

It lists every article that passes, or every problem with the file and line number, for example:

```
content/articles/my-article.md:15  image not found: public/articles/my-article/chart.png
content/articles/my-article.md  category "news" is not listed in content/categories.yml
```

The same check runs on every build, so a broken article can never reach the live site: the Vercel preview on the pull request fails and shows the same list.

`pnpm dev` runs the site locally at http://localhost:3000 and reloads the article as you edit it.

## 5. Publish

1. Create a branch, for example `article/papertrade-saga`.
2. Add `content/articles/<slug>.md` and the images in `public/articles/<slug>/`.
3. Run `pnpm articles:check`.
4. Open a pull request. Add an entry to the change log in `README.md` describing the article.
5. Vercel posts a preview link on the pull request. Drafts are visible there with a "Draft" label.
6. When the article is ready, set `status: published` (or remove the line) and set `date` to the publication day, then ask a reviewer to merge. The site updates about two minutes after the merge.

To fix a live article, edit its file and open a pull request the same way. Add `updated:` for anything beyond a typo.

## 6. What AI agents get

- `https://www.sebmonty.link/blog/<slug>.md`: the article as clean Markdown with full image URLs, captions, sources and the disclosure.
- `https://www.sebmonty.link/llms.txt`: an index of every article, linking to those Markdown copies.
- Every article page also points to its Markdown copy in a `<link rel="alternate" type="text/markdown">` tag.

## 7. From a Google Doc

1. In Google Docs choose File, Download, Microsoft Word (.docx).
2. Convert it: `pandoc article.docx -t gfm --wrap=none --extract-media=media -o article.md`
3. Move the images from `media/` to `public/articles/<slug>/` with descriptive names, and rewrite each image as `![alt](file.png "caption")`, using the italic caption line under it in the doc.
4. Move the title, the italic standfirst and the closing disclosure into the frontmatter, then run `pnpm articles:check`.

A coding agent can do all four steps: give it the .docx and point it at this file.
