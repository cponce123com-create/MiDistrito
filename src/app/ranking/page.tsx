import { prisma } from "@/lib/prisma";
import { Trophy, Medal } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Trophy, Medal } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function RankingPage() {
export default async function RankingPage() {
  const participants = await prisma.participant.findMany({
    where: { tournament: { status: "ACTIVE" } },
    include: {
      user: { select: { name: true } },
      _count: {
        select: {
          predictions: {
            where: { correctScore: true },
          },
        },
      },
    },
    orderBy: [{ totalPoints: "desc" }, { rank: "asc" }],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="bg-yellow-100 p-4 rounded-full w-fit mx-auto mb-6">
          <Trophy className="h-12 w-12 text-yellow-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Ranking General</h1>
        <p className="text-gray-600">Sigue la tabla de posiciones en vivo.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 font-bold text-gray-900 w-20">#</th>
                <th className="px-6 py-4 font-bold text-gray-900">Participante</th>
                <th className="px-6 py-4 font-bold text-gray-900 text-center">Puntos</th>
                <th className="px-6 py-4 font-bold text-gray-900 text-center hidden md:table-cell">Aciertos Exactos</th>
                <th className="px-6 py-4 font-bold text-gray-900 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    Aún no hay participantes en el ranking.
                  </td>
                </tr>
              ) : (
                participants.map((p, index) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {index + 1 <= 3 ? (
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? "bg-yellow-400 text-white shadow-sm" :
                          index === 1 ? "bg-gray-300 text-white shadow-sm" :
                          "bg-amber-600 text-white shadow-sm"
                        }`}>
                          {index + 1}
                        </div>
                      ) : (
                        <span className="text-gray-500 font-medium ml-3">{index + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{p.user.name}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-extrabold text-blue-600">{p.totalPoints}</span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        {p._count.predictions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver Jugadas
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
