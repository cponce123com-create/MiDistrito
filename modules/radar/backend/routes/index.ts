import type { Express } from "express";

/**
 * Registra todas las rutas del módulo Radar en la aplicación Express.
 *
 * Rutas:
 *   GET    /api/radar/reports
 *   POST   /api/radar/reports
 *   GET    /api/radar/reports/:id
 *   PATCH  /api/radar/reports/:id
 *   DELETE /api/radar/reports/:id
 */
export function registerRoutes(app: Express): void {
  // Placeholder: las rutas se implementan en Fase 2
  app.get("/api/radar/health", (_req, res) => {
    res.json({ module: "radar", status: "loaded" });
  });
}
