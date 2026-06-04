import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminEquiposPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/dashboard");

  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipos</h1>
          <p className="text-gray-600">Administra los {teams.length} equipos del Mundial 2026.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center space-x-3 hover:shadow-md transition">
            <span className="text-3xl">{team.flagUrl}</span>
            <div>
              <p className="font-semibold text-gray-900">{team.name}</p>
              <p className="text-xs text-gray-500">{team.shortName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
