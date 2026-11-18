// Studio database schema (Postgres, via Drizzle).
// Tables prefixed `studio_` so the Studio can share a database with anything else.
// After changing this file run `pnpm studio:generate` to write a new migration in drizzle/.
import { sql } from 'drizzle-orm'
import { bigint, boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import type { PostDocument } from '../document'

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()

// ---------------------------------------------------------------------------
// Sign-in (Better Auth). Field names must match Better Auth's model fields.
// ---------------------------------------------------------------------------

export const user = pgTable('studio_user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  /** 'admin' can manage the team; 'editor' can write, publish and moderate. */
  role: text('role').notNull().default('editor'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const session = pgTable(
  'studio_session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('studio_session_user_idx').on(table.userId)],
)

export const account = pgTable(
  'studio_account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    scope: text('scope'),
    password: text('password'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index('studio_account_user_idx').on(table.userId)],
)

export const verification = pgTable('studio_verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

/** Login attempt counters, so rate limits hold across serverless instances. */
export const rateLimit = pgTable('studio_rate_limit', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  count: integer('count').notNull(),
  /** Milliseconds since 1970 (too big for a 32-bit integer). */
  lastRequest: bigint('last_request', { mode: 'number' }).notNull(),
})

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export const category = pgTable('studio_category', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const author = pgTable('studio_author', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  bio: text('bio').notNull().default(''),
  /** X handle without the @. */
  xHandle: text('x_handle').notNull().default(''),
  avatarUrl: text('avatar_url').notNull().default(''),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const media = pgTable(
  'studio_media',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    url: text('url').notNull().unique(),
    /** Path inside the Blob store (or the dev upload folder). */
    pathname: text('pathname').notNull(),
    filename: text('filename').notNull(),
    contentType: text('content_type').notNull(),
    size: integer('size').notNull(),
    width: integer('width'),
    height: integer('height'),
    alt: text('alt').notNull().default(''),
    caption: text('caption').notNull().default(''),
    credit: text('credit').notNull().default(''),
    creditUrl: text('credit_url').notNull().default(''),
    uploadedBy: text('uploaded_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index('studio_media_created_idx').on(table.createdAt)],
)

/**
 * One row per article. `draft` is what the Studio edits; `published` is the snapshot
 * the website shows. They differ while there are unpublished changes.
 */
export const post = pgTable(
  'studio_post',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Slug of the draft. The live slug is `published.slug`. */
    slug: text('slug').notNull(),
    /** draft: never published · scheduled: published snapshot goes live at publishedAt · published: live */
    status: text('status', { enum: ['draft', 'scheduled', 'published'] }).notNull().default('draft'),
    draft: jsonb('draft').$type<PostDocument>().notNull(),
    published: jsonb('published').$type<PostDocument>(),
    /** When the published snapshot is (or goes) live. Mirrors published.date. */
    publishedAt: timestamp('published_at', { withTimezone: true }),
    /** Bumped on every save; a save with an older version is rejected (two people editing). */
    version: integer('version').notNull().default(1),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    updatedBy: text('updated_by').references(() => user.id, { onDelete: 'set null' }),
    publishedBy: text('published_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    lastPublishedAt: timestamp('last_published_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('studio_post_slug_idx').on(table.slug),
    index('studio_post_status_idx').on(table.status, table.publishedAt),
    // Live slugs must be unique too (a draft slug change doesn't move the live page).
    uniqueIndex('studio_post_published_slug_idx')
      .on(sql`(${table.published} ->> 'slug')`)
      .where(sql`${table.published} IS NOT NULL`),
  ],
)

export const revision = pgTable(
  'studio_revision',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    /** autosave: periodic snapshot while editing · publish: what went live · restore: before a restore */
    kind: text('kind', { enum: ['autosave', 'publish', 'restore', 'import'] }).notNull(),
    document: jsonb('document').$type<PostDocument>().notNull(),
    createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
  },
  (table) => [index('studio_revision_post_idx').on(table.postId, table.createdAt)],
)

export const comment = pgTable(
  'studio_comment',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id')
      .notNull()
      .references(() => post.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email').notNull().default(''),
    body: text('body').notNull(),
    status: text('status', { enum: ['pending', 'approved', 'rejected', 'spam'] }).notNull().default('pending'),
    /** SHA-256 of the commenter's IP with a secret salt; used only for rate limiting. */
    ipHash: text('ip_hash').notNull().default(''),
    userAgent: text('user_agent').notNull().default(''),
    moderatedBy: text('moderated_by').references(() => user.id, { onDelete: 'set null' }),
    moderatedAt: timestamp('moderated_at', { withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [
    index('studio_comment_status_idx').on(table.status, table.createdAt),
    index('studio_comment_post_idx').on(table.postId, table.status),
  ],
)

export type UserRow = typeof user.$inferSelect
export type PostRow = typeof post.$inferSelect
export type MediaRow = typeof media.$inferSelect
export type CategoryRow = typeof category.$inferSelect
export type AuthorRow = typeof author.$inferSelect
export type CommentRow = typeof comment.$inferSelect
export type RevisionRow = typeof revision.$inferSelect
