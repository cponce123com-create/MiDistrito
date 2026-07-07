import type { Express } from "express";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { logger } from "../lib/logger";
import { events } from "./events";

// ── Configuración de módulos ───────────────────────────────────────────────
interface ModuleEntry {
  name: string;
  enabled: boolean;
}

const modules: ModuleEntry[] = [
  { name: "radar", enabled: true },
  { name: "news", enabled: false },
  { name: "marketplace", enabled: false },
];

/**
 * Carga los módulos habilitados según modules.config.ts.
 */
export async function loadModules(app: Express): Promise<void> {
  const enabledModules = modules.filter((m) => m.enabled);

  // Calcular raíz del proyecto desde la ubicación de este archivo
  const __filename = fileURLToPath(import.meta.url);
  const projectRoot = path.resolve(path.dirname(__filename), "../../../..");
  const modulesDir = path.join(projectRoot, "modules");

  for (const mod of enabledModules) {
    try {
      const modPath = path.join(modulesDir, mod.name, "backend", "index.ts");
      const modUrl = pathToFileURL(modPath).href;

      const { default: init } = await import(modUrl) as {
        default: (app: Express) => void | Promise<void>;
      };

      if (typeof init !== "function") {
        logger.warn({ module: mod.name }, "Module does not export initModule function");
        continue;
      }

      await init(app);
      logger.info({ module: mod.name }, "Module loaded successfully");
    } catch (err) {
      logger.error({ module: mod.name, err }, "Failed to load module");
    }
  }

  // ── Core reactions to events ───────────────────────────────────────────────
  events.on("report.created", async (data) => {
    logger.info({ ...data }, "Core: report.created event received");
  });
  events.on("panic_alert.created", async (data) => {
    logger.info({ ...data }, "Core: panic_alert.created event received");
  });
  events.on("user.registered", async (data) => {
    logger.info({ ...data }, "Core: user.registered event received");
  });

  logger.info({ enabledCount: enabledModules.length }, "Module loading complete");
}
