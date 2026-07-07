/**
 * reports.ts — CRUD de reportes ciudadanos del módulo Radar.
 *
 * - GET    /reports             → listar (filtrado por districtId)
 * - POST   /reports             → crear (emite 'report.created')
 * - GET    /reports/:id         → detalle
 * - PATCH  /reports/:id         → actualizar estado
 * - POST   /reports/:id/confirm → confirmar vecinal (deduplicado por userId)
 */
import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import {
  reportsTable,
  usersTable,
  districtsTable,
  notificationsTable,
} from "@midistrito/db/schema";
import { auditLogsTable } from "@midistrito/db/schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";
import { requireAuth, optionalAuth, requireAdmin } from "@midistrito/core";
import { events } from "@midistrito/core";

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

function checkTenant(req: any, resourceDistrictId: number): boolean {
  const jwtUser = req.jwtUser as JwtUser | undefined;
  if (!jwtUser) return false;
  if (jwtUser.role === "super_admin") return true;
  return Number(jwtUser.districtId) === Number(resourceDistrictId);
}

// ── Schemas ──────────────────────────────────────────────────────────────────
const VALID_CATEGORIES = [
  "robbery", "fight", "suspicious", "water_cut", "garbage",
  "informal_commerce", "noise", "missing_person", "fire",
  "medical_emergency", "prostitution", "drug_point", "bar_trouble", "other",
  "lost_pet", "power_outage", "street_damage", "stray_dogs", "flooding",
] as const;

const VALID_STATUSES = ["active", "reviewing", "resolved", "archived"] as const;
const VALID_URGENCIES = ["low", "medium", "high", "critical"] as const;

