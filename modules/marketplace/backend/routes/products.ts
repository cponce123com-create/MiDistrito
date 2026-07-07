/**
 * products.ts — CRUD de productos del marketplace
 *
 * GET    /products              → listar (filtro obligatorio districtId, opcional storeId, categoryId)
 * GET    /products/:id          → detalle con imágenes y reseñas
 * POST   /products              → crear (requireAuth)
 * PATCH  /products/:id          → actualizar (requireAuth)
 * DELETE /products/:id          → eliminar (requireAuth)
 * POST   /products/:id/review   → crear reseña (requireAuth, 1-5 rating)
 */
import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import {
  productsTable,
  productImagesTable,
  productReviewsTable,
  storesTable,
} from "@midistrito/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, optionalAuth } from "@midistrito/core";

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

const createProductSchema = z.object({
  storeId: z.number().positive(),
  categoryId: z.number().optional().nullable(),
  districtId: z.number().positive(),
  name: z.string().min(2, "Nombre muy corto").max(300),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  price: z.number().positive("Precio debe ser positivo"),
  salePrice: z.number().optional().nullable(),
  offerPrice: z.number().optional().nullable(),
  costPrice: z.number().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  stock: z.number().int().default(0),
  minStock: z.number().int().default(0),
  unit: z.string().default("unidad"),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().int().default(0),
});

const updateProductSchema = z.object({
  categoryId: z.number().optional().nullable(),
  name: z.string().min(2).max(300).optional(),
  description: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  salePrice: z.number().optional().nullable(),
  offerPrice: z.number().optional().nullable(),
  costPrice: z.number().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  stock: z.number().int().optional(),
  minStock: z.number().int().optional(),
  unit: z.string().optional(),
  status: z.enum(["active", "inactive", "out_of_stock"]).optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1, "Rating mínimo 1").max(5, "Rating máximo 5"),
  comment: z.string().max(1000).optional().nullable(),
});

// ── GET /products — Listar productos ─────────────────────────────────────────
router.get("/", optionalAuth, async (req, res) => {
  try {
    const districtId = getDistrictId(req) || Number(req.query.districtId);
    if (!districtId) {
      return res.status(400).json({ error: "Se requiere districtId." });
    }

    const { storeId, categoryId } = req.query;
    const conditions: any[] = [
      eq(productsTable.districtId, districtId),
      eq(productsTable.status, "active"),
    ];
    if (storeId) conditions.push(eq(productsTable.storeId, Number(storeId)));
    if (categoryId) conditions.push(eq(productsTable.categoryId, Number(categoryId)));

    const products = await db
      .select()
      .from(productsTable)
      .where(and(...conditions))
      .orderBy(desc(productsTable.createdAt));

    return res.json(products);
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── GET /products/:id — Detalle con imágenes y reseñas ──────────────────────
router.get("/:id", async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ error: "ID de producto inválido." });
    }

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    const images = await db
      .select()
      .from(productImagesTable)
      .where(eq(productImagesTable.productId, productId))
      .orderBy(productImagesTable.sortOrder);

    const reviews = await db
      .select()
      .from(productReviewsTable)
      .where(
        and(
          eq(productReviewsTable.productId, productId),
          eq(productReviewsTable.isActive, true),
        ),
      )
      .orderBy(desc(productReviewsTable.createdAt));

    return res.json({ ...product, images, reviews });
  } catch (err) {
    req.log.error({ err }, "Failed to get product detail");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── POST /products — Crear producto ──────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const user = (req as any).jwtUser as JwtUser;

    // Verificar que la tienda pertenece al usuario
    const [store] = await db
      .select({ userId: storesTable.userId })
      .from(storesTable)
      .where(eq(storesTable.id, parsed.data.storeId))
      .limit(1);

    if (!store) {
      return res.status(404).json({ error: "Tienda no encontrada." });
    }

    if (store.userId !== parseInt(user.sub) && !["admin", "moderator", "super_admin"].includes(user.role)) {
      return res.status(403).json({ error: "No eres el dueño de esta tienda." });
    }

    const [product] = await db
      .insert(productsTable)
      .values({
        ...parsed.data,
        price: String(parsed.data.price),
        salePrice: parsed.data.salePrice ? String(parsed.data.salePrice) : null,
        offerPrice: parsed.data.offerPrice ? String(parsed.data.offerPrice) : null,
        costPrice: parsed.data.costPrice ? String(parsed.data.costPrice) : null,
      } as any)
      .returning();

    return res.status(201).json(product);
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── PATCH /products/:id — Actualizar producto ────────────────────────────────
router.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const productId = parseInt(req.params.id);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ error: "ID de producto inválido." });
    }

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    const user = (req as any).jwtUser as JwtUser;

    // Verificar ownership a través de la tienda
    const [store] = await db
      .select({ userId: storesTable.userId })
      .from(storesTable)
      .where(eq(storesTable.id, product.storeId))
      .limit(1);

    if (!store || (store.userId !== parseInt(user.sub) && !["admin", "moderator", "super_admin"].includes(user.role))) {
      return res.status(403).json({ error: "No tienes permiso para modificar este producto." });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    for (const [key, val] of Object.entries(parsed.data)) {
      if (val !== undefined) {
        if (key === "price" || key === "salePrice" || key === "offerPrice" || key === "costPrice") {
          if (val !== null) updateData[key] = String(val);
          else updateData[key] = null;
        } else {
          updateData[key] = val;
        }
      }
    }

    const [updated] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, productId))
      .returning();

    return res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── DELETE /products/:id — Eliminar producto ─────────────────────────────────
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ error: "ID de producto inválido." });
    }

    const [product] = await db
      .select({ id: productsTable.id, storeId: productsTable.storeId })
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    const user = (req as any).jwtUser as JwtUser;

    const [store] = await db
      .select({ userId: storesTable.userId })
      .from(storesTable)
      .where(eq(storesTable.id, product.storeId))
      .limit(1);

    if (!store || (store.userId !== parseInt(user.sub) && !["admin", "moderator", "super_admin"].includes(user.role))) {
      return res.status(403).json({ error: "No tienes permiso para eliminar este producto." });
    }

    await db
      .update(productsTable)
      .set({ status: "inactive", updatedAt: new Date() })
      .where(eq(productsTable.id, productId));

    return res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── POST /products/:id/review — Crear reseña ────────────────────────────────
router.post("/:id/review", requireAuth, async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const productId = parseInt(req.params.id);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ error: "ID de producto inválido." });
    }

    const [product] = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    const user = (req as any).jwtUser as JwtUser;
    const userId = parseInt(user.sub);

    // Verificar que el usuario no haya reseñado ya este producto
    const [existing] = await db
      .select({ id: productReviewsTable.id })
      .from(productReviewsTable)
      .where(
        and(
          eq(productReviewsTable.productId, productId),
          eq(productReviewsTable.userId, userId),
        ),
      )
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: "Ya has reseñado este producto." });
    }

    const [review] = await db
      .insert(productReviewsTable)
      .values({
        productId,
        userId,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      } as any)
      .returning();

    return res.status(201).json(review);
  } catch (err) {
    req.log.error({ err }, "Failed to create review");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
