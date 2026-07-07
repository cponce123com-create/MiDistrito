/**
 * categories.ts — CRUD de categorías de noticias.
 */
import { Router } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import { categoriesTable } from "@midistrito/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "@midistrito/core";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(asc(categoriesTable.sortOrder));
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener categorías." });
  }
});

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  color: z.string().optional(),
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
    return res.status(201).json(cat);
  } catch (err) {
    return res.status(500).json({ error: "Error al crear categoría." });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(categoriesTable).set(req.body).where(eq(categoriesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Categoría no encontrada." });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar categoría." });
  }
});

export default router;
