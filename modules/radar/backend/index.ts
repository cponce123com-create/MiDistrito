/**
 * Radar Module — Entry point
 *
 * Exporta el registrador de rutas y la función de inicialización
 * que la app principal (apps/api) llama al cargar el módulo.
 */
import type { Express } from "express";
import { registerRoutes } from "./routes";

export function initModule(app: Express): void {
  registerRoutes(app);
}
