/**
 * tenant.ts — Verificación de tenant (distrito) para el módulo Radar.
 *
 * - GET /tenant → info del distrito actual
 *
 * Usa el districtId del JWT (usuario autenticado) o el query param districtId
 * para devolver información del distrito.
 */
import { Router, type IRouter } from "express";
import { db } from "@midistrito/db";
import { districtsTable } from "@midistrito/db/schema";
import { eq } from "drizzle-orm";
import { optionalAuth } from "../../../../apps/api/src/core/auth";

const router: IRouter = Router();

interface JwtUser {
  sub: string;
  email: string;
  role: string;
  district: string;
  districtId: number;
}

// ── GET /tenant — Info del distrito actual ──────────────────────────────────
router.get("/", optionalAuth, async (req, res) => {
  try {
    const jwtUser = (req as any).jwtUser as JwtUser | undefined;
    const queryDistrictId = parseInt(req.query.districtId as string);

    let districtId: number | null = null;

    if (jwtUser?.districtId) {
      districtId = Number(jwtUser.districtId);
    } else if (!isNaN(queryDistrictId)) {
      districtId = queryDistrictId;
    }

    if (!districtId) {
      return res.status(400).json({
        error: "No se pudo determinar el distrito. Autentícate o provee districtId.",
      });
    }

    const [district] = await db
      .select({
        id: districtsTable.id,
        slug: districtsTable.slug,
        name: districtsTable.name,
        province: districtsTable.province,
        department: districtsTable.department,
        centerLat: districtsTable.centerLat,
        centerLng: districtsTable.centerLng,
        defaultZoom: districtsTable.defaultZoom,
        isActive: districtsTable.isActive,
      })
      .from(districtsTable)
      .where(eq(districtsTable.id, districtId))
      .limit(1);

    if (!district) {
      return res.status(404).json({ error: "Distrito no encontrado." });
    }

    return res.json({ district });
  } catch (err) {
    req.log.error({ err }, "Failed to get tenant info");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
