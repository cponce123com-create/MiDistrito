/**
 * favorites.ts — Favoritos del marketplace
 *
 * GET    /favorites         → listar favoritos del usuario
 * POST   /favorites/:productId → agregar/quitar favorito (toggle, requireAuth)
 */
import { Router, type IRouter } from "express";
import { db } from "@midistrito/db";
import { favoritesTable, productsTable } from "@midistrito/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../../../../apps/api/src/core/auth";

const router: IRouter = Router();

interface JwtUser {
  sub: string;
  email: string;
  role: string;
  districtId: number;
}

// ── GET /favorites — Listar favoritos del usuario ────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).jwtUser as JwtUser;
    const userId = parseInt(user.sub);

    const favorites = await db
      .select({
        id: favoritesTable.id,
        productId: favoritesTable.productId,
        createdAt: favoritesTable.createdAt,
        product: {
          id: productsTable.id,
          name: productsTable.name,
          price: productsTable.price,
          salePrice: productsTable.salePrice,
          imageUrl: productsTable.imageUrl,
          unit: productsTable.unit,
          status: productsTable.status,
        },
      })
      .from(favoritesTable)
      .innerJoin(productsTable, eq(favoritesTable.productId, productsTable.id))
      .where(eq(favoritesTable.userId, userId))
      .orderBy(desc(favoritesTable.createdAt));

    return res.json(favorites);
  } catch (err) {
    req.log.error({ err }, "Failed to list favorites");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── POST /favorites/:productId — Toggle favorito ─────────────────────────────
router.post("/:productId", requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    if (!Number.isFinite(productId)) {
      return res.status(400).json({ error: "ID de producto inválido." });
    }

    const user = (req as any).jwtUser as JwtUser;
    const userId = parseInt(user.sub);

    // Verificar que el producto existe
    const [product] = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    // Buscar si ya existe el favorito
    const [existing] = await db
      .select({ id: favoritesTable.id })
      .from(favoritesTable)
      .where(
        and(
          eq(favoritesTable.userId, userId),
          eq(favoritesTable.productId, productId),
        ),
      )
      .limit(1);

    if (existing) {
      // Quitar favorito
      await db
        .delete(favoritesTable)
        .where(eq(favoritesTable.id, existing.id));

      return res.json({ favorited: false, message: "Producto removido de favoritos." });
    }

    // Agregar favorito
    const [favorite] = await db
      .insert(favoritesTable)
      .values({ userId, productId } as any)
      .returning();

    return res.status(201).json({ favorited: true, favorite });
  } catch (err) {
    req.log.error({ err }, "Failed to toggle favorite");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
