/**
 * categories.ts — Categorías del marketplace
 *
 * GET    /categories   → listar categorías activas
 * POST   /categories   → crear (requireAuth)
 * PATCH  /categories/:id → actualizar (requireAuth)
 */
import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import { marketCategoriesTable } from "@midistrito/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../../../../apps/api/src/core/auth";

const router: IRouter = Router();

const createCategorySchema = z.object({
  name: z.string().min(2, "Nombre muy corto").max(100),
  slug: z.string().min(2).max(100),
  icon: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  parentId: z.number().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  icon: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  parentId: z.number().optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// ── GET /categories — Listar categorías activas ──────────────────────────────
router.get("/", async (req, res) => {
  try {
    const categories = await db
      .select()
      .from(marketCategoriesTable)
      .where(eq(marketCategoriesTable.isActive, true))
      .orderBy(asc(marketCategoriesTable.sortOrder), asc(marketCategoriesTable.name));

    return res.json(categories);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── POST /categories — Crear categoría ──────────────────────────────────────
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const [category] = await db
      .insert(marketCategoriesTable)
      .values(parsed.data as any)
      .returning();

    return res.status(201).json(category);
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── PATCH /categories/:id — Actualizar categoría ────────────────────────────
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const categoryId = parseInt(req.params.id);
    if (!Number.isFinite(categoryId)) {
      return res.status(400).json({ error: "ID de categoría inválido." });
    }

    const updateData: Record<string, any> = {};
    for (const [key, val] of Object.entries(parsed.data)) {
      if (val !== undefined) {
        updateData[key] = val;
      }
    }

    const [updated] = await db
      .update(marketCategoriesTable)
      .set(updateData)
      .where(eq(marketCategoriesTable.id, categoryId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Categoría no encontrada." });
    }

    return res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update category");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
