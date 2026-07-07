/**
 * categories.ts — Categorías dinámicas del módulo Radar.
 *
 * - GET /categories → listar categorías activas (público)
 */
import { Router, type IRouter } from "express";
import { db } from "@midistrito/db";
import { reportCategoriesTable } from "@midistrito/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// ── GET /categories — Categorías activas (público) ─────────────────────────
router.get("/", async (_req, res) => {
  try {
    const categories = await db
      .select()
      .from(reportCategoriesTable)
      .where(eq(reportCategoriesTable.isActive, true))
      .orderBy(reportCategoriesTable.sortOrder);

    return res.json({ categories });
  } catch (err) {
    console.error("[radar/categories] Failed to get categories:", err);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
