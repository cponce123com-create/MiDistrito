import { prisma } from "./prisma";

/**
 * Calculates points for a single prediction based on the real match result.
 */
export function calculatePoints(
  predLocal: number,
  predVisitor: number,
  realLocal: number,
  realVisitor: number
) {
  // Case 1: Exact score
  if (predLocal === realLocal && predVisitor === realVisitor) {
    return {
      points: 5,
      correctWinner: true,
      correctScore: true,
    };
  }

  // Case 2: Correct winner or draw (but not exact)
  const realWinner = realLocal > realVisitor ? "local" : realLocal < realVisitor ? "visitor" : "draw";
  const predWinner = predLocal > predVisitor ? "local" : predLocal < predVisitor ? "visitor" : "draw";

  if (realWinner === predWinner) {
    return {
      points: 3,
      correctWinner: true,
      correctScore: false,
    };
  }

  // Case 3: Wrong prediction
  return {
    points: 0,
    correctWinner: false,
    correctScore: false,
  };
}

/**
 * Recalculates points for all predictions of a given match.
 */
export async function updateMatchPredictions(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });

  if (!match || match.localGoals === null || match.visitorGoals === null) {
    throw new Error("Match not found or result not entered");
  }

  const predictions = await prisma.prediction.findMany({
    where: { matchId },
  });

  const updates = predictions.map((pred) => {
    const { points, correctWinner, correctScore } = calculatePoints(
      pred.localPred,
      pred.visitorPred,
      match.localGoals!,
      match.visitorGoals!
    );

    return prisma.prediction.update({
      where: { id: pred.id },
      data: {
        points,
        correctWinner,
        correctScore,
      },
    });
  });

  await prisma.$transaction(updates);

  // After updating predictions, update participant totals
  await updateTournamentRankings(match.tournamentId);
}

/**
 * Updates total points and rankings for all participants in a tournament.
 */
export async function updateTournamentRankings(tournamentId: string) {
  const participants = await prisma.participant.findMany({
    where: { tournamentId },
    include: {
      predictions: {
        select: { points: true },
      },
    },
  });

  const updatedParticipants = participants.map((p) => {
    const totalPoints = p.predictions.reduce((acc, pred) => acc + pred.points, 0);
    return {
      id: p.id,
      totalPoints,
    };
  });

  // Bulk update total points
  for (const p of updatedParticipants) {
    await prisma.participant.update({
      where: { id: p.id },
      data: { totalPoints: p.totalPoints },
    });
  }

  // Calculate and update rankings
  const allParticipants = await prisma.participant.findMany({
    where: { tournamentId },
    orderBy: [
      { totalPoints: "desc" },
      { predictions: { _count: "desc" } }, // Tie-break 1 (more predictions) - can be refined
    ],
  });

  const rankingUpdates = allParticipants.map((p, index) => {
    return prisma.participant.update({
      where: { id: p.id },
      data: { rank: index + 1 },
    });
  });

  await prisma.$transaction(rankingUpdates);
}