const createReportSchema = z.object({
  title: z.string().min(3, "Título muy corto").max(200),
  description: z.string().min(10, "Descripción muy corta").max(2000),
  category: z.enum(VALID_CATEGORIES),
  urgency: z.enum(VALID_URGENCIES),
  isAnonymous: z.boolean(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional().default(""),
  sector: z.string().min(1, "Sector requerido"),
  districtId: z.number().optional(),
  imageUrl: z.string().optional().nullable(),
  authorName: z.string().optional(),
  contactPhone: z
    .string()
    .regex(/^[+\d\s\-()]{7,15}$/, "Teléfono inválido")
    .optional()
    .nullable(),
  contactEmail: z.string().email("Correo inválido").optional().nullable(),
});

const updateReportSchema = z.object({
  status: z.enum(VALID_STATUSES).optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
});

// ── GET /reports — Listar reportes ───────────────────────────────────────────
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, status, urgency, sector, limit, offset } = req.query;

    if (category && !VALID_CATEGORIES.includes(category as any)) {
      return res.status(400).json({
        error: `Categoría inválida: "${category}".`,
      });
    }
    if (status && !VALID_STATUSES.includes(status as any)) {
      return res.status(400).json({ error: `Estado inválido: "${status}".` });
    }
    if (urgency && !VALID_URGENCIES.includes(urgency as any)) {
      return res
        .status(400)
        .json({ error: `Urgencia inválida: "${urgency}".` });
    }

    const districtId = getDistrictId(req);
    const conditions: any[] = [isNull(reportsTable.deletedAt)];
    if (districtId) conditions.push(eq(reportsTable.districtId, districtId));
    if (category) conditions.push(eq(reportsTable.category, category as any));
    if (status) conditions.push(eq(reportsTable.status, status as any));
    if (urgency) conditions.push(eq(reportsTable.urgency, urgency as any));
    if (sector) conditions.push(eq(reportsTable.sector, sector as string));

    const limitNum = Math.min(Number(limit) || 50, 200);
    const offsetNum = Number(offset) || 0;

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reportsTable)
      .where(and(...conditions));

    const reports = await db
      .select({
        id: reportsTable.id,
        title: reportsTable.title,
        description: reportsTable.description,
        category: reportsTable.category,
        urgency: reportsTable.urgency,
        status: reportsTable.status,
        isAnonymous: reportsTable.isAnonymous,
        latitude: reportsTable.latitude,
        longitude: reportsTable.longitude,
        address: reportsTable.address,
        sector: reportsTable.sector,
        districtId: reportsTable.districtId,
        imageUrl: reportsTable.imageUrl,
        authorName: reportsTable.authorName,
        authorUserId: reportsTable.authorUserId,
        confirmedCount: reportsTable.confirmedCount,
        createdAt: reportsTable.createdAt,
        updatedAt: reportsTable.updatedAt,
      })
      .from(reportsTable)
      .where(and(...conditions))
      .orderBy(desc(reportsTable.createdAt))
      .limit(limitNum)
      .offset(offsetNum);

    const user = (req as any).jwtUser;
    const userId = user?.sub ? parseInt(user.sub) : null;

    return res.json({
      reports: reports.map((r) => {
        const isOwner = userId && r.authorUserId === userId;
        return {
          ...r,
          id: String(r.id),
          authorName: r.authorName,
          contactPhone:
            isOwner ? (r as any).contactPhone : undefined,
          contactEmail:
            isOwner ? (r as any).contactEmail : undefined,
          createdAt:
            typeof r.createdAt === "object" && "toISOString" in (r.createdAt as any)
              ? (r.createdAt as Date).toISOString()
              : String(r.createdAt),
          updatedAt:
            typeof r.updatedAt === "object" && "toISOString" in (r.updatedAt as any)
              ? (r.updatedAt as Date).toISOString()
              : String(r.updatedAt),
        };
      }),
      total: Number(count),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get reports");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── POST /reports — Crear reporte ────────────────────────────────────────────
router.post("/", optionalAuth, async (req, res) => {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  const data = parsed.data;
  const user = (req as any).jwtUser;

  let districtId: number;
  if (user?.districtId && user.role !== "super_admin") {
    districtId = Number(user.districtId);
  } else if (data.districtId) {
    districtId = Number(data.districtId);
  } else {
    return res
      .status(400)
      .json({ error: "Se requiere distrito (districtId)." });
  }

  const SENSITIVE = [
    "informal_commerce",
    "prostitution",
    "drug_point",
    "bar_trouble",
  ];
  const isAnonymous = SENSITIVE.includes(data.category) ? true : data.isAnonymous;

  try {
    let authorName = "Anónimo";
    let authorUserId: number | null = null;

    if (user && user.sub) {
      const [dbUser] = await db
        .select({ id: usersTable.id, name: usersTable.name, alias: usersTable.alias })
        .from(usersTable)
        .where(eq(usersTable.id, parseInt(user.sub)))
        .limit(1);

      if (dbUser) {
        authorUserId = dbUser.id;
        authorName = data.authorName || dbUser.alias || dbUser.name || "Vecino";
      }
    } else {
      authorName = data.authorName || "Anónimo";
    }

    const [district] = await db
      .select({ name: districtsTable.name })
      .from(districtsTable)
      .where(eq(districtsTable.id, districtId))
      .limit(1);

    const [report] = await db
      .insert(reportsTable)
      .values({
        title: data.title,
        description: data.description,
        category: data.category as any,
        urgency: data.urgency as any,
        isAnonymous,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address ?? "",
        sector: data.sector,
        districtId,
        imageUrl: data.imageUrl ?? null,
        authorName,
        authorUserId,
        contactPhone: data.contactPhone ?? null,
        contactEmail: data.contactEmail ?? null,
      })
      .returning();

    events.emit("report.created", {
      reportId: report.id,
      districtId: report.districtId,
      authorUserId: authorUserId ?? 0,
    });

    return res.status(201).json({
      ...report,
      id: String(report.id),
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create report");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── GET /reports/:id — Detalle de reporte ───────────────────────────────────
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const reportId = parseInt(req.params.id as string);
    if (!Number.isFinite(reportId)) {
      return res.status(400).json({ error: "ID de reporte inválido." });
    }

    const [report] = await db
      .select()
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.id, reportId),
          isNull(reportsTable.deletedAt),
        ),
      )
      .limit(1);

    if (!report) {
      return res.status(404).json({ error: "Reporte no encontrado." });
    }

    const user = (req as any).jwtUser;
    const userId = user?.sub ? parseInt(user.sub) : null;
    const isOwner = userId && report.authorUserId === userId;

    return res.json({
      ...report,
      id: String(report.id),
      contactPhone: isOwner ? report.contactPhone : undefined,
      contactEmail: isOwner ? report.contactEmail : undefined,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get report detail");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── PATCH /reports/:id — Actualizar estado ───────────────────────────────────
router.patch("/:id", requireAuth, async (req, res) => {
  const parsed = updateReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const reportId = parseInt(req.params.id as string);
    if (!Number.isFinite(reportId)) {
      return res.status(400).json({ error: "ID de reporte inválido." });
    }

    const [report] = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.id, reportId))
      .limit(1);

    if (!report) {
      return res.status(404).json({ error: "Reporte no encontrado." });
    }

    const user = (req as any).jwtUser;
    if (user.role !== "super_admin" && !checkTenant(req, report.districtId)) {
      return res
        .status(403)
        .json({ error: "No puedes modificar reportes de otro distrito." });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.title) updateData.title = parsed.data.title;
    if (parsed.data.description) updateData.description = parsed.data.description;

    const [updated] = await db
      .update(reportsTable)
      .set(updateData)
      .where(eq(reportsTable.id, reportId))
      .returning();

    events.emit("report.updated", {
      reportId: updated.id,
      districtId: updated.districtId,
      changes: updateData,
    });

    return res.json({
      ...updated,
      id: String(updated.id),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update report");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── POST /reports/:id/confirm — Confirmar reporte (deduplicado por userId) ──
router.post("/:id/confirm", optionalAuth, async (req, res) => {
  try {
    const reportId = parseInt(req.params.id as string);
    if (!Number.isFinite(reportId)) {
      return res.status(400).json({ error: "ID de reporte inválido." });
    }

    const [report] = await db
      .select({ id: reportsTable.id, districtId: reportsTable.districtId, authorUserId: reportsTable.authorUserId })
      .from(reportsTable)
      .where(eq(reportsTable.id, reportId))
      .limit(1);

    if (!report) {
      return res.status(404).json({ error: "Reporte no encontrado." });
    }

    const user = (req as any).jwtUser;
    const userId = user?.sub ? parseInt(user.sub) : null;

    // Deduplicar: verificar en audit_logs si este usuario ya confirmó
    if (userId) {
      const [existingConfirm] = await db
        .select({ id: auditLogsTable.id })
        .from(auditLogsTable)
        .where(
          and(
            eq(auditLogsTable.userId, userId),
            eq(auditLogsTable.action, "report.confirmed"),
            eq(auditLogsTable.targetType, "report"),
            eq(auditLogsTable.targetId, reportId),
          ),
        )
        .limit(1);

      if (existingConfirm) {
        return res.status(409).json({
          error: "Ya confirmaste este reporte. ¡Gracias!",
        });
      }
    }

    // Incrementar contador
    const [updated] = await db
      .update(reportsTable)
      .set({
        confirmedCount: sql`${reportsTable.confirmedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(reportsTable.id, reportId))
      .returning({
        id: reportsTable.id,
        confirmedCount: reportsTable.confirmedCount,
        status: reportsTable.status,
        updatedAt: reportsTable.updatedAt,
      });

    // Auditoría
    if (userId) {
      await db
        .insert(auditLogsTable)
        .values({
          userId,
          action: "report.confirmed",
          targetType: "report",
          targetId: reportId,
          ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket?.remoteAddress ?? null,
        })
        .catch(() => {});

      events.emit("report.confirmed", {
        reportId,
        districtId: report.districtId,
        userId,
      });
    }

    return res.json({
      id: String(updated.id),
      confirmedCount: updated.confirmedCount,
      status: updated.status,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to confirm report");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
