import { Router } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import { attractionsTable, attractionReviewsTable } from "@midistrito/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, optionalAuth } from "@midistrito/core";

const router = Router();

router.get("/", optionalAuth, async (req, res) => {
  try {
    const districtId = parseInt(req.query.districtId as string) || (req as any).jwtUser?.districtId;
    if (!districtId) return res.status(400).json({ error: "Se requiere districtId" });

    const type = req.query.type as string;
    const conditions = [eq(attractionsTable.districtId, districtId), eq(attractionsTable.isActive, true)];
    if (type) conditions.push(eq(attractionsTable.attractionType, type as any));

    const attractions = await db.select().from(attractionsTable).where(and(...conditions)).orderBy(desc(attractionsTable.sortOrder));
    return res.json(attractions);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener atractivos." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [attraction] = await db.select().from(attractionsTable).where(eq(attractionsTable.id, id)).limit(1);
    if (!attraction) return res.status(404).json({ error: "Atractivo no encontrado." });
    const reviews = await db.select().from(attractionReviewsTable).where(eq(attractionReviewsTable.attractionId, id));
    return res.json({ ...attraction, reviews });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener atractivo." });
  }
});

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  attractionType: z.enum(["natural", "cultural", "gastronomic", "adventure", "religious", "historical", "recreational", "other"]),
  districtId: z.number(),
  address: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  imageUrl: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  schedule: z.string().optional(),
  entryFee: z.string().optional(),
  howToGetThere: z.string().optional(),
  tips: z.string().optional(),
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const [attraction] = await db.insert(attractionsTable).values(parsed.data).returning();
    return res.status(201).json(attraction);
  } catch (err) {
    return res.status(500).json({ error: "Error al crear atractivo." });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db.update(attractionsTable).set(req.body).where(eq(attractionsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Atractivo no encontrado." });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar atractivo." });
  }
});

router.post("/:id/review", requireAuth, async (req, res) => {
  try {
    const attractionId = parseInt(req.params.id);
    const userId = parseInt((req as any).jwtUser?.sub);
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "Rating debe ser 1-5" });
    const [review] = await db.insert(attractionReviewsTable).values({ attractionId, userId, rating, comment }).returning();
    return res.status(201).json(review);
  } catch (err) {
    return res.status(500).json({ error: "Error al crear reseña." });
  }
});

export default router;
