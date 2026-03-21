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

      // Check if match is locked
      if (new Date() > new Date(match.lockTime)) {
        continue;
      }

      const prediction = await prisma.prediction.upsert({
        where: {
          id: `${participant.id}_${matchId}`, // Using a compound key logic if needed
          // Actually, let's use matchId and participantId unique constraint
        },
        update: {
          localPred: scores.local,
          visitorPred: scores.visitor,
          submittedAt: new Date(),
        },
        create: {
          id: `${participant.id}_${matchId}`,
          participantId: participant.id,
          matchId: matchId,
          localPred: scores.local,
          visitorPred: scores.visitor,
        },
      });
      updates.push(prediction);
    }

    return NextResponse.json({ message: "Pronósticos actualizados", count: updates.length });
  } catch (error) {
    console.error("Error al guardar pronósticos:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
