import { Router } from "express";

const router = Router();

// GET /api-docs — Placeholder para Swagger UI (se implementará en Fase 1)
router.get("/api-docs", (_req, res) => {
  res.json({
    message: "Swagger UI disponible en Fase 1. Mientras tanto, consulta docs/ARCHITECTURE.md",
    spec: "/api-docs.json",
  });
});

router.get("/api-docs.json", (_req, res) => {
  res.json({
    openapi: "3.0.0",
    info: { title: "MiDistrito API", version: "0.1.0" },
    servers: [{ url: "/api" }],
  });
});

export default router;
