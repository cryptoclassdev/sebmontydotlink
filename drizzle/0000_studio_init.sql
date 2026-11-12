CREATE TABLE "studio_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_author" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"x_handle" text DEFAULT '' NOT NULL,
	"avatar_url" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_author_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "studio_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "studio_comment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"ip_hash" text DEFAULT '' NOT NULL,
	"user_agent" text DEFAULT '' NOT NULL,
	"moderated_by" text,
	"moderated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt" text DEFAULT '' NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"credit" text DEFAULT '' NOT NULL,
	"credit_url" text DEFAULT '' NOT NULL,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_media_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "studio_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"draft" jsonb NOT NULL,
	"published" jsonb,
	"published_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"created_by" text,
	"updated_by" text,
	"published_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "studio_rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "studio_rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "studio_revision" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"document" jsonb NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "studio_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "studio_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "studio_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'editor' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "studio_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "studio_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio_account" ADD CONSTRAINT "studio_account_user_id_studio_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."studio_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_comment" ADD CONSTRAINT "studio_comment_post_id_studio_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."studio_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_comment" ADD CONSTRAINT "studio_comment_moderated_by_studio_user_id_fk" FOREIGN KEY ("moderated_by") REFERENCES "public"."studio_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_media" ADD CONSTRAINT "studio_media_uploaded_by_studio_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."studio_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_post" ADD CONSTRAINT "studio_post_created_by_studio_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."studio_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_post" ADD CONSTRAINT "studio_post_updated_by_studio_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."studio_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_post" ADD CONSTRAINT "studio_post_published_by_studio_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."studio_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_revision" ADD CONSTRAINT "studio_revision_post_id_studio_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."studio_post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_revision" ADD CONSTRAINT "studio_revision_created_by_studio_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."studio_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "studio_session" ADD CONSTRAINT "studio_session_user_id_studio_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."studio_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "studio_account_user_idx" ON "studio_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "studio_comment_status_idx" ON "studio_comment" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "studio_comment_post_idx" ON "studio_comment" USING btree ("post_id","status");--> statement-breakpoint
CREATE INDEX "studio_media_created_idx" ON "studio_media" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "studio_post_slug_idx" ON "studio_post" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "studio_post_status_idx" ON "studio_post" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "studio_post_published_slug_idx" ON "studio_post" USING btree (("published" ->> 'slug')) WHERE "studio_post"."published" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "studio_revision_post_idx" ON "studio_revision" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "studio_session_user_idx" ON "studio_session" USING btree ("user_id");