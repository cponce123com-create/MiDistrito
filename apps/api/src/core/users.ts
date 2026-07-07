import { Router, type IRouter } from "express";
import { z } from "zod";
import { db } from "@midistrito/db";
import { usersTable, notificationsTable, auditLogsTable } from "@midistrito/db/schema";
import { desc, eq, and, sql, count } from "drizzle-orm";
import { requireAuth } from "./auth";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

// ── Helpers ────────────────────────────────────────────────────────────────

function requireAdmin(req: any, res: any, next: any) {
  if (req.jwtUser?.role !== "admin" && req.jwtUser?.role !== "super_admin") {
    return res.status(403).json({ error: "Se requieren permisos de administrador." });
  }
  next();
}

// GET /users — Listar usuarios (admin)
router.get("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await db.select().from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(200);
    return res.json(users.map(({ passwordHash: _, ...u }) => u));
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener usuarios." });
  }
});

// GET /users/:id — Obtener usuario por ID
router.get("/users/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [user] = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
    const { passwordHash: _, ...publicUser } = user;
    return res.json(publicUser);
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener usuario." });
  }
});

// PATCH /users/:id — Actualizar usuario
router.patch("/users/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, phone, dni, sector } = req.body;
    const [updated] = await db.update(usersTable)
      .set({
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(dni !== undefined && { dni }),
        ...(sector !== undefined && { sector }),
        updatedAt: new Date().toISOString() as any,
      })
      .where(eq(usersTable.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Usuario no encontrado." });
    const { passwordHash: _, ...publicUser } = updated;
    return res.json(publicUser);
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar usuario." });
  }
});

// GET /users/:id/stats — Estadísticas de un usuario
router.get("/users/:id/stats", requireAuth, async (req, res) => {
  try {
    const targetId = Number(req.params.id);
    const [user] = await db.select({ name: usersTable.name, role: usersTable.role })
      .from(usersTable).where(eq(usersTable.id, targetId)).limit(1);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado." });
    return res.json({ userId: targetId, ...user });
  } catch (err) {
    return res.status(500).json({ error: "Error al obtener estadísticas." });
  }
});

export default router;
