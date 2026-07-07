/**
 * alerts.ts — Alertas de pánico + SSE streaming del módulo Radar.
 *
 * - POST /panic-alerts          → crear alerta (emite 'panic_alert.created')
 * - GET  /panic-alerts          → listar activas
 * - GET  /panic-alerts/stream   → SSE en vivo (auth opcional + tope conexiones)
 *
 * Anti-spam:
 *   - userId derivado del JWT, no del body
 *   - authorName validado contra blacklist de términos ofensivos
 */
import { Router, type IRouter, type Response } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import { panicAlertsTable, reportsTable, districtsTable } from "@midistrito/db/schema";
import { eq, and, desc, gt, sql } from "drizzle-orm";
import { requireAuth, requireAdmin, optionalAuth } from "@midistrito/core";
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

// ── Zod schemas ─────────────────────────────────────────────────────────────
const panicAlertSchema = z.object({
  type: z.enum(["robbery", "medical", "fight", "fire", "missing_person", "other"]),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional().default(""),
  authorName: z.string().min(1, "Nombre del autor requerido"),
  sector: z.string().min(1, "Sector requerido"),
  districtId: z.number().optional(),
});

// ── Blacklist de términos ofensivos ─────────────────────────────────────────
const BLACKLIST: RegExp[] = [
  /put[aeo]/i, /mierda/i, /coño/i, /pendejo/i, /hue[vs]/i,
  /ctm/i, /la[ck]s?[ao]s/i, /conchetumadre/i, /maric[óo]n/i,
  /cabr[óo]n/i, /cul[ií]ado/i,
];

function containsBlacklistedTerms(name: string): boolean {
  for (const pattern of BLACKLIST) {
    if (pattern.test(name)) return true;
  }
  return false;
}

// ── SSE Client store ────────────────────────────────────────────────────────
interface SseClient {
  id: string;
  res: Response;
  districtId: number;
  ip: string;
}

let sseClients: SseClient[] = [];
const SSE_GLOBAL_MAX = 100;
const SSE_MAX_PER_IP = 5;

// ── Broadcast SSE a clientes del mismo distrito ─────────────────────────────
function broadcastPanicAlert(alert: any) {
  const alertDistrictId = Number(alert.districtId);
  const payload = {
    event: "new_alert",
    ...alert,
    id: String(alert.id),
    createdAt: alert.createdAt?.toISOString?.() ?? alert.createdAt,
  };
  const body = "data: " + JSON.stringify(payload) + "\n\n";
  sseClients.forEach((client) => {
    if (client.districtId === alertDistrictId) {
      client.res.write(body);
    }
  });
}

