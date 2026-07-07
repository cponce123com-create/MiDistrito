import { pgTable, serial, text, integer, boolean, timestamp, numeric, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ── Enums ──────────────────────────────────────────────────────────────────

export const eventCategoryEnum = pgEnum("events_category", [
  "cultural", "sports", "civic", "educational", "religious", "fair", "workshop", "music", "theatre", "other",
]);

export const eventStatusEnum = pgEnum("events_status", [
  "published", "draft", "cancelled", "finished",
]);

// ── Tablas ─────────────────────────────────────────────────────────────────

export const eventsTable = pgTable("events_calendar", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  category: eventCategoryEnum("category").notNull().default("other"),
  districtId: integer("district_id").notNull(),
  address: text("address"),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  organizerName: text("organizer_name"),
  organizerContact: text("organizer_contact"),
  entryFee: text("entry_fee"),
  registrationRequired: boolean("registration_required").notNull().default(false),
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").notNull().default(0),
  website: text("website"),
  status: eventStatusEnum("status").notNull().default("published"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("events_district_idx").on(t.districtId),
  index("events_category_idx").on(t.category),
  index("events_start_date_idx").on(t.startDate),
  index("events_status_idx").on(t.status),
]);

export const eventRegistrationsTable = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("event_registrations_event_idx").on(t.eventId),
  index("event_registrations_user_idx").on(t.userId),
]);

// ── Insert Schemas ─────────────────────────────────────────────────────────

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true, updatedAt: true, currentAttendees: true });
export const insertEventRegistrationSchema = createInsertSchema(eventRegistrationsTable).omit({ id: true, createdAt: true });
