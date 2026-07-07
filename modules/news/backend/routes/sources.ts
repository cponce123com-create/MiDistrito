/**
 * sources.ts — CRUD de fuentes de noticias.
 */
import { Router } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import { sourcesTable } from "@midistrito/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../../../../apps/api/src/core/auth";

const router = Router();

router.get("/", optionalAuth, async (req, res) => {
  try {
    const districtId = parseInt(req.query.districtId as string) || (req as any).jwtUser?.districtId;
    if (!districtId) return res.status(400).json({ error: "Se requiere districtId" });

    const sources = await db.select()
      .from(sourcesTable)
      .where(and(eq(sourcesTable.districtId, districtId), eq(sourcesTable.isActive, true)))
      .orderBy(desc(sourcesTable.priority));
    return res.json(sources);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener fuentes." });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [source] = await db.select().from(sourcesTable).where(eq(sourcesTable.id, id)).limit(1);
    if (!source) return res.status(404).json({ error: "Fuente no encontrada." });
    return res.json(source);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener fuente." });
  }
});

const createSchema = z.object({
  name: z.string().min(1),
  sourceType: z.enum(["rss", "telegram_channel", "web"]),
  districtId: z.number(),
  feedUrl: z.string().optional(),
  keyword: z.string().optional(),
  telegramUsername: z.string().optional(),
  config: z.record(z.any()).optional().default({}),
  fetchInterval: z.number().optional().default(30),
  priority: z.number().optional().default(0),
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [source] = await db.insert(sourcesTable).values(parsed.data).returning();
    return res.status(201).json(source);
  } catch (err) {
    return res.status(500).json({ error: "Error al crear fuente." });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(sourcesTable).set(req.body).where(eq(sourcesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Fuente no encontrada." });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar fuente." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(sourcesTable).where(eq(sourcesTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "Fuente no encontrada." });
    return res.json({ message: "Fuente eliminada." });
  } catch (err) {
    return res.status(500).json({ error: "Error al eliminar fuente." });
  }
});

export default router;
