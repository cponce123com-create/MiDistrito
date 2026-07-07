/**
 * News Module — Placeholder
 *
 * Módulo de noticias y comunicados municipales.
 * Pendiente de implementar en Fase 2.
 */
import type { Express } from "express";

export function initModule(app: Express): void {
  app.get("/api/news/health", (_req, res) => {
    res.json({ module: "news", status: "placeholder" });
  });
}
