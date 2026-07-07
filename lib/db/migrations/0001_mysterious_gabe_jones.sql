CREATE TYPE "public"."news_article_status" AS ENUM('pending_approval', 'approved', 'published', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."news_channel_type" AS ENUM('channel', 'group', 'supergroup');--> statement-breakpoint
CREATE TYPE "public"."news_source_type" AS ENUM('rss', 'telegram_channel', 'web');--> statement-breakpoint
CREATE TABLE "news_approval_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"status" "news_article_status" DEFAULT 'pending_approval' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"category_id" integer,
	"district_id" integer NOT NULL,
	"external_id" text,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"original_title" text,
	"summary" text,
	"original_summary" text,
	"body" text,
	"original_body" text,
	"author" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"videos" jsonb DEFAULT '[]'::jsonb,
	"language" text DEFAULT 'es' NOT NULL,
	"hashtags" jsonb DEFAULT '[]'::jsonb,
	"status" "news_article_status" DEFAULT 'pending_approval' NOT NULL,
	"published_at" timestamp,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"reject_reason" text,
	"fetched_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_publication_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"channel_id" integer,
	"channel_type" text DEFAULT 'telegram' NOT NULL,
	"message_id" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"error" text,
	"published_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_scraper_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"status" text DEFAULT 'success' NOT NULL,
	"items_found" integer DEFAULT 0 NOT NULL,
	"items_new" integer DEFAULT 0 NOT NULL,
	"error" text,
	"duration_ms" integer,
	"ran_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"source_type" "news_source_type" DEFAULT 'rss' NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"district_id" integer NOT NULL,
	"feed_url" text,
	"keyword" text,
	"telegram_username" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_paused" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"fetch_interval" integer DEFAULT 30 NOT NULL,
	"last_fetched_at" timestamp,
	"cooldown_until" timestamp,
	"error_count" integer DEFAULT 0 NOT NULL,
	"max_errors" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_system_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_system_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "news_telegram_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"chat_id" text NOT NULL,
	"channel_type" "news_channel_type" DEFAULT 'channel' NOT NULL,
	"username" text,
	"invite_link" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_telegram_channels_chat_id_unique" UNIQUE("chat_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "news_articles_source_url_idx" ON "news_articles" USING btree ("source_id","url");--> statement-breakpoint
CREATE UNIQUE INDEX "news_articles_ext_id_idx" ON "news_articles" USING btree ("external_id");