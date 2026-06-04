"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Target } from "lucide-react";

interface MatchInfo {
  id: string;
  localTeam: { name: string; shortName: string | null };
  visitorTeam: { name: string; shortName: string | null };
  dateTime: string;
  status: string;
  localGoals: number | null;
  visitorGoals: number | null;
}

interface PredictionInfo {
  id: string;
  match: MatchInfo;
  localPred: number;
  visitorPred: number;
  points: number;
  correctWinner: boolean | null;
  correctScore: boolean | null;
}

interface ParticipantInfo {
  id: string;
  user: { name: string };
  totalPoints: number;
  rank: number | null;
  predictions: PredictionInfo[];
  paymentStatus: string;
}

export default function PublicPredictionsPage() {
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournamentStatus, setTournamentStatus] = useState<{
    firstMatchDate: string | null;
    isClosed: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, predictionsRes] = await Promise.all([
          fetch("/api/tournament/status"),
          fetch("/api/ranking"),
        ]);

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setTournamentStatus(statusData);
        }

        if (predictionsRes.ok) {
          const data = await predictionsRes.json();
          // Fetch predictions for each participant
          const participantsWithPredictions = await Promise.all(
            data.participants.map(async (p: any) => {
              const detailRes = await fetch(`/api/participant/${p.id}`);
              if (detailRes.ok) {
                const detail = await detailRes.json();
                return { ...p, predictions: detail.predictions || [] };
              }
              return { ...p, predictions: [] };
            })
          );
          setParticipants(participantsWithPredictions);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const canShowPredictions = tournamentStatus?.isClosed;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Cargando pronósticos públicos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!canShowPredictions) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-6">
            <Target className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Portal de Transparencia</h1>
          <p className="text-gray-600">
            Los pronósticos se mostrarán una vez que comience el torneo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-6">
          <Target className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Portal de Transparencia</h1>
        <p className="text-gray-600">
          Revisa las jugadas de todos los participantes. Haz clic en cada uno para ver sus pronósticos.
        </p>
      </div>

      <div className="space-y-4">
        {participants.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl shadow-sm border border-gray-100 italic text-gray-500">
            Aún no hay participantes aprobados en el torneo actual.
          </div>
        ) : (
          participants.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 font-bold text-gray-700">
                    #{p.rank || "-"}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900">{p.user.name}</h3>
                    <p className="text-sm text-gray-500">
                      {p.predictions.length} pronósticos
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-black text-blue-600">{p.totalPoints}</span>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Pts</span>
                  {expandedId === p.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedId === p.id && (
                <div className="border-t border-gray-100 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Partido</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Pronóstico</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Resultado</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-center">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {p.predictions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                            Sin pronósticos registrados.
                          </td>
                        </tr>
                      ) : (
                        [...p.predictions]
                          .sort((a, b) => new Date(a.match.dateTime).getTime() - new Date(b.match.dateTime).getTime())
                          .map((pred) => (
                            <tr key={pred.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-3">
                                <span className="text-sm font-medium text-gray-900">
                                  {pred.match.localTeam.shortName || pred.match.localTeam.name} vs{" "}
                                  {pred.match.visitorTeam.shortName || pred.match.visitorTeam.name}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <span className="font-mono text-sm font-bold text-blue-600">
                                  {pred.localPred} - {pred.visitorPred}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                {pred.match.status === "FINISHED" ? (
                                  <span className="font-mono text-sm font-bold text-gray-700">
                                    {pred.match.localGoals ?? "?"} - {pred.match.visitorGoals ?? "?"}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-6 py-3 text-center">
                                <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
                                  pred.points >= 5
                                    ? "bg-green-100 text-green-700"
                                    : pred.points >= 3
                                    ? "bg-blue-100 text-blue-700"
                                    : pred.match.status === "FINISHED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-400"
                                }`}>
                                  {pred.points}
                                </span>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
