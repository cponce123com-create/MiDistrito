import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, captureUrl } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "Falta userId" }, { status: 400 });
    }

    // Find the participant for this user (most recent one without a payment)
    const participant = await prisma.participant.findFirst({
      where: {
        userId,
        paymentStatus: "PENDING",
      },
      include: { tournament: true },
      orderBy: { createdAt: "desc" },
    });

    if (!participant) {
      return NextResponse.json({ message: "No se encontró un participante pendiente" }, { status: 404 });
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        participantId: participant.id,
        amount: participant.tournament.entryFee,
        method: "YAPE",
        reference: captureUrl || null,
        status: "PENDING",
        captureUrl: captureUrl || null,
      },
    });

    return NextResponse.json({ message: "Pago registrado correctamente" }, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
