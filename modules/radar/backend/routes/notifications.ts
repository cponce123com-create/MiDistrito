/**
 * notifications.ts — Endpoint de notificaciones del módulo Radar.
 *
 * - GET    /notifications         → listar (filtrado por districtId, opcional userId)
 * - PATCH  /notifications/:id/read → marcar como leída
 */
import { Router, type IRouter } from "express";
import { db } from "@midistrito/db";
import { notificationsTable } from "@midistrito/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { optionalAuth } from "@midistrito/core";

const router: IRouter = Router();

// ── GET / — Listar notificaciones del distrito ──────────────────────────────
router.get("/", optionalAuth, async (req, res) => {
  try {
    const districtId = parseInt(req.query.districtId as string);
    const userId = parseInt(req.query.userId as string);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    if (!districtId) {
      return res.status(400).json({ error: "Se requiere districtId" });
    }

    const conditions: any[] = [eq(notificationsTable.districtId, districtId)];
    if (userId) {
      conditions.push(eq(notificationsTable.userId, userId));
    }

    const notifications = await db
      .select()
      .from(notificationsTable)
      .where(and(...conditions))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notificationsTable)
      .where(and(...conditions));

    return res.json({
      notifications: notifications.map((n) => ({
        ...n,
        id: String(n.id),
        createdAt:
          typeof n.createdAt === "object" && "toISOString" in (n.createdAt as any)
            ? (n.createdAt as Date).toISOString()
            : String(n.createdAt),
      })),
      total: Number(count),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get notifications");
    return res.status(500).json({ error: "Error al obtener notificaciones." });
  }
});

// ── PATCH /:id/read — Marcar como leída ─────────────────────────────────────
router.patch("/:id/read", optionalAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "ID de notificación inválido." });
    }

    const [updated] = await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(eq(notificationsTable.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Notificación no encontrada." });
    }

    return res.json({
      ...updated,
      id: String(updated.id),
      createdAt:
        typeof updated.createdAt === "object" && "toISOString" in (updated.createdAt as any)
          ? (updated.createdAt as Date).toISOString()
          : String(updated.createdAt),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update notification");
    return res.status(500).json({ error: "Error al actualizar notificación." });
  }
});

export default router;
