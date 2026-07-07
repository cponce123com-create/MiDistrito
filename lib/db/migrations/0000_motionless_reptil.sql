CREATE TYPE "public"."core_consent_type" AS ENUM('privacy_policy', 'terms_of_use');--> statement-breakpoint
CREATE TYPE "public"."core_notification_type" AS ENUM('system', 'panic_alert', 'missing_person', 'report_update', 'report_nearby');--> statement-breakpoint
CREATE TYPE "public"."core_user_role" AS ENUM('super_admin', 'admin', 'moderator', 'municipal', 'viewer', 'user');--> statement-breakpoint
CREATE TYPE "public"."radar_message_channel" AS ENUM('whatsapp', 'app', 'email');--> statement-breakpoint
CREATE TYPE "public"."radar_message_sender" AS ENUM('admin', 'vecino');--> statement-breakpoint
CREATE TYPE "public"."radar_missing_person_status" AS ENUM('active', 'found', 'archived');--> statement-breakpoint
CREATE TYPE "public"."radar_panic_alert_type" AS ENUM('robbery', 'medical', 'fight', 'fire', 'missing_person', 'other');--> statement-breakpoint
CREATE TYPE "public"."radar_report_category" AS ENUM('robbery', 'fight', 'suspicious', 'water_cut', 'garbage', 'informal_commerce', 'noise', 'missing_person', 'fire', 'medical_emergency', 'prostitution', 'drug_point', 'bar_trouble', 'other', 'lost_pet', 'power_outage', 'street_damage', 'stray_dogs', 'flooding');--> statement-breakpoint
CREATE TYPE "public"."radar_report_status" AS ENUM('active', 'reviewing', 'resolved', 'archived');--> statement-breakpoint
CREATE TYPE "public"."radar_urgency_level" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TABLE "core_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" integer NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_districts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"province" text NOT NULL,
	"department" text NOT NULL,
	"center_lat" real,
	"center_lng" real,
	"default_zoom" integer DEFAULT 15,
	"boundary" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "core_districts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "core_licenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"siglas" text NOT NULL,
	"district_name" text NOT NULL,
	"province" text NOT NULL,
	"department" text NOT NULL,
	"district_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"activated_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT false NOT NULL,
	"max_viewers" integer DEFAULT 10 NOT NULL,
	CONSTRAINT "core_licenses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "core_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"district_id" integer NOT NULL,
	"user_id" integer,
	"type" "core_notification_type" DEFAULT 'system' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"reference_id" text,
	"reference_type" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_user_consents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "core_consent_type" NOT NULL,
	"version" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "core_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"dni" text,
	"phone" text,
	"first_name" text DEFAULT '' NOT NULL,
	"last_name" text DEFAULT '' NOT NULL,
	"banned_at" timestamp,
	"ban_reason" text,
	"helpful_reports" integer DEFAULT 0 NOT NULL,
	"role" "core_user_role" DEFAULT 'user' NOT NULL,
	"district_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"reports_count" integer DEFAULT 0 NOT NULL,
	"trust_score" integer DEFAULT 50 NOT NULL,
	"suspended_until" timestamp,
	"vecino_id" integer,
	"display_name" text,
	"alias" text,
	"login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp,
	"is_blocked" boolean DEFAULT false,
	"avatar_url" text,
	"sector" text DEFAULT '',
	"store_id" text,
	"identity_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "core_users_email_unique" UNIQUE("email"),
	CONSTRAINT "core_users_dni_unique" UNIQUE("dni"),
	CONSTRAINT "core_users_vecino_id_unique" UNIQUE("vecino_id")
);
--> statement-breakpoint
CREATE TABLE "radar_ad_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"district_id" integer NOT NULL,
	"business_name" text NOT NULL,
	"tagline" text NOT NULL,
	"image_url" text,
	"target_url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sector" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radar_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"icon" text DEFAULT 'AlertTriangle' NOT NULL,
	"color" text DEFAULT '#6b7280' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "radar_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "radar_departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"district_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"color" text DEFAULT '#3b82f6' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radar_missing_persons" (
	"id" serial PRIMARY KEY NOT NULL,
	"district_id" integer NOT NULL,
	"name" text NOT NULL,
	"age" integer,
	"clothing" text NOT NULL,
	"photo_url" text,
	"last_seen_latitude" real NOT NULL,
	"last_seen_longitude" real NOT NULL,
	"last_seen_address" text NOT NULL,
	"last_seen_at" timestamp NOT NULL,
	"contact_info" text NOT NULL,
	"status" "radar_missing_person_status" DEFAULT 'active' NOT NULL,
	"reported_by" text NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radar_panic_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"district_id" integer NOT NULL,
	"type" "radar_panic_alert_type" NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"author_name" text NOT NULL,
	"sector" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radar_report_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"sender" "radar_message_sender" NOT NULL,
	"channel" "radar_message_channel" NOT NULL,
	"content" text NOT NULL,
	"admin_name" text,
	"contact_phone" text,
	"contact_email" text,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radar_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "radar_report_category" NOT NULL,
	"urgency" "radar_urgency_level" NOT NULL,
	"status" "radar_report_status" DEFAULT 'active' NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"sector" text NOT NULL,
	"district_id" integer NOT NULL,
	"image_url" text,
	"author_name" text NOT NULL,
	"contact_phone" text,
	"contact_email" text,
	"author_user_id" integer,
	"confirmed_count" integer DEFAULT 0 NOT NULL,
	"resolution_confirmed_count" integer DEFAULT 0 NOT NULL,
	"assigned_to" integer,
	"deleted_at" timestamp,
	"deleted_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "radar_static_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"district_id" integer NOT NULL,
	"latitude" real NOT NULL,
	"longitude" real NOT NULL,
	"category" "radar_report_category" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"address" text DEFAULT '',
	"sector" text NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"first_reported_at" timestamp DEFAULT now() NOT NULL,
	"last_reported_at" timestamp DEFAULT now() NOT NULL,
	"resolution_reports" integer DEFAULT 0 NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "radar_ad_slots" ADD CONSTRAINT "radar_ad_slots_district_id_core_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."core_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radar_departments" ADD CONSTRAINT "radar_departments_district_id_core_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."core_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radar_missing_persons" ADD CONSTRAINT "radar_missing_persons_district_id_core_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."core_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radar_panic_alerts" ADD CONSTRAINT "radar_panic_alerts_district_id_core_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."core_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radar_report_messages" ADD CONSTRAINT "radar_report_messages_report_id_radar_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."radar_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radar_reports" ADD CONSTRAINT "radar_reports_district_id_core_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."core_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radar_reports" ADD CONSTRAINT "radar_reports_author_user_id_core_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."core_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radar_reports" ADD CONSTRAINT "radar_reports_assigned_to_radar_departments_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."radar_departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "radar_static_points" ADD CONSTRAINT "radar_static_points_district_id_core_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."core_districts"("id") ON DELETE no action ON UPDATE no action;