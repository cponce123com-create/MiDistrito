/**
 * missingPersons.ts — Personas desaparecidas del módulo Radar.
 *
 * - GET  /missing-persons        → listar con proyección de lista blanca
 * - POST /missing-persons        → crear
 * - PATCH /missing-persons/:id   → marcar como encontrado
 *
 * Proyección de lista blanca: contactInfo/reportedBy solo para
 * backoffice (admin/municipal) del mismo distrito.
 */
import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import {
  missingPersonsTable,
  districtsTable,
} from "@midistrito/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../../../../apps/api/src/core/auth";
import { events } from "../../../../apps/api/src/core/events";

const router: IRouter = Router();

// ── Tipos ───────────────────────────────────────────────────────────────────
interface JwtUser {
  sub: string;
  email: string;
  role: string;
  district: string;
  districtId: number;
}

const BACKOFFICE_ROLES = ["admin", "moderator", "super_admin", "municipal", "viewer"];

function getDistrictId(req: any): number | null {
  const jwtUser = req.jwtUser as JwtUser | undefined;
  if (jwtUser?.districtId && jwtUser.role !== "super_admin") {
    return Number(jwtUser.districtId);
  }
  const q = req.query?.districtId ?? req.body?.districtId;
  if (q != null) return Number(q);
  return null;
}

// ── Schema ──────────────────────────────────────────────────────────────────
const createMissingPersonSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  age: z.number().int().positive().optional().nullable(),
  clothing: z.string().min(1, "Descripción de vestimenta requerida"),
  photoUrl: z.string().optional().nullable(),
  lastSeenLatitude: z.number().min(-90).max(90),
  lastSeenLongitude: z.number().min(-180).max(180),
  lastSeenAddress: z.string().min(1, "Dirección requerida"),
  lastSeenAt: z.string().min(1, "Fecha/hora requerida"),
  contactInfo: z.string().min(1, "Información de contacto requerida"),
  reportedBy: z.string().min(1, "Nombre del reportante requerido"),
  districtId: z.number().optional(),
});

// ── GET /missing-persons — Listar (proyección con lista blanca) ─────────────
router.get("/", optionalAuth, async (req, res) => {
  try {
    const districtId = getDistrictId(req);
    const conditions: any[] = [isNull(missingPersonsTable.deletedAt)];
    if (districtId) {
      conditions.push(eq(missingPersonsTable.districtId, districtId));
    }

    const user = (req as any).jwtUser as JwtUser | undefined;
    const isBackoffice =
      user && BACKOFFICE_ROLES.includes(user.role);
    const isSameDistrict =
      user && Number(user.districtId) === districtId;

    // Lista blanca: campos públicos siempre visibles
    const persons = await db
      .select({
        id: missingPersonsTable.id,
        name: missingPersonsTable.name,
        age: missingPersonsTable.age,
        clothing: missingPersonsTable.clothing,
        photoUrl: missingPersonsTable.photoUrl,
        lastSeenLatitude: missingPersonsTable.lastSeenLatitude,
        lastSeenLongitude: missingPersonsTable.lastSeenLongitude,
        lastSeenAddress: missingPersonsTable.lastSeenAddress,
        lastSeenAt: missingPersonsTable.lastSeenAt,
        status: missingPersonsTable.status,
        districtId: missingPersonsTable.districtId,
        createdAt: missingPersonsTable.createdAt,
        // contactInfo y reportedBy se incluyen condicionalmente abajo
      })
      .from(missingPersonsTable)
      .where(and(...conditions))
      .orderBy(missingPersonsTable.createdAt);

    const result = persons.map((p) => {
      const base: any = {
        id: String(p.id),
        name: p.name,
        age: p.age,
        clothing: p.clothing,
        photoUrl: p.photoUrl,
        lastSeenLatitude: p.lastSeenLatitude,
        lastSeenLongitude: p.lastSeenLongitude,
        lastSeenAddress: p.lastSeenAddress,
        lastSeenAt:
          typeof p.lastSeenAt === "object" && "toISOString" in (p.lastSeenAt as any)
            ? (p.lastSeenAt as Date).toISOString()
            : String(p.lastSeenAt),
        status: p.status,
        districtId: p.districtId,
        createdAt:
          typeof p.createdAt === "object" && "toISOString" in (p.createdAt as any)
            ? (p.createdAt as Date).toISOString()
            : String(p.createdAt),
      };

      // contactInfo/reportedBy solo para backoffice del mismo distrito
      if (isBackoffice && isSameDistrict) {
        (base as any).contactInfo = (p as any).contactInfo;
        (base as any).reportedBy = (p as any).reportedBy;
      }

      return base;
    });

    return res.json({ missingPersons: result });
  } catch (err) {
    req.log.error({ err }, "Failed to get missing persons");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── POST /missing-persons — Crear ──────────────────────────────────────────
router.post("/", optionalAuth, async (req, res) => {
  const parsed = createMissingPersonSchema.safeParse(req.body);
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

  try {
    const [entry] = await db
      .insert(missingPersonsTable)
      .values({
        districtId,
        name: data.name,
        age: data.age ?? null,
        clothing: data.clothing,
        photoUrl: data.photoUrl ?? null,
        lastSeenLatitude: data.lastSeenLatitude,
        lastSeenLongitude: data.lastSeenLongitude,
        lastSeenAddress: data.lastSeenAddress,
        lastSeenAt: new Date(data.lastSeenAt),
        contactInfo: data.contactInfo,
        reportedBy: data.reportedBy,
      })
      .returning();

    events.emit("missing_person.created", {
      missingId: entry.id,
      districtId: entry.districtId,
    });

    return res.status(201).json({
      ...entry,
      id: String(entry.id),
      lastSeenAt: entry.lastSeenAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create missing person");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── PATCH /missing-persons/:id — Marcar como encontrado ─────────────────────
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const missingId = parseInt(req.params.id as string);
    if (!Number.isFinite(missingId)) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const [entry] = await db
      .select()
      .from(missingPersonsTable)
      .where(eq(missingPersonsTable.id, missingId))
      .limit(1);

    if (!entry) {
      return res.status(404).json({ error: "Persona no encontrada." });
    }

    if (entry.status === "found") {
      return res
        .status(400)
        .json({ error: "Esta persona ya fue marcada como encontrada." });
    }

    const user = (req as any).jwtUser;
    const userDistrictId = user.districtId ? Number(user.districtId) : null;

    // Solo admin/municipal del mismo distrito puede marcar como encontrado
    if (
      user.role !== "super_admin" &&
      userDistrictId !== entry.districtId
    ) {
      return res
        .status(403)
        .json({ error: "No puedes modificar registros de otro distrito." });
    }

    const [updated] = await db
      .update(missingPersonsTable)
      .set({ status: "found" as any })
      .where(eq(missingPersonsTable.id, missingId))
      .returning();

    events.emit("missing_person.found", {
      missingId: updated.id,
      districtId: updated.districtId,
    });

    return res.json({
      ...updated,
      id: String(updated.id),
      lastSeenAt: updated.lastSeenAt.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update missing person");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
