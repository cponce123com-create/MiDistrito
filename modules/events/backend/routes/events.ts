import { Router } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import { eventsTable, eventRegistrationsTable } from "@midistrito/db/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../../../../apps/api/src/core/auth";

const router = Router();

router.get("/", optionalAuth, async (req, res) => {
  try {
    const districtId = parseInt(req.query.districtId as string) || (req as any).jwtUser?.districtId;
    if (!districtId) return res.status(400).json({ error: "Se requiere districtId" });

    const category = req.query.category as string;
    const upcoming = req.query.upcoming !== "false";
    const conditions = [eq(eventsTable.districtId, districtId), eq(eventsTable.isActive, true)];
    if (category) conditions.push(eq(eventsTable.category, category as any));
    if (upcoming) conditions.push(gte(eventsTable.startDate, new Date().toISOString()));

    const events = await db.select().from(eventsTable).where(and(...conditions)).orderBy(desc(eventsTable.startDate));
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener eventos." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
    if (!event) return res.status(404).json({ error: "Evento no encontrado." });
    return res.json(event);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener evento." });
  }
});

const createSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  category: z.enum(["cultural", "sports", "civic", "educational", "religious", "fair", "workshop", "music", "theatre", "other"]),
  districtId: z.number(),
  address: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  imageUrl: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  organizerName: z.string().optional(),
  organizerContact: z.string().optional(),
  entryFee: z.string().optional(),
  registrationRequired: z.boolean().optional().default(false),
  maxAttendees: z.number().optional(),
  website: z.string().optional(),
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [event] = await db.insert(eventsTable).values(parsed.data).returning();
    return res.status(201).json(event);
  } catch (err) {
    return res.status(500).json({ error: "Error al crear evento." });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(eventsTable).set(req.body).where(eq(eventsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Evento no encontrado." });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar evento." });
  }
});

router.post("/:id/register", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
    if (!event) return res.status(404).json({ error: "Evento no encontrado." });
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ error: "Evento lleno." });
    }
    const { name, email, phone, notes } = req.body;
    const userId = (req as any).jwtUser?.sub ? parseInt((req as any).jwtUser?.sub) : 0;
    const [registration] = await db.insert(eventRegistrationsTable).values({ eventId, userId, name, email, phone, notes }).returning();
    await db.update(eventsTable).set({ currentAttendees: sql`${eventsTable.currentAttendees} + 1` }).where(eq(eventsTable.id, eventId));
    return res.status(201).json(registration);
  } catch (err) {
    return res.status(500).json({ error: "Error al registrar en evento." });
  }
});

export default router;
