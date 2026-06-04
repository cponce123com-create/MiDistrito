"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";

interface RankingParticipant {
  id: string;
  user: { name: string };
  totalPoints: number;
  rank: number | null;
  _count: { predictions: number };
}

export default function RankingPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<RankingParticipant[]>([]);
  const [hasLiveMatches, setHasLiveMatches] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    try {
      const res = await fetch("/api/ranking");
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants);
        setHasLiveMatches(data.hasLiveMatches);
      }
    } catch (err) {
      console.error("Error fetching ranking:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
    const interval = setInterval(() => {
      fetchRanking();
      router.refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="bg-yellow-100 p-4 rounded-full w-fit mx-auto mb-6 relative">
          <Trophy className="h-12 w-12 text-yellow-600" />
          {hasLiveMatches && (
            <span className="absolute -top-1 -right-1 flex items-center space-x-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span>En vivo</span>
            </span>
          )}
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Ranking General</h1>
        <p className="text-gray-600">Sigue la tabla de posiciones en vivo.</p>
        {hasLiveMatches && (
          <p className="text-sm text-green-600 font-medium mt-2 flex items-center justify-center space-x-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
            <span>● Actualizando cada 30s — Hay partidos en juego</span>
          </p>
        )}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Cargando ranking...
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    Aún no hay participantes en el ranking.
                  </td>
                </tr>
              ) : (
                participants.map((p, index) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {index + 1 <= 3 ? (
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? "bg-yellow-400 text-white" :
                          index === 1 ? "bg-gray-300 text-white" :
                          "bg-amber-600 text-white"
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
