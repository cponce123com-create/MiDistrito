/**
 * News Module — Index
 * Monta todas las rutas del módulo bajo /api/news.
 */
import type { Express, Router } from "express";
import { Router as createRouter } from "express";

import articlesRouter from "./routes/articles";
import sourcesRouter from "./routes/sources";
import categoriesRouter from "./routes/categories";
import channelsRouter from "./routes/channels";
import approvalRouter from "./routes/approval";
import statsRouter from "./routes/stats";
import { events } from "@midistrito/core";
import { startScraperCron, stopScraperCron } from "./routes/scraper";

const router: Router = createRouter();

router.get("/health", (_req, res) => {
  res.json({ module: "news", status: "ok", timestamp: new Date().toISOString() });
});

router.use("/articles", articlesRouter);
router.use("/sources", sourcesRouter);
router.use("/categories", categoriesRouter);
router.use("/channels", channelsRouter);
router.use("/approval", approvalRouter);
router.use("/stats", statsRouter);

export default function initModule(app: Express): void {
  app.use("/api/news", router);
  console.log("[news] Module initialized at /api/news");

  // Iniciar scraper cron si está habilitado
  if (process.env.NEWS_SCRAPER_ENABLED === "true") {
    startScraperCron();
    console.log("[news] Scraper cron started");
  }
}

// ── Event handlers ──────────────────────────────────────────────────────────
events.on("news.article.created", async (data) => {
  console.log("[news] Article created:", data);
});

events.on("news.article.approved", async (data) => {
  console.log("[news] Article approved:", data);
});

events.on("news.article.published", async (data) => {
  console.log("[news] Article published:", data);
});
