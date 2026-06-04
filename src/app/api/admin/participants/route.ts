import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const tournament = await prisma.tournament.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!tournament) {
      return NextResponse.json([], { status: 200 });
    }

    const participants = await prisma.participant.findMany({
      where: { tournamentId: tournament.id },
      include: {
        user: { select: { name: true, email: true } },
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { totalPoints: "desc" },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { participantId, paymentStatus } = await req.json();

    if (!participantId || !paymentStatus) {
      return NextResponse.json({ message: "Faltan campos" }, { status: 400 });
    }

    const participant = await prisma.participant.update({
      where: { id: participantId },
      data: {
        paymentStatus,
        paymentDate: paymentStatus === "APPROVED" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ message: "Estado actualizado", participant });
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
