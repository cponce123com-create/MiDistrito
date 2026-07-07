import { pgTable, serial, text, integer, boolean, timestamp, numeric, jsonb, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ── Enums ──────────────────────────────────────────────────────────────────

export const businessTypeEnum = pgEnum("market_business_type", [
  "clothing", "restaurant", "bakery", "fair_booth", "general_catalog", "service", "other",
]);

export const documentTypeEnum = pgEnum("market_document_type", [
  "DNI", "RUC10", "RUC20",
]);

export const storeStatusEnum = pgEnum("market_store_status", [
  "pending", "active", "suspended", "inactive",
]);

export const productStatusEnum = pgEnum("market_product_status", [
  "active", "inactive", "out_of_stock",
]);

export const orderStatusEnum = pgEnum("market_order_status", [
  "pending", "confirmed", "preparing", "ready", "delivered", "cancelled",
]);

// ── Tablas del módulo marketplace ──────────────────────────────────────────

export const storesTable = pgTable("market_stores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  businessType: businessTypeEnum("business_type").notNull().default("general_catalog"),
  documentType: documentTypeEnum("document_type").notNull().default("DNI"),
  documentNumber: text("document_number").notNull(),
  ownerName: text("owner_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  districtId: integer("district_id").notNull(),
  address: text("address"),
  location: text("location"),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  primaryColor: text("primary_color").default("#2563eb"),
  whatsapp: text("whatsapp"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  website: text("website"),
  storeType: text("store_type").default("local"),
  status: storeStatusEnum("status").notNull().default("pending"),
  isFeatured: boolean("is_featured").default(false),
  totalVisits: integer("total_visits").default(0),
  paymentMethods: text("payment_methods"),
  openingHours: text("opening_hours"),
  doesDelivery: boolean("does_delivery").default(false),
  deliveryRadius: integer("delivery_radius"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("market_stores_slug_idx").on(t.slug),
  index("market_stores_district_idx").on(t.districtId),
  index("market_stores_user_idx").on(t.userId),
  index("market_stores_status_idx").on(t.status),
]);

export const marketCategoriesTable = pgTable("market_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon"),
  description: text("description"),
  parentId: integer("parent_id"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productsTable = pgTable("market_products", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  categoryId: integer("category_id"),
  districtId: integer("district_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  longDescription: text("long_description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  offerPrice: numeric("offer_price", { precision: 10, scale: 2 }),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
  sku: text("sku"),
  barcode: text("barcode"),
  imageUrl: text("image_url"),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  unit: text("unit").notNull().default("unidad"),
  status: productStatusEnum("status").notNull().default("active"),
  isFeatured: boolean("is_featured").notNull().default(false),
  tags: text("tags").array(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("market_products_store_idx").on(t.storeId),
  index("market_products_district_idx").on(t.districtId),
  index("market_products_status_idx").on(t.status),
  index("market_products_category_idx").on(t.categoryId),
]);

export const productImagesTable = pgTable("market_product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productReviewsTable = pgTable("market_product_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const favoritesTable = pgTable("market_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  uniqueIndex("market_favorites_user_product_idx").on(t.userId, t.productId),
]);

export const ordersTable = pgTable("market_orders", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  districtId: integer("district_id").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  contactPhone: text("contact_phone"),
  contactName: text("contact_name"),
  deliveryAddress: text("delivery_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItemsTable = pgTable("market_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const inventoryTable = pgTable("market_inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  type: text("type").notNull().default("in"), // "in" | "out" | "adjustment"
  reference: text("reference"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("market_inventory_product_idx").on(t.productId),
]);

// ── Insert Schemas (Zod) ───────────────────────────────────────────────────

export const insertStoreSchema = createInsertSchema(storesTable).omit({ id: true, createdAt: true, updatedAt: true, totalVisits: true });
export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMarketCategorySchema = createInsertSchema(marketCategoriesTable).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
