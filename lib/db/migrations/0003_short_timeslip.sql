CREATE TYPE "public"."tourism_attraction_status" AS ENUM('published', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."tourism_attraction_type" AS ENUM('natural', 'cultural', 'gastronomic', 'adventure', 'religious', 'historical', 'recreational', 'other');--> statement-breakpoint
CREATE TYPE "public"."events_category" AS ENUM('cultural', 'sports', 'civic', 'educational', 'religious', 'fair', 'workshop', 'music', 'theatre', 'other');--> statement-breakpoint
CREATE TYPE "public"."events_status" AS ENUM('published', 'draft', 'cancelled', 'finished');--> statement-breakpoint
CREATE TABLE "tourism_attraction_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"attraction_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tourism_attractions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"attraction_type" "tourism_attraction_type" DEFAULT 'natural' NOT NULL,
	"district_id" integer NOT NULL,
	"address" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"image_url" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"phone" text,
	"website" text,
	"schedule" text,
	"entry_fee" text,
	"how_to_get_there" text,
	"tips" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"status" "tourism_attraction_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tourism_attractions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events_calendar" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"short_description" text,
	"category" "events_category" DEFAULT 'other' NOT NULL,
	"district_id" integer NOT NULL,
	"address" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"image_url" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"start_time" text,
	"end_time" text,
	"organizer_name" text,
	"organizer_contact" text,
	"entry_fee" text,
	"registration_required" boolean DEFAULT false NOT NULL,
	"max_attendees" integer,
	"current_attendees" integer DEFAULT 0 NOT NULL,
	"website" text,
	"status" "events_status" DEFAULT 'published' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_calendar_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "tourism_attractions_district_idx" ON "tourism_attractions" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "tourism_attractions_type_idx" ON "tourism_attractions" USING btree ("attraction_type");--> statement-breakpoint
CREATE INDEX "tourism_attractions_status_idx" ON "tourism_attractions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "event_registrations_event_idx" ON "event_registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_registrations_user_idx" ON "event_registrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "events_district_idx" ON "events_calendar" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "events_category_idx" ON "events_calendar" USING btree ("category");--> statement-breakpoint
CREATE INDEX "events_start_date_idx" ON "events_calendar" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events_calendar" USING btree ("status");