import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches, predictions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { calculatePoints } from "@/lib/scoring";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { homeScore, awayScore } = await req.json();

    if (homeScore === undefined || awayScore === undefined) {
      return NextResponse.json({ message: "Faltan resultados" }, { status: 400 });
    }

    await db
      .update(matches)
      .set({ homeScore, awayScore, status: "finished" })
      .where(eq(matches.id, id));

    const matchPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.matchId, id));

    for (const pred of matchPredictions) {
      const points = calculatePoints(pred.homeScore, pred.awayScore, homeScore, awayScore);
      await db
        .update(predictions)
        .set({ points })
        .where(eq(predictions.id, pred.id));
    }

    return NextResponse.json({
      message: "Resultado actualizado",
      predictionsUpdated: matchPredictions.length,
    });
  } catch (error) {
    console.error("Error updating match result:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
