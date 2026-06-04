import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Shield, Plus, Trash2, Edit3 } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminEquiposPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard");

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  // Group teams by group letter
  const teamsByGroup: Record<string, typeof teams> = {};
  for (const team of teams) {
    const g = team.group || "Sin grupo";
    if (!teamsByGroup[g]) teamsByGroup[g] = [];
    teamsByGroup[g].push(team);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipos</h1>
          <p className="text-gray-600">Administra los 48 equipos del Mundial 2026.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(teamsByGroup).sort(([a], [b]) => a.localeCompare(b)).map(([group, groupTeams]) => (
          <div key={group} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-3 font-bold text-lg flex items-center justify-between">
              <span>Grupo {group}</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">{groupTeams.length} equipos</span>
            </div>
            <div className="divide-y divide-gray-50">
              {groupTeams.map((team, idx) => (
                <div key={team.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{team.flagUrl}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{team.name}</p>
                      <p className="text-xs text-gray-500">{team.shortName}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
