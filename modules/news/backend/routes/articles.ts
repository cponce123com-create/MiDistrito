/**
 * articles.ts — CRUD de artículos de noticias.
 */
import { Router } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import { articlesTable, sourcesTable, categoriesTable } from "@midistrito/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, optionalAuth } from "@midistrito/core";
import { events } from "@midistrito/core";

const router = Router();

// GET / — Listar artículos
router.get("/", optionalAuth, async (req, res) => {
  try {
    const districtId = parseInt(req.query.districtId as string) || (req as any).jwtUser?.districtId;
    const status = req.query.status as string;
    const sourceId = req.query.sourceId ? parseInt(req.query.sourceId as string) : undefined;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const jwtUser = (req as any).jwtUser;

    if (!districtId) {
      return res.status(400).json({ error: "Se requiere districtId" });
    }

    const conditions = [eq(articlesTable.districtId, districtId)];

    // Si no es admin/editor, solo ver publicados
    const role = jwtUser?.role;
    if (!role || !["admin", "super_admin", "editor", "municipal"].includes(role)) {
      conditions.push(eq(articlesTable.status, "published"));
    } else if (status) {
      conditions.push(eq(articlesTable.status, status as any));
    }

    if (sourceId) conditions.push(eq(articlesTable.sourceId, sourceId));
    if (categoryId) conditions.push(eq(articlesTable.categoryId, categoryId));

    const articles = await db.select()
      .from(articlesTable)
      .where(and(...conditions))
      .orderBy(desc(articlesTable.fetchedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(articlesTable)
      .where(and(...conditions));

    return res.json({ articles, total: Number(count), limit, offset });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener artículos." });
  }
});

// GET /:id — Detalle de artículo
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
    if (!article) return res.status(404).json({ error: "Artículo no encontrado." });
    return res.json(article);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener artículo." });
  }
});

// POST / — Crear artículo
const createSchema = z.object({
  sourceId: z.number(),
  categoryId: z.number().optional(),
  districtId: z.number(),
  url: z.string().url(),
  title: z.string().min(1).max(500),
  summary: z.string().optional(),
  body: z.string().optional(),
  author: z.string().optional(),
  status: z.enum(["pending_approval", "approved"]).optional().default("pending_approval"),
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const [article] = await db.insert(articlesTable).values(parsed.data).returning();
    events.emit("news.article.created", { articleId: article.id, districtId: article.districtId });
    return res.status(201).json(article);
  } catch (err) {
    return res.status(500).json({ error: "Error al crear artículo." });
  }
});

// PATCH /:id — Actualizar artículo
const updateSchema = z.object({
  categoryId: z.number().optional(),
  title: z.string().min(1).max(500).optional(),
  summary: z.string().optional(),
  body: z.string().optional(),
  status: z.enum(["pending_approval", "approved", "published", "rejected", "archived"]).optional(),
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const [updated] = await db.update(articlesTable)
      .set(parsed.data)
      .where(eq(articlesTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Artículo no encontrado." });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar artículo." });
  }
});

// DELETE /:id — Eliminar artículo
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(articlesTable).where(eq(articlesTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "Artículo no encontrado." });
    return res.json({ message: "Artículo eliminado." });
  } catch (err) {
    return res.status(500).json({ error: "Error al eliminar artículo." });
  }
});

export default router;
