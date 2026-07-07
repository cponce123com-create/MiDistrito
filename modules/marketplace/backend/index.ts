/**
 * Marketplace Module — Entry point
 * Monta todas las rutas del módulo bajo /api/marketplace.
 */
import type { Express, Router } from "express";
import { Router as createRouter } from "express";
import storesRouter from "./routes/stores";
import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";
import ordersRouter from "./routes/orders";
import favoritesRouter from "./routes/favorites";

const router: Router = createRouter();

router.get("/health", (_req, res) => {
  res.json({ module: "marketplace", status: "ok", timestamp: new Date().toISOString() });
});

router.use("/stores", storesRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/orders", ordersRouter);
router.use("/favorites", favoritesRouter);

export default function initModule(app: Express): void {
  app.use("/api/marketplace", router);
  console.log("[marketplace] Module initialized at /api/marketplace");
}
