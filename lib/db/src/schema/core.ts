import { pgTable, text, serial, boolean, real, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ── Enums ──────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("core_user_role", [
  "super_admin", "admin", "moderator", "municipal", "viewer", "user",
]);

export const consentTypeEnum = pgEnum("core_consent_type", [
  "privacy_policy", "terms_of_use",
]);

export const notificationTypeEnum = pgEnum("core_notification_type", [
  "system", "panic_alert", "missing_person", "report_update", "report_nearby",
]);

// ── Tablas del Core ────────────────────────────────────────────────────────

export const districtsTable = pgTable("core_districts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  province: text("province").notNull(),
  department: text("department").notNull(),
  centerLat: real("center_lat"),
  centerLng: real("center_lng"),
  defaultZoom: integer("default_zoom").default(15),
  boundary: jsonb("boundary"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usersTable = pgTable("core_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  dni: text("dni").unique(),
  phone: text("phone"),
  firstName: text("first_name").notNull().default(""),
  lastName: text("last_name").notNull().default(""),
  bannedAt: timestamp("banned_at", { mode: "string" }),
  banReason: text("ban_reason"),
  helpfulReports: integer("helpful_reports").notNull().default(0),
  role: userRoleEnum("role").notNull().default("user"),
  districtId: integer("district_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  reportsCount: integer("reports_count").notNull().default(0),
  trustScore: integer("trust_score").notNull().default(50),
  suspendedUntil: timestamp("suspended_until"),
  vecinoId: integer("vecino_id").unique(),
  displayName: text("display_name"),
  alias: text("alias"),
  loginAttempts: integer("login_attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  isBlocked: boolean("is_blocked").default(false),
  avatarUrl: text("avatar_url"),
  sector: text("sector").default(""),
  storeId: text("store_id"),
  identityVerified: boolean("identity_verified").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const licensesTable = pgTable("core_licenses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  siglas: text("siglas").notNull(),
  districtName: text("district_name").notNull(),
  province: text("province").notNull(),
  department: text("department").notNull(),
  districtId: integer("district_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  activatedAt: timestamp("activated_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(false),
  maxViewers: integer("max_viewers").notNull().default(10),
});

export const notificationsTable = pgTable("core_notifications", {
  id: serial("id").primaryKey(),
  districtId: integer("district_id").notNull(),
  userId: integer("user_id"),
  type: notificationTypeEnum("type").notNull().default("system"),
  title: text("title").notNull(),
  body: text("body").notNull(),
  referenceId: text("reference_id"),
  referenceType: text("reference_type"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogsTable = pgTable("core_audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  ip: text("ip"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const refreshTokensTable = pgTable("core_refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tokenHash: text("token_hash").notNull(),
  revoked: boolean("revoked").notNull().default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userConsentsTable = pgTable("core_user_consents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: consentTypeEnum("type").notNull(),
  version: text("version").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Insert Schemas (Zod) ───────────────────────────────────────────────────

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notificationsTable).omit({ id: true, createdAt: true });
