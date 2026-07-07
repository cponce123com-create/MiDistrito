/**
 * Marketplace Module — Placeholder
 *
 * Módulo de marketplace vecinal para comercio local.
 * Pendiente de implementar en Fase 2.
 */
import type { Express } from "express";

export function initModule(app: Express): void {
  app.get("/api/marketplace/health", (_req, res) => {
    res.json({ module: "marketplace", status: "placeholder" });
  });
}
