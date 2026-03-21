import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { predictions } = await req.json();

    const participant = await prisma.participant.findFirst({
      where: { userId: (session.user as any).id },
    });

    if (!participant) {
      return NextResponse.json({ message: "No eres un participante activo" }, { status: 403 });
    }

    const updates = [];
    for (const [matchId, scores] of Object.entries(predictions) as any) {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match) continue;

      if (new Date() > new Date(match.lockTime)) {
        continue;
      }

      // Buscar si ya existe el pronóstico para este participante y partido
      const existing = await prisma.prediction.findFirst({
        where: {
          participantId: participant.id,
          matchId: matchId,
        },
      });

      let prediction;
      if (existing) {
        prediction = await prisma.prediction.update({
          where: { id: existing.id },
          data: {
            localPred: scores.local,
            visitorPred: scores.visitor,
            updatedAt: new Date(),
          },
        });
      } else {
        prediction = await prisma.prediction.create({
          data: {
            participantId: participant.id,
            matchId: matchId,
            localPred: scores.local,
            visitorPred: scores.visitor,
          },
        });
      }
      updates.push(prediction);
    }

    return NextResponse.json({ message: "Pronósticos actualizados", count: updates.length });
  } catch (error) {
    console.error("Error al guardar pronósticos:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
