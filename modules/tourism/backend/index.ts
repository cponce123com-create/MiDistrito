import type { Express, Router } from "express";
import { Router as createRouter } from "express";
import attractionsRouter from "./routes/attractions";

const router: Router = createRouter();
router.get("/health", (_req, res) => {
  res.json({ module: "tourism", status: "ok", timestamp: new Date().toISOString() });
});
router.use("/attractions", attractionsRouter);

export default function initModule(app: Express): void {
  app.use("/api/tourism", router);
  console.log("[tourism] Module initialized at /api/tourism");
}
