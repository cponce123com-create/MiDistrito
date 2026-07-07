import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app: Express = express();

// Trust proxy headers for rate-limit behind reverse proxy
app.set("trust proxy", 1);

// Security headers
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS
const corsOrigin = process.env.CORS_ORIGIN?.split(",") || [
  "http://localhost:5173",
  "http://localhost:3000",
];
app.use(cors({ origin: corsOrigin, credentials: true }));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(pinoHttp({ level: process.env.LOG_LEVEL || "info" }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ── Health check ───────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Core routes (auth, users, districts, RENIEC, swagger) ─────────────────
import coreRouter from "./routes/index";
app.use("/api", coreRouter);

// ── Module loader (se ejecuta después de export, en index.ts) ─────────────
export default app;
