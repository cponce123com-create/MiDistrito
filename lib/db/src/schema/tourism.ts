import { pgTable, serial, text, integer, boolean, timestamp, numeric, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ── Enums ──────────────────────────────────────────────────────────────────

export const attractionTypeEnum = pgEnum("tourism_attraction_type", [
  "natural", "cultural", "gastronomic", "adventure", "religious", "historical", "recreational", "other",
]);

export const attractionStatusEnum = pgEnum("tourism_attraction_status", [
  "published", "draft", "archived",
]);

// ── Tablas ─────────────────────────────────────────────────────────────────

export const attractionsTable = pgTable("tourism_attractions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  attractionType: attractionTypeEnum("attraction_type").notNull().default("natural"),
  districtId: integer("district_id").notNull(),
  address: text("address"),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  imageUrl: text("image_url"),
  images: jsonb("images").default([]),
  phone: text("phone"),
  website: text("website"),
  schedule: text("schedule"),
  entryFee: text("entry_fee"),
  howToGetThere: text("how_to_get_there"),
  tips: text("tips"),
  isActive: boolean("is_active").notNull().default(true),
  status: attractionStatusEnum("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("tourism_attractions_district_idx").on(t.districtId),
  index("tourism_attractions_type_idx").on(t.attractionType),
  index("tourism_attractions_status_idx").on(t.status),
]);

export const attractionReviewsTable = pgTable("tourism_attraction_reviews", {
  id: serial("id").primaryKey(),
  attractionId: integer("attraction_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Insert Schemas ─────────────────────────────────────────────────────────

export const insertAttractionSchema = createInsertSchema(attractionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAttractionReviewSchema = createInsertSchema(attractionReviewsTable).omit({ id: true, createdAt: true });
