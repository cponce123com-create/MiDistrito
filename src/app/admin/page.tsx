import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Trophy, DollarSign, Settings, Plus, Calendar } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const tournaments = await prisma.tournament.findMany({
    include: {
      _count: {
        select: { participants: true, matches: true },
      },
    },
  });

  const totalParticipants = tournaments.reduce((acc, t) => acc + t._count.participants, 0);
  const totalPool = tournaments.reduce((acc, t) => acc + (t._count.participants * t.entryFee), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Gestiona torneos, partidos y participantes.</p>
        </div>
        <Link
          href="/admin/torneos/nuevo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Torneo</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold">{totalParticipants}</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Inscritos</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold">S/ {totalPool}</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Pozo Acumulado</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold">{tournaments.length}</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Torneos Activos</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold">0</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Partidos Pendientes</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">Torneos</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {tournaments.length === 0 ? (
                <p className="p-6 text-gray-500 italic text-center">No hay torneos creados aún.</p>
              ) : (
                tournaments.map((tournament) => (
                  <div key={tournament.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <h3 className="font-bold text-gray-900">{tournament.name}</h3>
                      <p className="text-sm text-gray-500">{tournament.type} - {tournament.year}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {tournament._count.participants} participantes
                        </span>
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                          {tournament._count.matches} partidos
                        </span>
                        <span className={`px-2 py-1 rounded ${tournament.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {tournament.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/torneos/${tournament.id}/partidos`}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Gestionar Partidos"
                      >
                        <Calendar className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/admin/torneos/${tournament.id}/config`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Configuración"
                      >
                        <Settings className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-lg mb-4">Acciones de Administración</h2>
            <div className="space-y-3">
              <Link
                href="/admin/participantes"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Validar Pagos</span>
                <Users className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/admin/resultados"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Cargar Resultados</span>
                <Trophy className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
                href="/admin/reportes"
                className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium">Generar Reportes CSV</span>
                <Download className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
