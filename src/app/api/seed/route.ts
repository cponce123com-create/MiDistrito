import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const passwordHash = await bcrypt.hash("admin123", 10);

    await prisma.user.upsert({
      where: { email: "admin@polla.com" },
      update: {},
      create: {
        email: "admin@polla.com",
        name: "Administrador",
        passwordHash,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ ok: true, message: "Admin creado. Email: admin@polla.com / Pass: admin123" });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
