import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const tournament = await prisma.tournament.findFirst({
    where: { status: 'ACTIVE' },
    include: {
      matches: { orderBy: { dateTime: 'asc' }, take: 1 },
      _count: { select: { participants: true } },
    },
  });

  if (!tournament) {
    return NextResponse.json({ isClosed: true, totalPot: 0 });
  }

  const firstMatch = tournament.matches[0];
  const isClosed = firstMatch ? new Date(firstMatch.dateTime) <= new Date() : false;
  const totalPot = tournament.entryFee * tournament._count.participants;
  const firstPrize = (totalPot * tournament.prizeFirstPct) / 100;
  const secondPrize = (totalPot * tournament.prizeSecondPct) / 100;
  const thirdPrize = (totalPot * tournament.prizeCharityPct) / 100;

  return NextResponse.json({
    firstMatchDate: firstMatch?.dateTime || null,
    isClosed,
    totalPot,
    entryFee: tournament.entryFee,
    totalTickets: tournament._count.participants,
    prizes: {
      first: firstPrize,
      second: secondPrize,
      third: thirdPrize,
    },
    prizeFirstPct: tournament.prizeFirstPct,
    prizeSecondPct: tournament.prizeSecondPct,
    prizeCharityPct: tournament.prizeCharityPct,
  });
}
