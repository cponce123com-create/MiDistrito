/**
 * approval.ts — Cola de aprobación de artículos.
 */
import { Router } from "express";
import { db } from "@midistrito/db";
import { articlesTable, approvalQueueTable } from "@midistrito/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "@midistrito/core";
import { events } from "@midistrito/core";

const router = Router();

// GET / — Listar cola de aprobación (pendientes)
router.get("/", requireAuth, async (req, res) => {
  try {
    const districtId = parseInt(req.query.districtId as string) || (req as any).jwtUser?.districtId;
    if (!districtId) return res.status(400).json({ error: "Se requiere districtId" });

    const pending = await db.select()
      .from(articlesTable)
      .where(and(
        eq(articlesTable.districtId, districtId),
        eq(articlesTable.status, "pending_approval"),
      ))
      .orderBy(desc(articlesTable.fetchedAt));

    return res.json(pending);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener cola de aprobación." });
  }
});

// POST /:id/approve — Aprobar artículo
router.post("/:id/approve", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).jwtUser?.sub;

    const [article] = await db.update(articlesTable)
      .set({ status: "approved", reviewedBy: userId, reviewedAt: new Date().toISOString() })
      .where(eq(articlesTable.id, id))
      .returning();

    if (!article) return res.status(404).json({ error: "Artículo no encontrado." });

    await db.insert(approvalQueueTable).values({
      articleId: id,
      status: "approved",
      reviewedBy: userId,
    });

    events.emit("news.article.approved", { articleId: id, districtId: article.districtId });
    return res.json(article);
  } catch (err) {
    return res.status(500).json({ error: "Error al aprobar artículo." });
  }
});

// POST /:id/reject — Rechazar artículo
router.post("/:id/reject", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req as any).jwtUser?.sub;
    const { reason } = req.body || {};

    const [article] = await db.update(articlesTable)
      .set({ status: "rejected", reviewedBy: userId, reviewedAt: new Date().toISOString(), rejectReason: reason || null })
      .where(eq(articlesTable.id, id))
      .returning();

    if (!article) return res.status(404).json({ error: "Artículo no encontrado." });

    await db.insert(approvalQueueTable).values({
      articleId: id,
      status: "rejected",
      reviewedBy: userId,
      comments: reason || null,
    });

    return res.json(article);
  } catch (err) {
    return res.status(500).json({ error: "Error al rechazar artículo." });
  }
});

export default router;
