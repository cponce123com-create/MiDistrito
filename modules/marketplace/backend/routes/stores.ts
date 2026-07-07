/**
 * stores.ts — CRUD de tiendas del marketplace
 *
 * GET    /stores            → listar tiendas activas (filtro obligatorio districtId)
 * GET    /stores/:id        → detalle con productos
 * POST   /stores            → crear (requireAuth)
 * PATCH  /stores/:id        → actualizar (requireAuth)
 * PATCH  /stores/:id/status → cambiar estado (solo admin)
 */
import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import { storesTable, productsTable } from "@midistrito/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@midistrito/core";

const router: IRouter = Router();

interface JwtUser {
  sub: string;
  email: string;
  role: string;
  districtId: number;
}

function getDistrictId(req: any): number | null {
  const jwtUser = req.jwtUser as JwtUser | undefined;
  if (jwtUser?.districtId && jwtUser.role !== "super_admin") {
    return Number(jwtUser.districtId);
  }
  const q = req.query?.districtId ?? req.body?.districtId;
  if (q != null) return Number(q);
  return null;
}

function checkTenant(req: any, resourceDistrictId: number): boolean {
  const jwtUser = req.jwtUser as JwtUser | undefined;
  if (!jwtUser) return false;
  if (jwtUser.role === "super_admin") return true;
  return Number(jwtUser.districtId) === Number(resourceDistrictId);
}

const createStoreSchema = z.object({
  name: z.string().min(2, "Nombre muy corto").max(200),
  slug: z.string().min(2).max(200),
  description: z.string().optional(),
  businessType: z.enum(["clothing", "restaurant", "bakery", "fair_booth", "general_catalog", "service", "other"]).default("general_catalog"),
  documentType: z.enum(["DNI", "RUC10", "RUC20"]).default("DNI"),
  documentNumber: z.string().min(1, "Documento requerido"),
  ownerName: z.string().min(1, "Nombre del propietario requerido"),
  phone: z.string().min(1, "Teléfono requerido"),
  email: z.string().email().optional().nullable(),
  districtId: z.number().positive("Distrito requerido"),
  address: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  primaryColor: z.string().default("#2563eb"),
  whatsapp: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  storeType: z.string().default("local"),
  paymentMethods: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
  doesDelivery: z.boolean().default(false),
  deliveryRadius: z.number().optional().nullable(),
});

const updateStoreSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  businessType: z.enum(["clothing", "restaurant", "bakery", "fair_booth", "general_catalog", "service", "other"]).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  whatsapp: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  paymentMethods: z.string().optional().nullable(),
  openingHours: z.string().optional().nullable(),
  doesDelivery: z.boolean().optional(),
  deliveryRadius: z.number().optional().nullable(),
});

const statusSchema = z.object({
  status: z.enum(["pending", "active", "suspended", "inactive"]),
});

// ── GET /stores — Listar tiendas activas ─────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const districtId = getDistrictId(req) || Number(req.query.districtId);
    if (!districtId) {
      return res.status(400).json({ error: "Se requiere districtId." });
    }

    const stores = await db
      .select()
      .from(storesTable)
      .where(
        and(
          eq(storesTable.districtId, districtId),
          eq(storesTable.isActive, true),
        ),
      )
      .orderBy(desc(storesTable.createdAt));

    return res.json(stores);
  } catch (err) {
    req.log.error({ err }, "Failed to list stores");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── GET /stores/:id — Detalle de tienda con productos ────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const storeId = parseInt(req.params.id);
    if (!Number.isFinite(storeId)) {
      return res.status(400).json({ error: "ID de tienda inválido." });
    }

    const [store] = await db
      .select()
      .from(storesTable)
      .where(eq(storesTable.id, storeId))
      .limit(1);

    if (!store) {
      return res.status(404).json({ error: "Tienda no encontrada." });
    }

    const products = await db
      .select()
      .from(productsTable)
      .where(
        and(
          eq(productsTable.storeId, storeId),
          eq(productsTable.status, "active"),
        ),
      )
      .orderBy(desc(productsTable.createdAt));

    return res.json({ ...store, products });
  } catch (err) {
    req.log.error({ err }, "Failed to get store detail");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── POST /stores — Crear tienda ──────────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const user = (req as any).jwtUser as JwtUser;
    const storeData = {
      ...parsed.data,
      userId: parseInt(user.sub),
      lat: parsed.data.lat ? String(parsed.data.lat) : null,
      lng: parsed.data.lng ? String(parsed.data.lng) : null,
    };

    const [store] = await db
      .insert(storesTable)
      .values(storeData as any)
      .returning();

    return res.status(201).json(store);
  } catch (err) {
    req.log.error({ err }, "Failed to create store");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── PATCH /stores/:id — Actualizar tienda ────────────────────────────────────
router.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const storeId = parseInt(req.params.id);
    if (!Number.isFinite(storeId)) {
      return res.status(400).json({ error: "ID de tienda inválido." });
    }

    const [store] = await db
      .select()
      .from(storesTable)
      .where(eq(storesTable.id, storeId))
      .limit(1);

    if (!store) {
      return res.status(404).json({ error: "Tienda no encontrada." });
    }

    const user = (req as any).jwtUser as JwtUser;
    if (store.userId !== parseInt(user.sub) && !["admin", "moderator", "super_admin"].includes(user.role)) {
      return res.status(403).json({ error: "No tienes permiso para modificar esta tienda." });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    for (const [key, val] of Object.entries(parsed.data)) {
      if (val !== undefined) {
        updateData[key] = val;
      }
    }
    if (parsed.data.lat !== undefined) updateData.lat = String(parsed.data.lat);
    if (parsed.data.lng !== undefined) updateData.lng = String(parsed.data.lng);

    const [updated] = await db
      .update(storesTable)
      .set(updateData)
      .where(eq(storesTable.id, storeId))
      .returning();

    return res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update store");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── PATCH /stores/:id/status — Cambiar estado (solo admin) ──────────────────
router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const storeId = parseInt(req.params.id);
    if (!Number.isFinite(storeId)) {
      return res.status(400).json({ error: "ID de tienda inválido." });
    }

    const [updated] = await db
      .update(storesTable)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(storesTable.id, storeId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Tienda no encontrada." });
    }

    return res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update store status");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
