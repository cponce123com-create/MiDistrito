CREATE TYPE "public"."market_business_type" AS ENUM('clothing', 'restaurant', 'bakery', 'fair_booth', 'general_catalog', 'service', 'other');--> statement-breakpoint
CREATE TYPE "public"."market_document_type" AS ENUM('DNI', 'RUC10', 'RUC20');--> statement-breakpoint
CREATE TYPE "public"."market_order_status" AS ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."market_product_status" AS ENUM('active', 'inactive', 'out_of_stock');--> statement-breakpoint
CREATE TYPE "public"."market_store_status" AS ENUM('pending', 'active', 'suspended', 'inactive');--> statement-breakpoint
CREATE TABLE "news_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#6b7280',
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "market_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"type" text DEFAULT 'in' NOT NULL,
	"reference" text,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"description" text,
	"parent_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "market_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "market_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"district_id" integer NOT NULL,
	"status" "market_order_status" DEFAULT 'pending' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"notes" text,
	"contact_phone" text,
	"contact_name" text,
	"delivery_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_product_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL,
	"category_id" integer,
	"district_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"description" text,
	"long_description" text,
	"price" numeric(10, 2) NOT NULL,
	"sale_price" numeric(10, 2),
	"offer_price" numeric(10, 2),
	"cost_price" numeric(10, 2),
	"sku" text,
	"barcode" text,
	"image_url" text,
	"stock" integer DEFAULT 0 NOT NULL,
	"min_stock" integer DEFAULT 0 NOT NULL,
	"unit" text DEFAULT 'unidad' NOT NULL,
	"status" "market_product_status" DEFAULT 'active' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"tags" text[],
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"business_type" "market_business_type" DEFAULT 'general_catalog' NOT NULL,
	"document_type" "market_document_type" DEFAULT 'DNI' NOT NULL,
	"document_number" text NOT NULL,
	"owner_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"district_id" integer NOT NULL,
	"address" text,
	"location" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"logo_url" text,
	"banner_url" text,
	"primary_color" text DEFAULT '#2563eb',
	"whatsapp" text,
	"instagram" text,
	"facebook" text,
	"website" text,
	"store_type" text DEFAULT 'local',
	"status" "market_store_status" DEFAULT 'pending' NOT NULL,
	"is_featured" boolean DEFAULT false,
	"total_visits" integer DEFAULT 0,
	"payment_methods" text,
	"opening_hours" text,
	"does_delivery" boolean DEFAULT false,
	"delivery_radius" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "market_stores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "market_favorites_user_product_idx" ON "market_favorites" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "market_inventory_product_idx" ON "market_inventory" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "market_products_store_idx" ON "market_products" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "market_products_district_idx" ON "market_products" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "market_products_status_idx" ON "market_products" USING btree ("status");--> statement-breakpoint
CREATE INDEX "market_products_category_idx" ON "market_products" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "market_stores_slug_idx" ON "market_stores" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "market_stores_district_idx" ON "market_stores" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "market_stores_user_idx" ON "market_stores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "market_stores_status_idx" ON "market_stores" USING btree ("status");