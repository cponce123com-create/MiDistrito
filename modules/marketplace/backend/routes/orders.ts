/**
 * orders.ts — Pedidos del marketplace
 *
 * GET    /orders           → listar pedidos (filtro por districtId)
 * POST   /orders           → crear pedido (requireAuth)
 * PATCH  /orders/:id/status → actualizar estado (requireAuth)
 */
import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import {
  ordersTable,
  orderItemsTable,
  productsTable,
  storesTable,
} from "@midistrito/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../../../../apps/api/src/core/auth";

const router: IRouter = Router();

interface JwtUser {
  sub: string;
  email: string;
  role: string;
  districtId: number;
}

function getDistrictId(req: any): number | null {
  const jwtUser = req.jwtUser as JwtUser | undefined;
  if (jwtUser?.districtId && jwtUser.role !== "super_admin") {
    return Number(jwtUser.districtId);
  }
  const q = req.query?.districtId ?? req.body?.districtId;
  if (q != null) return Number(q);
  return null;
}

const createOrderItemSchema = z.object({
  productId: z.number().positive(),
  quantity: z.number().int().positive("Cantidad debe ser positiva"),
});

const createOrderSchema = z.object({
  storeId: z.number().positive("Tienda requerida"),
  districtId: z.number().positive("Distrito requerido"),
  notes: z.string().max(500).optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  deliveryAddress: z.string().optional().nullable(),
  items: z.array(createOrderItemSchema).min(1, "Debe tener al menos un producto"),
});

const statusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]),
});

// ── GET /orders — Listar pedidos ─────────────────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = (req as any).jwtUser as JwtUser;
    const userId = parseInt(user.sub);
    const districtId = getDistrictId(req);

    const conditions: any[] = [];

    if (user.role === "super_admin") {
      // super_admin puede ver todos si no hay filtro
      if (districtId) conditions.push(eq(ordersTable.districtId, districtId));
    } else {
      // Usuario normal ve sus propios pedidos como comprador
      conditions.push(eq(ordersTable.buyerId, userId));
      if (districtId) conditions.push(eq(ordersTable.districtId, districtId));
    }

    const orders = await db
      .select()
      .from(ordersTable)
      .where(and(...conditions))
      .orderBy(desc(ordersTable.createdAt));

    // Cargar items para cada pedido
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));
        return { ...order, items };
      }),
    );

    return res.json(ordersWithItems);
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── POST /orders — Crear pedido ──────────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const user = (req as any).jwtUser as JwtUser;
    const buyerId = parseInt(user.sub);

    // Calcular total
    let total = 0;
    const orderItems: Array<{
      productId: number;
      quantity: number;
      unitPrice: string;
      subtotal: string;
    }> = [];

    for (const item of parsed.data.items) {
      const [product] = await db
        .select({ price: productsTable.price })
        .from(productsTable)
        .where(eq(productsTable.id, item.productId))
        .limit(1);

      if (!product) {
        return res.status(404).json({ error: `Producto ${item.productId} no encontrado.` });
      }

      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;
      total += subtotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: String(unitPrice),
        subtotal: String(subtotal),
      });
    }

    const [order] = await db
      .insert(ordersTable)
      .values({
        storeId: parsed.data.storeId,
        buyerId,
        districtId: parsed.data.districtId,
        total: String(total),
        notes: parsed.data.notes ?? null,
        contactPhone: parsed.data.contactPhone ?? null,
        contactName: parsed.data.contactName ?? null,
        deliveryAddress: parsed.data.deliveryAddress ?? null,
      } as any)
      .returning();

    // Insertar items
    await db
      .insert(orderItemsTable)
      .values(
        orderItems.map((item) => ({
          ...item,
          orderId: order.id,
        })),
      );

    // Devolver el pedido completo
    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, order.id));

    return res.status(201).json({ ...order, items });
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

// ── PATCH /orders/:id/status — Actualizar estado ────────────────────────────
router.patch("/:id/status", requireAuth, async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join("; ") });
  }

  try {
    const orderId = parseInt(req.params.id);
    if (!Number.isFinite(orderId)) {
      return res.status(400).json({ error: "ID de pedido inválido." });
    }

    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado." });
    }

    const user = (req as any).jwtUser as JwtUser;
    const userId = parseInt(user.sub);

    // Solo el comprador o el dueño de la tienda (o admin) puede actualizar estado
    const [store] = await db
      .select({ userId: storesTable.userId })
      .from(storesTable)
      .where(eq(storesTable.id, order.storeId))
      .limit(1);

    const isBuyer = order.buyerId === userId;
    const isStoreOwner = store?.userId === userId;
    const isAdmin = ["admin", "moderator", "super_admin"].includes(user.role);

    if (!isBuyer && !isStoreOwner && !isAdmin) {
      return res.status(403).json({ error: "No tienes permiso para actualizar este pedido." });
    }

    const [updated] = await db
      .update(ordersTable)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(ordersTable.id, orderId))
      .returning();

    return res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update order status");
    return res.status(500).json({ error: "Error interno del servidor." });
  }
});

export default router;
