import { prisma } from "@/lib/prisma";
import { ExternalLink, Target, Trophy } from "lucide-react";
import Link from "next/link";

export default async function PublicPredictionsPage() {
  const participants = await prisma.participant.findMany({
    where: { tournament: { status: "ACTIVE" } },
    include: {
      user: { select: { name: true } },
      _count: {
        select: {
          predictions: true,
        },
      },
    },
    orderBy: { totalPoints: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-6">
          <Target className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Portal de Transparencia</h1>
        <p className="text-gray-600">Revisa las jugadas de todos los participantes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {participants.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100 italic text-gray-500">
            Aún no hay participantes registrados en el torneo actual.
          </div>
        ) : (
          participants.map((p) => (
            <div
              key={p.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {p.user.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">#{p.rank || "-"}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-blue-600 leading-none">{p.totalPoints}</p>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mt-1">Puntos</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 bg-gray-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Pronósticos</p>
                  <p className="font-extrabold text-gray-900">{p._count.predictions}</p>
                </div>
                <div className="flex-1 bg-gray-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Pagado</p>
                  <p className={`font-extrabold ${p.paymentStatus === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}`}>
                    {p.paymentStatus === 'APPROVED' ? 'SÍ' : 'NO'}
                  </p>
                </div>
              </div>

              <Link
                href={`/participante/${p.id}`}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gray-50 text-blue-600 font-bold hover:bg-blue-50 transition-colors"
              >
                <span>Ver Jugadas Detalladas</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
