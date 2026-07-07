import { Router, type IRouter } from "express";
import { db } from "@midistrito/db";
import { districtsTable } from "@midistrito/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// GET /districts — Listar todos los distritos activos
router.get("/districts", async (_req, res) => {
  try {
    const districts = await db.select()
      .from(districtsTable)
      .where(eq(districtsTable.isActive, true));
    return res.json(districts);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener distritos." });
  }
});

// GET /districts/:id — Obtener un distrito por ID
router.get("/districts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [district] = await db.select()
      .from(districtsTable)
      .where(eq(districtsTable.id, id))
      .limit(1);
    if (!district) return res.status(404).json({ error: "Distrito no encontrado." });
    return res.json(district);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener distrito." });
  }
});

export default router;
