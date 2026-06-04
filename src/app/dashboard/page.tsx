import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Trophy, Calendar, Target, Award, Download } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      participants: {
        include: {
          tournament: true,
          predictions: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const activeParticipant = user.participants[0]; // Assuming one active tournament for now

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hola, {user.name} 👋</h1>
        <p className="text-gray-600">Bienvenido a tu panel personal.</p>
      </div>

      {!activeParticipant ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <Trophy className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Aún no participas en ningún torneo</h2>
          <p className="text-gray-600 mb-6">Únete al Mundial 2026 y empieza a ganar puntos.</p>
          <Link
            href="/torneos"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Ver Torneos Disponibles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold">{activeParticipant.totalPoints}</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Puntos Totales</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold">#{activeParticipant.rank || "-"}</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Posición Actual</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold">
                {activeParticipant.predictions.length}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Pronósticos Realizados</h3>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-bold text-purple-600">
                {activeParticipant.paymentStatus === "APPROVED" ? "Pagado" : "Pendiente"}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Estado de Pago</h3>
          </div>
        </div>
      )}

      {activeParticipant && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-lg">Próximos Partidos</h2>
                <Link href="/dashboard/pronosticos" className="text-blue-600 text-sm font-medium hover:underline">
                  Ver todos
                </Link>
              </div>
              <div className="p-6">
                <p className="text-gray-500 text-center py-8 italic">No hay partidos próximos disponibles.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-lg mb-4">Acciones Rápidas</h2>
              <div className="space-y-3">
                <Link
                  href="/dashboard/pronosticos"
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium">Editar Pronósticos</span>
                  <Target className="h-4 w-4 text-gray-400" />
                </Link>
                <button className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium">Descargar PDF de Jugadas</span>
                  <Download className="h-4 w-4 text-gray-400" />
                </button>
                <Link
                  href="/ranking"
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium">Ver Ranking Completo</span>
                  <Trophy className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
