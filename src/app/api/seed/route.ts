import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "status", "createdAt", "updatedAt")
      VALUES (
        'admin-001',
        'Administrador',
        'admin@polla.com',
        '${passwordHash}',
        'ADMIN',
        'ACTIVE',
        NOW(),
        NOW()
      )
      ON CONFLICT ("email") DO NOTHING;
    `);

    return NextResponse.json({ ok: true, message: "Admin creado. Email: admin@polla.com / Pass: admin123" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
