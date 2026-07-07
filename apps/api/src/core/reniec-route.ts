/**
 * reniec-route.ts — Endpoint protegido de consulta RENIEC.
 * Requiere: auth + rol backoffice + rate limit dedicado.
 */
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireBackoffice } from "./auth";
import { consultarDni } from "./reniec";
import { logger } from "../lib/logger";

const router = Router();

// Rate limit estricto para RENIEC: 10 consultas por minuto
const reniecLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Demasiadas consultas RENIEC. Intenta de nuevo en un minuto." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/reniec/:dni", requireAuth, requireBackoffice, reniecLimiter, async (req, res) => {
  try {
    const dni = req.params.dni as string;
    const userId = parseInt((req as any).jwtUser?.sub);

    const result = await consultarDni(dni, userId);
    return res.json(result);
  } catch (err: any) {
    logger.error({ err, dni: req.params.dni }, "RENIEC consultation failed");
    return res.status(500).json({ error: err.message || "Error al consultar RENIEC." });
  }
});

export default router;
