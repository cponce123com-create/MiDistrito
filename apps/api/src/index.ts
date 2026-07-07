import app from "./app";
import { pool } from "@midistrito/db";
import { loadModules } from "./core/moduleLoader";

const rawPort = process.env["PORT"];
if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// ── Error handlers ─────────────────────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// ── Graceful shutdown ──────────────────────────────────────────────────────
let shuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log({ signal }, "Shutdown signal received");
  try {
    server.close(() => console.log("HTTP server closed"));
    await pool.end();
    console.log("Database pool closed");
  } catch (err) {
    console.error("Error during shutdown:", err);
  }
  setTimeout(() => process.exit(0), 10000).unref();
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ── Start server ───────────────────────────────────────────────────────────
const server = app.listen(port, async () => {
  console.log({ port }, "Server listening");

  // Cargar módulos habilitados después de que el servidor esté escuchando
  try {
    await loadModules(app);
    console.log({}, "All modules loaded");
  } catch (err) {
    console.error({ err }, "Module loading encountered errors (server continues)");
  }

  // 404 + error handlers (después de los módulos)
  app.use("/api", (req, res, next) => {
    if (req.path === "/api" || req.path.startsWith("/api/")) {
      res.status(404).json({ error: "Endpoint no encontrado." });
      return;
    }
    next();
  });
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Error interno del servidor." });
  });
});

export { app, server };