// ── GET /panic-alerts/stream — SSE en vivo ──────────────────────────────────
router.get("/stream", optionalAuth, async (req, res) => {
  const districtId = parseInt(req.query.districtId as string);
  if (!districtId) {
    res
      .status(400)
      .json({ error: "Se requiere districtId para conectar al stream." });
    return;
  }

  const userIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  // Límite global
  if (sseClients.length >= SSE_GLOBAL_MAX) {
    res
      .status(503)
      .json({ error: "Servidor saturado. Intenta de nuevo más tarde." });
    return;
  }

  // Límite por IP
  const ipCount = sseClients.filter((c) => c.ip === userIp).length;
  if (ipCount >= SSE_MAX_PER_IP) {
    res
      .status(429)
      .json({ error: "Demasiadas conexiones desde esta IP." });
    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("data: " + JSON.stringify({ event: "connected" }) + "\n\n");

  const client: SseClient = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    res,
    districtId,
    ip: userIp,
  };
  sseClients.push(client);

  const heartbeat = setInterval(() => {
    try {
      res.write(":hb\n\n");

    } catch {
      /* conexión cerrada; el evento close limpia */
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter((c) => c.id !== client.id);
  });
});

// ── GET /panic-alerts — Listar alertas activas ──────────────────────────────
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { active } = req.query;
    const districtId = getDistrictId(req);
    const conditions: any[] = [];

    if (districtId) {
      conditions.push(eq(panicAlertsTable.districtId, districtId));
    }
    if (active !== undefined) {
      conditions.push(eq(panicAlertsTable.isActive, active === "true"));
    }

    const alerts = await db
      .select()
      .from(panicAlertsTable)
      .where(and(...conditions))
      .orderBy(desc(panicAlertsTable.createdAt))
      .limit(50);

    return res.json({
      alerts: alerts.map((a) => ({
        ...a,
        id: String(a.id),
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get panic alerts");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── POST /panic-alerts — Crear alerta de pánico ─────────────────────────────
router.post("/", optionalAuth, async (req, res) => {
  const parsed = panicAlertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  const data = parsed.data;
  const user = (req as any).jwtUser;

  // ── Anti-spam: validar authorName contra blacklist ────────────────────
  if (containsBlacklistedTerms(data.authorName)) {
    return res
      .status(400)
      .json({ error: "El nombre del autor contiene términos no permitidos." });
  }

  // ── Anti-spam: userId autenticado → límites por usuario ───────────────
  if (user?.sub) {
    const userId = parseInt(user.sub);
    const userDistrictId = user.districtId ? Number(user.districtId) : data.districtId;

    // Máximo 2 alertas activas simultáneas por usuario
    const [{ count: activeCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(panicAlertsTable)
      .where(
        and(
          eq(panicAlertsTable.authorName, user.email ?? data.authorName),
          eq(panicAlertsTable.districtId, userDistrictId ?? 0),
          eq(panicAlertsTable.isActive, true),
        ),
      );
    if (Number(activeCount) >= 2) {
      return res
        .status(429)
        .json({ error: "Ya tienes 2 alertas activas. Espera a que se resuelvan." });
    }

    // Mismo tipo en últimos 5 min
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const [{ count: recentCount }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(panicAlertsTable)
      .where(
        and(
          eq(panicAlertsTable.authorName, user.email ?? data.authorName),
          eq(panicAlertsTable.districtId, userDistrictId ?? 0),
          eq(panicAlertsTable.type, data.type as any),
          gt(panicAlertsTable.createdAt, fiveMinAgo),
        ),
      );
    if (Number(recentCount) >= 1) {
      return res
        .status(429)
        .json({
          error: "Ya enviaste una alerta del mismo tipo hace menos de 5 minutos.",
        });
    }
  }

  // ── Determinar districtId ────────────────────────────────────────────
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
    const [alert] = await db
      .insert(panicAlertsTable)
      .values({
        districtId,
        type: data.type as any,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address ?? "",
        authorName: data.authorName,
        sector: data.sector,
      })
      .returning();

    // Crear reporte espejo en reports
    const PANIC_CATEGORY_MAP: Record<string, string> = {
      robbery: "robbery",
      medical: "medical_emergency",
      fight: "fight",
      fire: "fire",
      missing_person: "missing_person",
      other: "other",
    };
    const PANIC_TITLE_MAP: Record<string, string> = {
      robbery: "🚨 Alerta de Pánico - Asalto",
      medical: "🚨 Alerta de Pánico - Emergencia Médica",
      fight: "🚨 Alerta de Pánico - Violencia Física",
      fire: "🚨 Alerta de Pánico - Incendio",
      missing_person: "🚨 Alerta de Pánico - Persona Extraviada",
      other: "🚨 Alerta de Pánico - Otra Emergencia",
    };

    const [district] = await db
      .select({ name: districtsTable.name })
      .from(districtsTable)
      .where(eq(districtsTable.id, districtId))
      .limit(1);

    const [mirrorReport] = await db
      .insert(reportsTable)
      .values({
        title: PANIC_TITLE_MAP[data.type] ?? "🚨 Alerta de Pánico",
        description: `Alerta de pánico generada automáticamente. Tipo: ${data.type}.${data.address ? ` Ubicación: ${data.address}` : ""}`,
        category: (PANIC_CATEGORY_MAP[data.type] ?? "other") as any,
        urgency: "critical" as any,
        isAnonymous: false,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address ?? "",
        sector: data.sector,
        districtId,
        authorName: data.authorName,
      })
      .returning()
      .catch((err2: any) => {
        req.log.error({ err: err2 }, "Failed to create report from panic alert");
        return null;
      });

    // Emitir evento
    events.emit("panic_alert.created", {
      alertId: alert.id,
      districtId: alert.districtId,
      type: data.type,
      lat: data.latitude,
      lng: data.longitude,
    });

    // Broadcast SSE
    broadcastPanicAlert(alert);

    return res.status(201).json({
      ...alert,
      id: String(alert.id),
      createdAt: alert.createdAt.toISOString(),
      linkedReportId: mirrorReport?.id ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create panic alert");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
export { sseClients };
