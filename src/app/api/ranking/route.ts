import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const participants = await prisma.participant.findMany({
    where: { tournament: { status: 'ACTIVE' }, paymentStatus: 'APPROVED' },
    include: {
      user: { select: { name: true } },
      _count: {
        select: {
          predictions: {
            where: { correctScore: true },
          },
        },
      },
    },
    orderBy: [{ totalPoints: 'desc' }, { rank: 'asc' }],
  });

  const matchesCount = await prisma.match.count({
    where: {
      tournament: { status: 'ACTIVE' },
      status: 'IN_PLAY',
    },
  });

  return NextResponse.json({ participants, hasLiveMatches: matchesCount > 0 });
}
