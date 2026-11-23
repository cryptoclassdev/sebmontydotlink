# Studio

The Studio is this site's own article dashboard at **/studio** (www.sebmonty.link/studio). It replaces publishing by pull request: articles are written, edited, scheduled and published from the browser, and comments are moderated there. It is password-gated, and only people an admin adds can sign in.

Everything lives in this repo and in this project's own database and file store. Nothing is shared with validator.com, which gets its own copy of the code with its own logins and data.

> **Status:** the blog, the homepage's "Latest research" card, search, `/llms.txt` and the `/blog/<slug>.md` copies all read from the Studio. If the Studio's database isn't connected (for example on a computer without `DATABASE_URL`), the site falls back to the old Markdown files in `content/articles/` so it never shows an empty blog.

## How it fits together

| Part | What it is | Where |
| --- | --- | --- |
| Dashboard | Next.js pages behind a login | `app/studio/`, `components/studio/` |
| Database | Postgres (Neon). Posts, revisions, media records, categories, authors, comments, logins | `lib/studio/db/schema.ts`, migrations in `drizzle/` |
| Files | Images in a Vercel Blob store, uploaded straight from the browser | `app/api/studio/upload/route.ts`, `lib/studio/media.ts` |
| Sign-in | Email and password per person (Better Auth). No public sign-up | `lib/studio/auth.ts`, `app/api/studio/auth/` |
| Article body | Portable Text, edited with Sanity's open-source Portable Text Editor, in the same block format `components/blog/ArticleBody.tsx` renders | `components/studio/BodyEditor.tsx`, `lib/studio/document.ts` |
| Reader comments | Public endpoint; every comment waits for approval | `app/api/studio/comments/route.ts`, `lib/studio/comments.ts` |

Each post keeps two copies: the **draft** (what the Studio edits, saved automatically) and the **published** snapshot (what the site will show). They only differ while there are unpublished changes, so editing a live article never changes the site until someone presses **Publish changes**.

**How the site reads it.** Public pages refresh every minute but read the database only through a saved copy (`lib/studio/public.ts`, cache tag `studio-public`). `revalidatePublicPages()` in `lib/studio/revalidate.ts` replaces it whenever something public changes (publish, unpublish, comment moderation or deletion, category or author edits), and it also refreshes once a day. Scheduled posts sit in the copy with their go-live time and are filtered on every render, so they appear on time without a database read. The database therefore sleeps between edits, which keeps it well inside Neon's free compute hours. Any new code that changes what the public site shows must call `revalidatePublicPages()`.

## One-time setup on Vercel

Do these on the Vercel project for sebmonty.link (team `webdesign-sebmonty`). A team owner needs to do steps 1 and 2.

1. **Database.** Storage → Create Database → Neon. Region: the one matching Settings → Functions → Function Region (Washington, D.C. by default). Turn **Auth off** (the Studio has its own logins) and leave Realtime off; the Free plan is enough. On **Connect to Project**: environments **Production and Preview**, tick **Preview** under "Create database branch for deployment" (so previews never touch live data), and leave **Custom Prefix** empty. This adds `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
   On the Free plan (10 database branches), also turn on GitHub → Settings → General → **Automatically delete head branches**, and set Vercel → Settings → Build and Deployment → **Deployment Retention Policy** → Pre-Production to 7 days. A preview's database branch is deleted with its last preview deployment, so this clears them after their PRs merge.
2. **File store.** Storage → Create → Blob → connect it to Production and Preview. This adds `BLOB_READ_WRITE_TOKEN`.
3. **Secrets.** Settings → Environment Variables, for Production and Preview:
   - `BETTER_AUTH_SECRET`: a long random value (`openssl rand -hex 32`). Changing it later signs everyone out.
   - `STUDIO_SETUP_TOKEN`: a one-time code for creating the first admin. Remove it after step 5.
   - `BETTER_AUTH_URL` (Production only): `https://www.sebmonty.link`.
4. **Redeploy.** Every build runs `pnpm studio:migrate` first, which creates the tables, copies the categories and authors from `content/*.yml`, and (the first time only) copies the three Markdown articles and their images into the Studio. Without `DATABASE_URL` it skips all of this, so the site still builds before the database exists.
5. **First admin.** Open `/studio`. With no accounts yet it shows "Create the admin account". Enter the setup code, your name, email and a password (10+ characters). Then sign in.
6. **Team.** Studio → Team → Add person, for each of Chris and Bruno. The Studio suggests a temporary password; copy it and send it privately. They change it under the account menu → Account and password.
7. **Articles.** Nothing to do: the first build with the database copies the Markdown articles into the Studio as published posts (images go to the Blob store) and notes that it has done so, so it never happens again, and an article you later delete stays deleted. The same copy can be run by hand with `pnpm studio:import-articles` (it skips articles already in the Studio).

## Using it

