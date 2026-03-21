"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, AlertCircle } from "lucide-react";

interface Match {
  id: string;
  localTeam: { name: string; flagUrl: string | null };
  visitorTeam: { name: string; flagUrl: string | null };
  dateTime: Date;
  lockTime: Date;
  prediction?: {
    localPred: number;
    visitorPred: number;
  };
}

export const PredictionForm = ({ matches }: { matches: Match[] }) => {
  const [predictions, setPredictions] = useState<Record<string, { local: number; visitor: number }>>(
    matches.reduce((acc, m) => {
      if (m.prediction) {
        acc[m.id] = { local: m.prediction.localPred, visitor: m.prediction.visitorPred };
      } else {
        acc[m.id] = { local: 0, visitor: 0 };
      }
      return acc;
    }, {} as Record<string, { local: number; visitor: number }>)
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleChange = (matchId: string, side: "local" | "visitor", value: string) => {
    const numValue = parseInt(value) || 0;
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: numValue },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Pronósticos guardados correctamente" });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.message || "Error al guardar pronósticos" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Ocurrió un error inesperado" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {matches.map((match) => {
          const isLocked = new Date() > new Date(match.lockTime);
          return (
            <div
              key={match.id}
              className={`bg-white p-6 rounded-xl border ${
                isLocked ? "bg-gray-50 border-gray-200" : "border-gray-100 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-right pr-4">
                  <div className="flex items-center justify-end space-x-2">
                    <span className="font-bold text-gray-900">{match.localTeam.name}</span>
                    <span className="text-2xl">{match.localTeam.flagUrl}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    disabled={isLocked}
                    className="w-16 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    value={predictions[match.id]?.local ?? 0}
                    onChange={(e) => handleChange(match.id, "local", e.target.value)}
                  />
                  <span className="text-gray-400 font-bold">-</span>
                  <input
                    type="number"
                    min="0"
                    disabled={isLocked}
                    className="w-16 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    value={predictions[match.id]?.visitor ?? 0}
                    onChange={(e) => handleChange(match.id, "visitor", e.target.value)}
                  />
                </div>

                <div className="flex-1 text-left pl-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{match.visitorTeam.flagUrl}</span>
                    <span className="font-bold text-gray-900">{match.visitorTeam.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <span>
                  {new Date(match.dateTime).toLocaleDateString("es-PE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isLocked && (
                  <span className="bg-red-50 text-red-600 px-2 py-1 rounded font-medium">
                    Pronóstico Cerrado
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-8 flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="h-6 w-6" />
          <span>{loading ? "Guardando..." : "Guardar Pronósticos"}</span>
        </button>
      </div>
    </form>
  );
};
