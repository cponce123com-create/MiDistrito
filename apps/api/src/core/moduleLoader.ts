import type { Express } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { logger } from "../lib/logger";
import { events } from "./events";

interface ModuleEntry { name: string; enabled: boolean; }

const modules: ModuleEntry[] = [
  { name: "radar", enabled: true },
  { name: "news", enabled: true },
  { name: "marketplace", enabled: true },
  { name: "tourism", enabled: true },
  { name: "events", enabled: true },
];

function resolveModulePath(moduleName: string): string | null {
  const __filename = fileURLToPath(import.meta.url);
  const projectRoot = path.resolve(path.dirname(__filename), "../../../..");
  const candidates = [
    path.join(projectRoot, "modules", moduleName, "backend", "index.ts"),
    path.join(projectRoot, "modules", moduleName, "backend", "dist", "index.js"),
    path.join(projectRoot, "dist", "modules", moduleName, "backend", "index.js"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

export async function loadModules(app: Express): Promise<void> {
  const enabledModules = modules.filter((m) => m.enabled);
  for (const mod of enabledModules) {
    try {
      const modPath = resolveModulePath(mod.name);
      if (!modPath) { logger.warn({ module: mod.name }, "Module entry point not found, skipping"); continue; }
      const modUrl = pathToFileURL(modPath).href;
      const { default: init } = await import(modUrl) as { default: (app: Express) => void | Promise<void>; };
      if (typeof init !== "function") { logger.warn({ module: mod.name }, "Module does not export initModule function"); continue; }
      await init(app);
      logger.info({ module: mod.name }, "Module loaded successfully");
    } catch (err) { logger.error({ module: mod.name, err }, "Failed to load module"); }
  }
  events.on("report.created", async (data) => { logger.info({ ...data }, "Core: report.created"); });
  events.on("panic_alert.created", async (data) => { logger.info({ ...data }, "Core: panic_alert.created"); });
  events.on("user.registered", async (data) => { logger.info({ ...data }, "Core: user.registered"); });
  logger.info({ enabledCount: enabledModules.length }, "Module loading complete");
}
