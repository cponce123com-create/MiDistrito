/**
 * stats.ts — Estadísticas del módulo de noticias.
 */
import { Router } from "express";
import { db } from "@midistrito/db";
import { articlesTable, sourcesTable } from "@midistrito/db/schema";
import { eq, sql } from "drizzle-orm";
import { optionalAuth } from "@midistrito/core";

const router = Router();

router.get("/", optionalAuth, async (req, res) => {
  try {
    const districtId = parseInt(req.query.districtId as string) || (req as any).jwtUser?.districtId;
    if (!districtId) return res.status(400).json({ error: "Se requiere districtId" });

    const statusCounts = await db.select({
      status: articlesTable.status,
      count: sql<number>`count(*)`,
    })
      .from(articlesTable)
      .where(eq(articlesTable.districtId, districtId))
      .groupBy(articlesTable.status);

    const [activeSources] = await db.select({ count: sql<number>`count(*)` })
      .from(sourcesTable)
      .where(eq(sourcesTable.districtId, districtId));

    return res.json({
      articlesByStatus: statusCounts,
      activeSources: Number(activeSources?.count || 0),
    });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener estadísticas." });
  }
});

export default router;
