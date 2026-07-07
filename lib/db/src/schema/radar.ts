import { pgTable, text, serial, boolean, real, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { districtsTable, usersTable } from "./core";

// ── Enums ──────────────────────────────────────────────────────────────────

export const reportCategoryEnum = pgEnum("radar_report_category", [
  "robbery",
  "fight",
  "suspicious",
  "water_cut",
  "garbage",
  "informal_commerce",
  "noise",
  "missing_person",
  "fire",
  "medical_emergency",
  "prostitution",
  "drug_point",
  "bar_trouble",
  "other",
  "lost_pet",
  "power_outage",
  "street_damage",
  "stray_dogs",
  "flooding",
]);

export const urgencyEnum = pgEnum("radar_urgency_level", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const reportStatusEnum = pgEnum("radar_report_status", [
  "active",
  "reviewing",
  "resolved",
  "archived",
]);

export const panicAlertTypeEnum = pgEnum("radar_panic_alert_type", [
  "robbery",
  "medical",
  "fight",
  "fire",
  "missing_person",
  "other",
]);

export const missingPersonStatusEnum = pgEnum("radar_missing_person_status", [
  "active",
  "found",
  "archived",
]);

export const messageSenderEnum = pgEnum("radar_message_sender", [
  "admin",
  "vecino",
]);

export const messageChannelEnum = pgEnum("radar_message_channel", [
  "whatsapp",
  "app",
  "email",
]);

// ── Tablas del Módulo Radar ────────────────────────────────────────────────

export const reportCategoriesTable = pgTable("radar_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  icon: text("icon").notNull().default("AlertTriangle"),
  color: text("color").notNull().default("#6b7280"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const departmentsTable = pgTable("radar_departments", {
  id: serial("id").primaryKey(),
  districtId: integer("district_id").notNull().references(() => districtsTable.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  color: text("color").notNull().default("#3b82f6"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reportsTable = pgTable("radar_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: reportCategoryEnum("category").notNull(),
  urgency: urgencyEnum("urgency").notNull(),
  status: reportStatusEnum("status").notNull().default("active"),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address").notNull().default(""),
  sector: text("sector").notNull(),
  districtId: integer("district_id").notNull().references(() => districtsTable.id),
  imageUrl: text("image_url"),
  authorName: text("author_name").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  authorUserId: integer("author_user_id").references(() => usersTable.id),
  confirmedCount: integer("confirmed_count").notNull().default(0),
  resolutionConfirmedCount: integer("resolution_confirmed_count").notNull().default(0),
  assignedTo: integer("assigned_to").references(() => departmentsTable.id),
  deletedAt: timestamp("deleted_at", { mode: "string" }),
  deletedBy: text("deleted_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const panicAlertsTable = pgTable("radar_panic_alerts", {
  id: serial("id").primaryKey(),
  districtId: integer("district_id").notNull().references(() => districtsTable.id),
  type: panicAlertTypeEnum("type").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address").notNull().default(""),
  authorName: text("author_name").notNull(),
  sector: text("sector").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const missingPersonsTable = pgTable("radar_missing_persons", {
  id: serial("id").primaryKey(),
  districtId: integer("district_id").notNull().references(() => districtsTable.id),
  name: text("name").notNull(),
  age: integer("age"),
  clothing: text("clothing").notNull(),
  photoUrl: text("photo_url"),
  lastSeenLatitude: real("last_seen_latitude").notNull(),
  lastSeenLongitude: real("last_seen_longitude").notNull(),
  lastSeenAddress: text("last_seen_address").notNull(),
  lastSeenAt: timestamp("last_seen_at").notNull(),
  contactInfo: text("contact_info").notNull(),
  status: missingPersonStatusEnum("status").notNull().default("active"),
  reportedBy: text("reported_by").notNull(),
  deletedAt: timestamp("deleted_at", { mode: "string" }),
  deletedBy: text("deleted_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adSlotsTable = pgTable("radar_ad_slots", {
  id: serial("id").primaryKey(),
  districtId: integer("district_id").notNull().references(() => districtsTable.id),
  businessName: text("business_name").notNull(),
  tagline: text("tagline").notNull(),
  imageUrl: text("image_url"),
  targetUrl: text("target_url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sector: text("sector"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const staticPointsTable = pgTable("radar_static_points", {
  id: serial("id").primaryKey(),
  districtId: integer("district_id").notNull().references(() => districtsTable.id),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  category: reportCategoryEnum("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  address: text("address").default(""),
  sector: text("sector").notNull(),
  reportCount: integer("report_count").notNull().default(0),
  firstReportedAt: timestamp("first_reported_at").notNull().defaultNow(),
  lastReportedAt: timestamp("last_reported_at").notNull().defaultNow(),
  resolutionReports: integer("resolution_reports").notNull().default(0),
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at", { mode: "string" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reportMessagesTable = pgTable("radar_report_messages", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => reportsTable.id),
  sender: messageSenderEnum("sender").notNull(),
  channel: messageChannelEnum("channel").notNull(),
  content: text("content").notNull(),
  adminName: text("admin_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Insert Schemas (Zod) ───────────────────────────────────────────────────

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPanicAlertSchema = createInsertSchema(panicAlertsTable).omit({ id: true, createdAt: true });
export const insertMissingPersonSchema = createInsertSchema(missingPersonsTable).omit({ id: true, createdAt: true });
export const insertAdSlotSchema = createInsertSchema(adSlotsTable).omit({ id: true, createdAt: true });
