import app from "./app";
import { pool } from "@midistrito/db";

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
    server.close(() => {
      console.log("HTTP server closed");
    });
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
const server = app.listen(port, () => {
  console.log({ port }, "Server listening");
});

export { app, server };
