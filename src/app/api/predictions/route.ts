import { NextResponse } from "next/server";
import { db } from "@/db";
import { predictions, matches } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { matchId, homeScore, awayScore } = body;

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json({ message: "Faltan campos" }, { status: 400 });
    }

    const [match] = await db.select().from(matches).where(eq(matches.id, matchId)).limit(1);
    if (!match) {
      return NextResponse.json({ message: "Partido no encontrado" }, { status: 404 });
    }

    const lockTime = new Date(match.matchDate.getTime() - 5 * 60 * 1000);
    if (new Date() > lockTime) {
      return NextResponse.json({ message: "El partido ya comenzó o está cerrado para pronósticos" }, { status: 403 });
    }

    if (match.status === "finished") {
      return NextResponse.json({ message: "El partido ya finalizó" }, { status: 403 });
    }

    const existing = await db
      .select()
      .from(predictions)
      .where(and(eq(predictions.userId, session.user.id), eq(predictions.matchId, matchId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(predictions)
        .set({ homeScore, awayScore })
        .where(eq(predictions.id, existing[0].id));
    } else {
      await db.insert(predictions).values({
        userId: session.user.id,
        matchId,
        homeScore,
        awayScore,
      });
    }

    return NextResponse.json({ message: "Pronóstico guardado" });
  } catch (error) {
    console.error("Error saving prediction:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("matchId");

    if (matchId) {
      const [prediction] = await db
        .select()
        .from(predictions)
        .where(and(eq(predictions.userId, session.user.id), eq(predictions.matchId, matchId)))
        .limit(1);
      return NextResponse.json(prediction || null);
    }

    const allPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.userId, session.user.id));

    return NextResponse.json(allPredictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
