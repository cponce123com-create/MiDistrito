import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, Trophy, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminPartidosPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard");

  const tournament = await prisma.tournament.findFirst({
    where: { status: "ACTIVE" },
    include: {
      phases: { orderBy: { order: "asc" } },
      matches: {
        include: {
          phase: true,
          localTeam: true,
          visitorTeam: true,
        },
        orderBy: { dateTime: "asc" },
      },
    },
  });

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">No hay torneo activo</h2>
          <p className="text-gray-500">Ejecuta el seed para crear el Mundial 2026.</p>
        </div>
      </div>
    );
  }

  // Group matches by phase
  const matchesByPhase = tournament.phases.map(phase => ({
    phase,
    matches: tournament.matches.filter(m => m.phaseId === phase.id),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Partidos</h1>
          <p className="text-gray-600">{tournament.name} — {tournament.matches.length} partidos totales</p>
        </div>
      </div>

      <div className="space-y-8">
        {matchesByPhase.map(({ phase, matches }) => (
          <div key={phase.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900">{phase.name}</h2>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                {matches.length} partidos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-sm text-gray-500">
                    <th className="px-6 py-3 font-medium">Fecha</th>
                    <th className="px-6 py-3 font-medium">Local</th>
                    <th className="px-6 py-3 font-medium text-center">Resultado</th>
                    <th className="px-6 py-3 font-medium">Visitante</th>
                    <th className="px-6 py-3 font-medium">Estadio</th>
                    <th className="px-6 py-3 font-medium">Estado</th>
                    <th className="px-6 py-3 font-medium">Grupo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {matches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">
                        No hay partidos en esta fase.
                      </td>
                    </tr>
                  ) : (
                    matches.map((match) => (
                      <tr key={match.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(match.dateTime).toLocaleDateString("es-PE", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{match.localTeam.flagUrl}</span>
                            <span className="font-medium">{match.localTeam.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {match.status === "FINISHED" ? (
                            <span className="font-bold text-lg">
                              {match.localGoals} - {match.visitorGoals}
                            </span>
                          ) : match.status === "IN_PLAY" ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                              En vivo
                            </span>
                          ) : (
                            <span className="text-gray-300">vs</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{match.visitorTeam.name}</span>
                            <span className="text-xl">{match.visitorTeam.flagUrl}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{match.stadium || "-"}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            match.status === "FINISHED" ? "bg-green-100 text-green-700" :
                            match.status === "IN_PLAY" ? "bg-red-100 text-red-700" :
                            match.status === "CLOSED" ? "bg-yellow-100 text-yellow-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {match.status === "PROGRAMMED" ? "Programado" :
                             match.status === "IN_PLAY" ? "En vivo" :
                             match.status === "FINISHED" ? "Finalizado" :
                             match.status === "CLOSED" ? "Cerrado" : match.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {match.group || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
