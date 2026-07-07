/**
 * channels.ts — CRUD de canales de Telegram para publicación.
 */
import { Router } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import { telegramChannelsTable } from "@midistrito/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../../../apps/api/src/core/auth";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const channels = await db.select().from(telegramChannelsTable).where(eq(telegramChannelsTable.isActive, true));
    return res.json(channels);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener canales." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [ch] = await db.select().from(telegramChannelsTable).where(eq(telegramChannelsTable.id, id)).limit(1);
    if (!ch) return res.status(404).json({ error: "Canal no encontrado." });
    return res.json(ch);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener canal." });
  }
});

const createSchema = z.object({
  name: z.string().min(1),
  chatId: z.string().min(1),
  channelType: z.enum(["channel", "group", "supergroup"]).optional().default("channel"),
  username: z.string().optional(),
  inviteLink: z.string().optional(),
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [ch] = await db.insert(telegramChannelsTable).values(parsed.data).returning();
    return res.status(201).json(ch);
  } catch (err) {
    return res.status(500).json({ error: "Error al crear canal." });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(telegramChannelsTable).set(req.body).where(eq(telegramChannelsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Canal no encontrado." });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar canal." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db.delete(telegramChannelsTable).where(eq(telegramChannelsTable.id, id)).returning();
    if (!deleted) return res.status(404).json({ error: "Canal no encontrado." });
    return res.json({ message: "Canal eliminado." });
  } catch (err) {
    return res.status(500).json({ error: "Error al eliminar canal." });
  }
});

export default router;
