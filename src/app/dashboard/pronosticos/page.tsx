import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PredictionForm } from "@/components/PredictionForm";

export default async function PronosticosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const participant = await prisma.participant.findFirst({
    where: { userId: (session.user as any).id },
    include: {
      tournament: true,
      predictions: true,
    },
  });

  if (!participant) {
    redirect("/dashboard");
  }

  const matches = await prisma.match.findMany({
    where: { tournamentId: participant.tournamentId },
    include: {
      localTeam: true,
      visitorTeam: true,
      predictions: {
        where: { participantId: participant.id },
      },
    },
    orderBy: { dateTime: "asc" },
  });

  const formattedMatches = matches.map((m) => ({
    id: m.id,
    localTeam: { name: m.localTeam.name, flagUrl: m.localTeam.flagUrl },
    visitorTeam: { name: m.visitorTeam.name, flagUrl: m.visitorTeam.flagUrl },
    dateTime: m.dateTime,
    lockTime: m.lockTime,
    prediction: m.predictions[0]
      ? { localPred: m.predictions[0].localPred, visitorPred: m.predictions[0].visitorPred }
      : undefined,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Pronósticos</h1>
        <p className="text-gray-600">Completa tus predicciones para el torneo.</p>
      </div>

      <PredictionForm matches={formattedMatches} />
    </div>
  );
}
