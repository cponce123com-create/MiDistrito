import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return NextResponse.json({ message: "El correo ya está registrado" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({ name, email, password: hashed })
      .returning();

    return NextResponse.json({ message: "Usuario creado", userId: user.id }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
