import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Trophy, Target, ShieldCheck, Download, Calendar } from "lucide-react";
import { PdfButton } from "@/components/PdfButton";

export const dynamic = 'force-dynamic';
export default async function ParticipantProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;

  const participant = await prisma.participant.findUnique({
    where: { id },
    include: {
      user: { select: { name: true } },
      tournament: true,
      predictions: {
        include: {
          match: {
            include: {
              localTeam: true,
              visitorTeam: true,
            },
          },
        },
        orderBy: { match: { dateTime: "asc" } },
      },
    },
  });

  if (!participant) {
    notFound();
  }

  const formattedPredictions = participant.predictions.map((p) => ({
    match: {
      localTeam: { name: p.match.localTeam.name },
      visitorTeam: { name: p.match.visitorTeam.name },
      dateTime: p.match.dateTime.toISOString(),
    },
    localPred: p.localPred,
    visitorPred: p.visitorPred,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-12">
        <div className="bg-blue-600 p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
              {participant.user.name}
            </h1>
            <p className="text-blue-100 text-lg md:text-xl font-medium">
              {participant.tournament.name} • #{participant.rank || "-"} en el Ranking
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end space-y-4">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl text-center min-w-[120px]">
              <p className="text-4xl md:text-5xl font-black">{participant.totalPoints}</p>
              <p className="text-xs md:text-sm font-bold uppercase tracking-widest mt-1 opacity-80">Puntos</p>
            </div>
            <PdfButton
              participantName={participant.user.name}
              tournamentName={participant.tournament.name}
              predictions={formattedPredictions}
            />
          </div>
        </div>

        <div className="p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
            <Target className="h-6 w-6 text-blue-600" />
            <span>Pronósticos Realizados</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {participant.predictions.length === 0 ? (
              <p className="col-span-full py-12 text-center text-gray-500 italic">
                Este participante aún no ha realizado pronósticos.
              </p>
            ) : (
              participant.predictions.map((p) => {
                const isLocked = new Date() > new Date(p.match.lockTime);
                const isFinished = p.match.status === "FINISHED";

                return (
                  <div
                    key={p.id}
                    className={`p-6 rounded-2xl border ${
                      isFinished
                        ? p.points > 0
                          ? "bg-green-50 border-green-100"
                          : "bg-gray-50 border-gray-100 opacity-80"
                        : "bg-white border-gray-100 shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-right flex-1">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="font-bold text-gray-900">{p.match.localTeam.name}</span>
                          <span className="text-2xl">{p.match.localTeam.flagUrl}</span>
                        </div>
                      </div>

                      <div className="px-6">
                        {isLocked || isFinished ? (
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl font-black text-gray-900">{p.localPred}</span>
                            <span className="text-gray-400 font-bold">-</span>
                            <span className="text-2xl font-black text-gray-900">{p.visitorPred}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-blue-500 italic">Oculto</span>
                        )}
                      </div>

                      <div className="text-left flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{p.match.visitorTeam.flagUrl}</span>
                          <span className="font-bold text-gray-900">{p.match.visitorTeam.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(p.match.dateTime).toLocaleDateString()}</span>
                      </div>

                      {isFinished && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 font-bold uppercase">Resultado:</span>
                          <span className="font-bold text-gray-900">
                            {p.match.localGoals} - {p.match.visitorGoals}
                          </span>
                          <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold ${
                            p.points === 5 ? "bg-green-200 text-green-800" :
                            p.points === 3 ? "bg-blue-200 text-blue-800" :
                            "bg-gray-200 text-gray-800"
                          }`}>
                            +{p.points} pts
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
