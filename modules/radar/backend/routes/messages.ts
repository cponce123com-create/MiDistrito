/**
 * messages.ts — Hilo de mensajes vecino ↔ admin para reportes.
 *
 * - GET  /reports/:id/messages   → listar mensajes de un reporte
 * - POST /reports/:id/messages   → crear mensaje (admin responde al vecino)
 */
import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import {
  reportsTable,
  reportMessagesTable,
  usersTable,
} from "@midistrito/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";
import { requireAuth, requireViewerOrAbove } from "../../../../apps/api/src/core/auth";

const router: IRouter = Router();

// ── Tipos ───────────────────────────────────────────────────────────────────
interface JwtUser {
  sub: string;
  email: string;
  role: string;
  district: string;
  districtId: number;
}

function checkTenant(req: any, resourceDistrictId: number): boolean {
  const jwtUser = req.jwtUser as JwtUser | undefined;
  if (!jwtUser) return false;
  if (jwtUser.role === "super_admin") return true;
  return Number(jwtUser.districtId) === Number(resourceDistrictId);
}

// ── Schemas ──────────────────────────────────────────────────────────────────
const createMessageSchema = z.object({
  channel: z.enum(["whatsapp", "app", "email"]),
  content: z.string().min(1, "El mensaje no puede estar vacío").max(2000),
});

// ── GET /reports/:id/messages — Listar mensajes ─────────────────────────────
router.get(
  "/reports/:id/messages",
  requireAuth,
  requireViewerOrAbove,
  async (req, res) => {
    try {
      const reportId = parseInt(req.params.id as string);
      if (!Number.isFinite(reportId)) {
        return res.status(400).json({ error: "ID de reporte inválido." });
      }

      const [report] = await db
        .select({ id: reportsTable.id, districtId: reportsTable.districtId })
        .from(reportsTable)
        .where(
          and(
            eq(reportsTable.id, reportId),
            isNull(reportsTable.deletedAt),
          ),
        )
        .limit(1);

      if (!report) {
        return res
          .status(404)
          .json({ error: "Reporte no encontrado." });
      }

      const user = (req as any).jwtUser;
      if (
        user.role !== "super_admin" &&
        !checkTenant(req, report.districtId)
      ) {
        return res
          .status(403)
          .json({
            error: "No puedes ver mensajes de reportes de otro distrito.",
          });
      }

      const messages = await db
        .select()
        .from(reportMessagesTable)
        .where(eq(reportMessagesTable.reportId, reportId))
        .orderBy(desc(reportMessagesTable.createdAt))
        .limit(100);

      return res.json({
        messages: messages.map((m) => ({
          ...m,
          id: String(m.id),
          reportId: String(m.reportId),
          createdAt: m.createdAt.toISOString(),
          readAt: m.readAt?.toISOString?.() ?? m.readAt ?? null,
        })),
      });
    } catch (err) {
      req.log.error({ err }, "Failed to get messages");
      return res
        .status(500)
        .json({ error: "Error interno del servidor." });
    }
  },
);

// ── POST /reports/:id/messages — Crear mensaje (admin → vecino) ────────────
router.post(
  "/reports/:id/messages",
  requireAuth,
  requireViewerOrAbove,
  async (req, res) => {
    const parsed = createMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({
          error:
            parsed.error.issues[0]?.message ?? "Datos inválidos",
        });
    }

    const { channel, content } = parsed.data;
    const user = (req as any).jwtUser;

    try {
      const [report] = await db
        .select()
        .from(reportsTable)
        .where(
          and(
            eq(reportsTable.id, parseInt(req.params.id as string)),
            isNull(reportsTable.deletedAt),
          ),
        )
        .limit(1);

      if (!report) {
        return res
          .status(404)
          .json({ error: "Reporte no encontrado." });
      }

      if (!checkTenant(req, report.districtId)) {
        return res
          .status(403)
          .json({
            error:
              "No puedes enviar mensajes a reportes de otro distrito.",
          });
      }

      if (report.isAnonymous) {
        return res
          .status(400)
          .json({
            error:
              "El autor de este reporte es anónimo. No es posible contactarlo directamente.",
          });
      }

      const hasPhone = !!report.contactPhone;
      const hasEmail = !!report.contactEmail;

      if (channel === "whatsapp" && !hasPhone) {
        return res
          .status(400)
          .json({
            error:
              "Este reporte no tiene número de contacto registrado.",
          });
      }
      if (channel === "email" && !hasEmail) {
        return res
          .status(400)
          .json({
            error:
              "Este reporte no tiene correo electrónico registrado.",
          });
      }

      // Obtener nombre del respondedor
      const [responder] = await db
        .select({
          displayName: usersTable.displayName,
          name: usersTable.name,
        })
        .from(usersTable)
        .where(eq(usersTable.id, parseInt(user.sub)))
        .limit(1);

      const responderName =
        responder?.displayName ||
        responder?.name ||
        "Administración Municipal";

      // Guardar mensaje
      const [message] = await db
        .insert(reportMessagesTable)
        .values({
          reportId: report.id,
          sender: "admin",
          channel,
          content: content.trim(),
          adminName: responderName,
          contactPhone:
            channel === "whatsapp" ? report.contactPhone : null,
          contactEmail:
            channel === "email" ? report.contactEmail : null,
        })
        .returning();

      return res.status(201).json({
        ...message,
        id: String(message.id),
        reportId: String(message.reportId),
        createdAt: message.createdAt.toISOString(),
      });
    } catch (err) {
      req.log.error({ err }, "Failed to create message");
      return res
        .status(500)
        .json({ error: "Error interno del servidor." });
    }
  },
);

export default router;
