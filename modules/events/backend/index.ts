import type { Express, Router } from "express";
import { Router as createRouter } from "express";
import eventsRouter from "./routes/events";

const router: Router = createRouter();
router.get("/health", (_req, res) => {
  res.json({ module: "events", status: "ok", timestamp: new Date().toISOString() });
});
router.use("/calendar", eventsRouter);

export default function initModule(app: Express): void {
  app.use("/api/events", router);
  console.log("[events] Module initialized at /api/events");
}
