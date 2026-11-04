# sebmonty.link

Seb Montgomery's personal site: a homepage hub (research, socials, referral links, projects), a blog at `/blog`, and the Skill Files library at `/skill-files`.

- Live site: https://www.sebmonty.link
- Hosting: Vercel. Every merge to `main` deploys to the live site. Every pull request gets its own Vercel preview link.

## How changes ship

Nothing reaches the live site without review.

1. Work happens on a new branch off `main`. Nobody pushes to `main` directly.
2. Every change is opened as a pull request against `main`. Vercel posts a preview link on the PR.
3. Every PR adds an entry to the **Change log** below: what changed and why, files touched, how to check it on the preview, risks, and how to roll it back. The PR description carries the same details.
4. A reviewer checks the preview and the change-log entry, then merges. Merging publishes to sebmonty.link.

## Run it locally

Requires Node 20.9 or newer and pnpm 8.

```bash
pnpm install
pnpm dev          # local dev server at http://localhost:3000
pnpm typecheck    # TypeScript check; run before every PR
pnpm build        # production build; run before every PR
```

Environment variables are listed in `.env.example`. The site builds without any of them; the MailerLite keys are only needed for the subscribe endpoint.

## Where things live

| What | File |
| --- | --- |
| Homepage content (hero, socials, referral links, projects, footer) | `components/bento-grid.tsx` |
| Homepage styles | `components/link-tree.module.css` |
| Skill Files page and its styles | `app/skill-files/page.tsx`, `components/link-hub.module.css` |
| Blog pages | `app/blog/` |
| Blog header, footer and article components | `components/site-header.tsx`, `components/site-footer.tsx`, `components/blog/` |
| Blog and article styles | `app/globals.css` |
| Blog content | Sanity (project `bfn64pgm`, Studio at `/studio`) for the RoboStrategy post; `data/meteora-lp-course-post.json` for the Meteora guide |

## Change log

Newest first. One entry per pull request.

### Homepage cleanup: remove Fogees Hub, show full project images

- **Date:** 4 November 2026
- **Branch:** `ui/homepage-cleanup`
- **Status:** In review

**What changed**
1. Removed the Fogees Hub (Co-founder) project from the homepage Projects section, and deleted its three unused images (`fogees-mockup.png`, `fogees-icon.png`, `fogees-logo.png`).
2. Redesigned the project cards so each mockup shows in full. Before, the wide 16:9 mockups were squeezed into small portrait thumbnails and cropped: the validator.com card showed only "ator.com", and the thecommunication.link card cut off the "Seb Monty" header. Now each card shows the full image on top at its natural 16:9 shape, with the role, name, description and arrow underneath.
3. With two projects left, the grid is two columns on desktop and tablet and one column on phones (680px wide and below). The arrow now shows on phones too.
4. Replaced this README's v0 boilerplate with a project overview, the review process above, and this change log.

**Why**
Seb asked for Fogees Hub to be removed, and the cropped project images hid the brand names and his own name.

**Files touched**
- `components/bento-grid.tsx`: removed the Fogees Hub entry; updated the image `sizes` hint for the larger images.
- `components/link-tree.module.css`: new project card layout and its phone and tablet rules.
- `public/fogees-mockup.png`, `public/fogees-icon.png`, `public/fogees-logo.png`: deleted.
- `README.md`: rewritten.

**How to check it on the preview**
1. Open the Vercel preview link on this PR and scroll to "What I am building".
2. Fogees Hub is gone. Two cards remain: validator.com and thecommunication.link.
3. The validator.com card shows the full logo, the "validator.com" wordmark and the phone mockup. The thecommunication.link card shows the full "Seb Monty" post and Seb's face.
4. Resize the window, or open the preview on a phone: two cards side by side on wide screens, stacked on phones, no sideways scrolling.
5. Both cards still open their sites in a new tab.

**Checks run**
`pnpm typecheck` and `pnpm build` pass. Screenshots at 375px, 768px and 1440px across the homepage, blog, both articles, search and Skill Files show no horizontal overflow.

**Risks**
Low. Only the Projects section of the homepage changes. No content, links, blog pages or packages change.

**Roll back**
Revert this PR's merge commit on GitHub (the "Revert" button on the merged PR), then merge the revert PR.
