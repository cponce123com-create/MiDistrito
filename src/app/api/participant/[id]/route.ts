import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
        predictions: {
          include: {
            match: {
              include: { localTeam: true, visitorTeam: true },
            },
          },
          orderBy: { match: { dateTime: 'asc' } },
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ message: 'Participante no encontrado' }, { status: 404 });
    }

    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error fetching participant:', error);
    return NextResponse.json({ message: 'Error interno' }, { status: 500 });
  }
}
