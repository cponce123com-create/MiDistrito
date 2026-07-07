import { pgTable, serial, text, integer, boolean, timestamp, jsonb, pgEnum, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ── Enums ──────────────────────────────────────────────────────────────────

export const sourceTypeEnum = pgEnum("news_source_type", [
  "rss", "telegram_channel", "web",
]);

export const articleStatusEnum = pgEnum("news_article_status", [
  "pending_approval", "approved", "published", "rejected", "archived",
]);

export const channelTypeEnum = pgEnum("news_channel_type", [
  "channel", "group", "supergroup",
]);

// ── Tablas del módulo news ─────────────────────────────────────────────────

export const sourcesTable = pgTable("news_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourceType: sourceTypeEnum("source_type").notNull().default("rss"),
  config: jsonb("config").notNull().default({}),
  districtId: integer("district_id").notNull(),
  feedUrl: text("feed_url"),
  keyword: text("keyword"),
  telegramUsername: text("telegram_username"),
  isActive: boolean("is_active").notNull().default(true),
  isPaused: boolean("is_paused").notNull().default(false),
  priority: integer("priority").notNull().default(0),
  fetchInterval: integer("fetch_interval").notNull().default(30),
  lastFetchedAt: timestamp("last_fetched_at", { mode: "string" }),
  cooldownUntil: timestamp("cooldown_until", { mode: "string" }),
  errorCount: integer("error_count").notNull().default(0),
  maxErrors: integer("max_errors").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const categoriesTable = pgTable("news_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").default("#6b7280"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const articlesTable = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").notNull(),
  categoryId: integer("category_id"),
  districtId: integer("district_id").notNull(),
  externalId: text("external_id"),
  url: text("url").notNull(),
  title: text("title").notNull(),
  originalTitle: text("original_title"),
  summary: text("summary"),
  originalSummary: text("original_summary"),
  body: text("body"),
  originalBody: text("original_body"),
  author: text("author"),
  images: jsonb("images").default([]),
  videos: jsonb("videos").default([]),
  language: text("language").notNull().default("es"),
  hashtags: jsonb("hashtags").default([]),
  status: articleStatusEnum("status").notNull().default("pending_approval"),
  publishedAt: timestamp("published_at", { mode: "string" }),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { mode: "string" }),
  rejectReason: text("reject_reason"),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("news_articles_source_url_idx").on(table.sourceId, table.url),
  uniqueIndex("news_articles_ext_id_idx").on(table.externalId),
]);

export const telegramChannelsTable = pgTable("news_telegram_channels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  chatId: text("chat_id").notNull().unique(),
  channelType: channelTypeEnum("channel_type").notNull().default("channel"),
  username: text("username"),
  inviteLink: text("invite_link"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const approvalQueueTable = pgTable("news_approval_queue", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  status: articleStatusEnum("status").notNull().default("pending_approval"),
  reviewedBy: integer("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { mode: "string" }),
  comments: text("comments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const publicationLogsTable = pgTable("news_publication_logs", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull(),
  channelId: integer("channel_id"),
  channelType: text("channel_type").notNull().default("telegram"),
  messageId: text("message_id"),
  status: text("status").notNull().default("sent"),
  error: text("error"),
  publishedAt: timestamp("published_at", { mode: "string" }).notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scraperLogsTable = pgTable("news_scraper_logs", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").notNull(),
  status: text("status").notNull().default("success"),
  itemsFound: integer("items_found").notNull().default(0),
  itemsNew: integer("items_new").notNull().default(0),
  error: text("error"),
  durationMs: integer("duration_ms"),
  ranAt: timestamp("ran_at").notNull().defaultNow(),
});

export const systemConfigTable = pgTable("news_system_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Insert Schemas (Zod) ───────────────────────────────────────────────────

export const insertSourceSchema = createInsertSchema(sourcesTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertArticleSchema = createInsertSchema(articlesTable).omit({ id: true, createdAt: true, fetchedAt: true });
export const insertCategorySchema = createInsertSchema(categoriesTable).omit({ id: true, createdAt: true });
export const insertTelegramChannelSchema = createInsertSchema(telegramChannelsTable).omit({ id: true, createdAt: true });