- **New post:** Posts → **+ New post**. Everything saves automatically about a second after you stop typing ("Saved just now" at the bottom).
- **Fields:** the **Content** tab has title, slug (press **From title**), deck, excerpt, cover image, body and disclosure. **Details** has the publish date, updated date, category, author, read time and the feature flag. **SEO** has the search title, meta description, share image, canonical URL and "hide from search engines"; empty SEO fields fall back to the title, excerpt or deck, and cover.
- **Body:** paragraphs, Heading 2 to 4, quotes, bold, italic, inline code, links, bulleted and numbered lists, images (with alt text, caption and credit), YouTube videos and code blocks. Paste from Google Docs keeps headings, lists, links and bold/italic. Shortcuts: Ctrl/⌘ B, Ctrl/⌘ I, Ctrl/⌘ ' (code), Ctrl/⌘ Z. End the article with a **Sources** heading; everything after it goes into the collapsed Sources box and isn't counted in the read time.
- **Publish:** the green button. It checks the post first and lists anything missing (title, slug, date, category, author, cover image and its alt text, image alt text, link formats); click an item to jump to it.
- **Preview:** the **Preview** button (top right of a post) saves, then opens the draft on the real article page in a new tab with an orange "Preview" bar. Only signed-in Studio users see drafts; readers keep seeing the published version. **Exit preview** in the bar turns it off.
- **Schedule:** set a publish date in the future; the button changes to **Schedule**. The article appears on the site by itself within about a minute of that time.
- **On the site:** publishing updates the article page, the blog, the homepage card, search, `/llms.txt` and the article's `.md` copy within seconds. **Feature this article** (Details tab) puts it in the homepage's "Latest research" card; otherwise the card shows the newest article.
- **Edit a live article:** just edit. The badge shows **Edited** and the button **Publish changes**. ⋯ → **Discard unpublished changes** goes back to the live version.
- **Unpublish / delete:** ⋯ → **Unpublish** takes it off the site and keeps it as a draft. Only drafts can be deleted.
- **Revision history:** ⋯ → **Revision history**. A snapshot is kept at every publish and every 10 minutes of editing. **Restore** replaces the draft; the live article doesn't change until you publish.
- **Two people, one post:** if someone else saved the same post after you opened it, your save is refused with "Reload to get their changes", so nobody silently overwrites anyone.
- **Media:** every uploaded image, with alt text, caption and credit you can fill in once and reuse. An image used in a post can't be deleted.
- **Comments:** readers comment at the bottom of every article (name, optional email that is never shown, comment). Each one waits in Studio → **Comments** (red count in the top bar). Approve, Reject (or Hide once approved), Spam or Delete. Only approved comments show under the article, within seconds of approval.
- **Categories / Authors:** the lists behind the Category and Author fields. A category or author used by a post can't be deleted.
- **Team:** admins add and remove people, change roles and set new passwords (which signs that person out everywhere). Editors can do everything else.

## Security notes

- No sign-up: accounts exist only if an admin (or first-run setup) creates them.
- Passwords are hashed (scrypt). Sign-in is limited to 8 attempts per 5 minutes per IP, counted in the database so the limit holds across Vercel instances.
- Sessions last 7 days ("Keep me signed in" unticked ends them when the browser closes). Changing a password signs out other devices.
- Every Studio page and server action checks the session; `proxy.ts` also turns away requests with no session cookie before a page renders.
- Uploads: images only (JPG, PNG, WebP, GIF, AVIF), up to 25 MB, through short-lived upload tokens issued only to signed-in users.
- Comments: honeypot field, length limits, 3 per IP per 10 minutes, IPs stored only as a salted hash.

## Account recovery

From a computer with the repo and `vercel env pull .env.local`:

```bash
pnpm studio:user list
pnpm studio:user reset-password someone@example.com   # asks for the new password
pnpm studio:user make-admin someone@example.com
```

## Local development

```bash
cp .env.example .env.local    # set DATABASE_URL (any Postgres 14+) and BETTER_AUTH_SECRET
pnpm studio:migrate
pnpm dev                      # http://localhost:3000/studio
```

Without `BLOB_READ_WRITE_TOKEN`, local uploads are saved in `public/studio-uploads/` (gitignored) instead of Vercel Blob. After changing `lib/studio/db/schema.ts`, run `pnpm studio:generate` to write a migration into `drizzle/` and commit it.

## Copying the Studio to validator.com

The Studio is self-contained: `app/studio/`, `app/api/studio/`, `components/studio/`, `lib/studio/`, `scripts/studio/`, `drizzle/`, `drizzle.config.ts`, `proxy.ts` and the `studio:*` scripts in `package.json`. To start validator.com's copy: copy those, change the site name and URLs (`sebmonty.link` in `components/studio/TopBar.tsx`, the login and setup pages, `lib/studio/auth.ts`), connect validator.com's own Neon database and Blob store, and set its own secrets. Its logins and data stay completely separate.
