/**
 * seed.ts — Seed IDEMPOTENTE para MiDistrito.
 *
 * Crea:
 * 1. Distrito San Ramón (Chanchamayo, Junín)
 * 2. Super admin inicial
 *
 * Uso: pnpm seed
 * Requiere envs: DATABASE_URL, SEED_SUPER_ADMIN_EMAIL, SEED_SUPER_ADMIN_PASSWORD
 */
import { db, pool } from "@midistrito/db";
import { districtsTable, usersTable } from "@midistrito/db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  const adminEmail = process.env.SEED_SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_SUPER_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("❌ SEED_SUPER_ADMIN_EMAIL y SEED_SUPER_ADMIN_PASSWORD son requeridos.");
    process.exit(1);
  }

  // 1. Crear distrito San Ramón (idempotente)
  const [existingDistrict] = await db.select()
    .from(districtsTable)
    .where(eq(districtsTable.slug, "san-ramon"))
    .limit(1);

  let districtId: number;
  if (existingDistrict) {
    districtId = existingDistrict.id;
    console.log(`ℹ️  Distrito San Ramón ya existe (id=${districtId})`);
  } else {
    const [district] = await db.insert(districtsTable).values({
      slug: "san-ramon",
      name: "San Ramón",
      province: "Chanchamayo",
      department: "Junín",
      centerLat: -10.965,
      centerLng: -75.322,
      defaultZoom: 14,
      isActive: true,
    }).returning();
    districtId = district.id;
    console.log(`✅ Distrito San Ramón creado (id=${districtId})`);
  }

  // 2. Crear super admin (idempotente)
  const [existingAdmin] = await db.select()
    .from(usersTable)
    .where(eq(usersTable.email, adminEmail.toLowerCase().trim()))
    .limit(1);

  if (existingAdmin) {
    console.log(`ℹ️  Super admin ${adminEmail} ya existe (id=${existingAdmin.id})`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const [admin] = await db.insert(usersTable).values({
      email: adminEmail.toLowerCase().trim(),
      passwordHash,
      name: "Super Admin",
      firstName: "Super",
      lastName: "Admin",
      role: "super_admin",
      districtId,
      isActive: true,
    } as any).returning();
    console.log(`✅ Super admin creado (id=${admin.id}, email=${adminEmail})`);
  }

  console.log("✅ Seed completado.");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed falló:", err);
  process.exit(1);
});
