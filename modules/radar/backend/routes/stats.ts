/**
 * stats.ts — Estadísticas del módulo Radar.
 *
 * - GET /stats → dashboard con métricas agregadas del distrito
 *
 * Cachea resultados en memoria por 30 segundos (TTL).
 */
import { Router, type IRouter } from "express";
import { db } from "@midistrito/db";
import {
  reportsTable,
  panicAlertsTable,
  missingPersonsTable,
} from "@midistrito/db/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { optionalAuth } from "@midistrito/core";

const router: IRouter = Router();

// ── Tipos ───────────────────────────────────────────────────────────────────
interface JwtUser {
  sub: string;
  email: string;
  role: string;
  district: string;
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

// ── Cache simple en memoria ─────────────────────────────────────────────────
const statsCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 30_000;

function cacheGet(key: string): any | null {
  const entry = statsCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data;
  statsCache.delete(key);
  return null;
}

function cacheSet(key: string, data: any): void {
  statsCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ── GET /stats — Dashboard filtrado por distrito ────────────────────────────
router.get("/", optionalAuth, async (req, res) => {
  try {
    const districtId = getDistrictId(req);
    const cacheKey = `stats_${districtId ?? "all"}`;

    const cached = cacheGet(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const baseFilter = districtId
      ? and(eq(reportsTable.districtId, districtId))
      : undefined;

    const panicFilter = districtId
      ? and(eq(panicAlertsTable.districtId, districtId))
      : undefined;

    const missingFilter = districtId
      ? and(eq(missingPersonsTable.districtId, districtId))
      : undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      [{ count: totalReports }],
      [{ count: activeAlerts }],
      [{ count: todayIncidents }],
      [{ count: resolvedToday }],
      [{ count: totalMissing }],
      [{ count: activeMissing }],
      reportsByCategory,
      reportsByStatus,
      topSectors,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(reportsTable)
        .where(baseFilter ?? sql`TRUE`),
      db
        .select({ count: sql<number>`count(*)` })
        .from(reportsTable)
        .where(
          and(
            baseFilter ?? sql`TRUE`,
            eq(reportsTable.status, "active"),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(reportsTable)
        .where(
          and(
            baseFilter ?? sql`TRUE`,
            gte(reportsTable.createdAt, today),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(reportsTable)
        .where(
          and(
            baseFilter ?? sql`TRUE`,
            eq(reportsTable.status, "resolved"),
            gte(reportsTable.updatedAt, today),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(missingPersonsTable)
        .where(missingFilter ?? sql`TRUE`),
      db
        .select({ count: sql<number>`count(*)` })
        .from(missingPersonsTable)
        .where(
          and(
            missingFilter ?? sql`TRUE`,
            eq(missingPersonsTable.status, "active"),
          ),
        ),
      db
        .select({
          category: reportsTable.category,
          count: sql<number>`count(*)`,
        })
        .from(reportsTable)
        .where(baseFilter ?? sql`TRUE`)
        .groupBy(reportsTable.category)
        .orderBy(sql`count(*) desc`),
      db
        .select({
          status: reportsTable.status,
          count: sql<number>`count(*)`,
        })
        .from(reportsTable)
        .where(baseFilter ?? sql`TRUE`)
        .groupBy(reportsTable.status)
        .orderBy(sql`count(*) desc`),
      db
        .select({
          sector: reportsTable.sector,
          count: sql<number>`count(*)`,
        })
        .from(reportsTable)
        .where(baseFilter ?? sql`TRUE`)
        .groupBy(reportsTable.sector)
        .orderBy(sql`count(*) desc`)
        .limit(5),
    ]);

    // Tendencia semanal
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const weeklyRaw = await db
      .select({
        day: sql<string>`to_char(${reportsTable.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)`,
      })
      .from(reportsTable)
      .where(
        and(
          baseFilter ?? sql`TRUE`,
          gte(reportsTable.createdAt, sevenDaysAgo),
        ),
      )
      .groupBy(
        sql`to_char(${reportsTable.createdAt}, 'YYYY-MM-DD')`,
      )
      .orderBy(
        sql`to_char(${reportsTable.createdAt}, 'YYYY-MM-DD')`,
      );

    // Rellenar días sin reportes con 0
    const weeklyTrend: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayStr = d.toISOString().slice(0, 10);
      const found = weeklyRaw.find((w) => w.day === dayStr);
      weeklyTrend.push({
        day: dayStr,
        count: found ? Number(found.count) : 0,
      });
    }

    // Zona crítica
    const topCat = reportsByCategory[0];
    const criticalZone = topCat
      ? `${topCat.category} (${topCat.count})`
      : "Ninguna";

    const result = {
      totalReports: Number(totalReports),
      activeAlerts: Number(activeAlerts),
      todayIncidents: Number(todayIncidents),
      resolvedToday: Number(resolvedToday),
      totalMissing: Number(totalMissing),
      activeMissing: Number(activeMissing),
      reportsByCategory: reportsByCategory.map((r) => ({
        category: r.category,
        count: Number(r.count),
      })),
      reportsByStatus: reportsByStatus.map((r) => ({
        status: r.status,
        count: Number(r.count),
      })),
      topSectors: topSectors.map((s) => ({
        sector: s.sector,
        count: Number(s.count),
      })),
      weeklyTrend,
      criticalZone,
      cachedAt: new Date().toISOString(),
    };

    cacheSet(cacheKey, result);
    return res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
