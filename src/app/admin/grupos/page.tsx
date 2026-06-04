import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminGruposPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard");

  const tournament = await prisma.tournament.findFirst({
    where: { status: "ACTIVE" },
    include: {
      matches: {
        where: {
          phase: { type: "GROUPS" },
          status: { in: ["FINISHED", "PROGRAMMED", "IN_PLAY"] },
        },
        include: { localTeam: true, visitorTeam: true },
      },
      participants: {
        include: {
          user: { select: { name: true } },
          predictions: {
            where: {
              match: { phase: { type: "GROUPS" } },
            },
            select: { points: true, correctWinner: true, correctScore: true },
          },
        },
      },
    },
  });

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-500">No hay torneo activo</h2>
      </div>
    );
  }

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  const teamMap = new Map(teams.map(t => [t.id, t]));

  const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"];

  // Build team-per-group mapping from matches (Team model has no 'group' field)
  const teamsByGroup: Record<string, Set<string>> = {};
  for (const match of tournament.matches) {
    if (!match.group) continue;
    if (!teamsByGroup[match.group]) teamsByGroup[match.group] = new Set();
    teamsByGroup[match.group].add(match.localTeamId);
    teamsByGroup[match.group].add(match.visitorTeamId);
  }

  // Calculate standings for each group
  const groupStandings: Record<string, any[]> = {};

  for (const group of groups) {
    const groupTeamIds = teamsByGroup[group];
    if (!groupTeamIds || groupTeamIds.size === 0) continue;

    const groupTeams = Array.from(groupTeamIds).map(id => teamMap.get(id)).filter(Boolean);
    const groupMatches = tournament.matches.filter(m => m.group === group);

    const standings = groupTeams.map(team => {
      const teamMatches = groupMatches.filter(
        m => m.localTeamId === team!.id || m.visitorTeamId === team!.id
      );

      let pts = 0, w = 0, d = 0, l = 0, gf = 0, ga = 0;

      for (const m of teamMatches) {
        if (m.status !== "FINISHED" || m.localGoals === null || m.visitorGoals === null) continue;
        const isLocal = m.localTeamId === team!.id;
        const tGoals = isLocal ? m.localGoals : m.visitorGoals;
        const oGoals = isLocal ? m.visitorGoals : m.localGoals;
        gf += tGoals;
        ga += oGoals;
        if (tGoals > oGoals) { pts += 3; w++; }
        else if (tGoals === oGoals) { pts += 1; d++; }
        else { l++; }
      }

      return { team, pts, w, d, l, gf, ga, gd: gf - ga, played: w + d + l };
    });

    // Sort: points, GD, goals scored
    standings.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    groupStandings[group] = standings;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tabla de Posiciones por Grupo</h1>
        <p className="text-gray-600">{tournament.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => {
          const standings = groupStandings[group];
          if (!standings) {
            return (
              <div key={group} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-3 font-bold text-lg">Grupo {group}</div>
                <div className="px-6 py-3 text-center text-xs text-gray-400 italic">Sin partidos asignados</div>
              </div>
            );
          }
          const hasResults = standings.some(s => s.played > 0);

          return (
            <div key={group} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-3 font-bold text-lg">
                Grupo {group}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                      <th className="px-2 py-2 text-left">#</th>
                      <th className="px-2 py-2 text-left">Equipo</th>
                      <th className="px-2 py-2 text-center">PJ</th>
                      <th className="px-2 py-2 text-center">G</th>
                      <th className="px-2 py-2 text-center">E</th>
                      <th className="px-2 py-2 text-center">P</th>
                      <th className="px-2 py-2 text-center">GF</th>
                      <th className="px-2 py-2 text-center">GC</th>
                      <th className="px-2 py-2 text-center">DG</th>
                      <th className="px-2 py-2 text-center font-bold text-blue-600">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {standings.map((s, idx) => (
                      <tr key={s.team!.id} className={`hover:bg-gray-50 ${idx < 2 ? "bg-green-50/50" : ""}`}>
                        <td className="px-2 py-2 font-bold text-gray-500">{idx + 1}</td>
                        <td className="px-2 py-2">
                          <div className="flex items-center space-x-1.5">
                            <span>{s.team!.flagUrl}</span>
                            <span className="font-semibold truncate max-w-[80px]">{s.team!.shortName}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-center">{s.played}</td>
                        <td className="px-2 py-2 text-center text-green-600">{s.w}</td>
                        <td className="px-2 py-2 text-center text-yellow-600">{s.d}</td>
                        <td className="px-2 py-2 text-center text-red-600">{s.l}</td>
                        <td className="px-2 py-2 text-center font-medium">{s.gf}</td>
                        <td className="px-2 py-2 text-center font-medium">{s.ga}</td>
                        <td className={`px-2 py-2 text-center font-bold ${s.gd > 0 ? "text-green-600" : s.gd < 0 ? "text-red-600" : ""}`}>
                          {s.gd > 0 ? `+${s.gd}` : s.gd}
                        </td>
                        <td className="px-2 py-2 text-center font-extrabold text-blue-600">{s.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!hasResults && (
                <div className="px-6 py-3 text-center text-xs text-gray-400 italic border-t border-gray-50">
                  Sin resultados aún
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
