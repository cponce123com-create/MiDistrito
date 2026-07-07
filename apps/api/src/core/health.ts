import { Router, type IRouter } from "express";
import { db } from "@midistrito/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

// GET /healthz — Health check con verificación de DB
router.get("/healthz", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
    });
  } catch (err) {
    return res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      db: "disconnected",
    });
  }
});

export default router;
