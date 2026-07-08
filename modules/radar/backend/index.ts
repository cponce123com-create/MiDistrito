/**
 * index.ts — Punto de entrada del módulo Radar.
 * Monta todas las rutas del módulo bajo /api/radar.
 */
import type { Express, Router } from "express";
import { Router as createRouter } from "express";
import { events } from "@midistrito/core";

import reportsRouter from "./routes/reports";
import alertsRouter from "./routes/alerts";
import missingPersonsRouter from "./routes/missingPersons";
import messagesRouter from "./routes/messages";
import categoriesRouter from "./routes/categories";
import statsRouter from "./routes/stats";
import storageRouter from "./routes/storage";
import tenantRouter from "./routes/tenant";
import notificationsRouter from "./routes/notifications";

const router: Router = createRouter();

// ── Health check del módulo ────────────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({ module: "radar", status: "ok", timestamp: new Date().toISOString() });
});

// ── Rutas del módulo ───────────────────────────────────────────────────────
router.use("/reports", reportsRouter);
router.use("/panic-alerts", alertsRouter);
router.use("/missing-persons", missingPersonsRouter);
router.use("/reports/:reportId/messages", messagesRouter);
router.use("/categories", categoriesRouter);
router.use("/stats", statsRouter);
router.use("/storage", storageRouter);
router.use("/tenant", tenantRouter);
router.use("/notifications", notificationsRouter);

/**
 * Inicializa el módulo radar en la aplicación Express.
 */
export default function initModule(app: Express): void {
  app.use("/api/radar", router);
  console.log("[radar] Module initialized at /api/radar");
}

// ── Reacciones a eventos del Core ──────────────────────────────────────────
events.on("report.created", async (data) => {
  console.log("[radar] Event 'report.created':", data);
});
