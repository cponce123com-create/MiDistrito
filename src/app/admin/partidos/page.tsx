"use client";

import { useState, useEffect } from "react";

export default function AdminPartidosPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/matches").then((r) => r.json()).then(setMatches).catch(() => {});
  }, []);

  const updateResult = async (matchId: string, homeScore: number, awayScore: number) => {
    setSaving(matchId);
    await fetch(`/api/matches/${matchId}/result`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeScore, awayScore }),
    });
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, home_score: homeScore, away_score: awayScore, status: "finished" } : m))
    );
    setSaving(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gestionar Partidos</h1>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-left text-sm">Partido</th>
              <th className="p-3 text-center text-sm">Fecha</th>
              <th className="p-3 text-center text-sm">Estado</th>
              <th className="p-3 text-center text-sm">Resultado</th>
              <th className="p-3 text-center text-sm">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {matches.map((m: any) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <span className="font-medium">{m.home_name}</span> vs <span className="font-medium">{m.away_name}</span>
                </td>
                <td className="p-3 text-center text-sm text-gray-500">
                  {new Date(m.match_date).toLocaleDateString("es-PE")}
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    m.status === "finished" ? "bg-green-100 text-green-700" :
                    m.status === "live" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{m.status}</span>
                </td>
                <td className="p-3 text-center font-bold tabular-nums">
                  {m.status === "finished" ? `${m.home_score} - ${m.away_score}` : "—"}
                </td>
                <td className="p-3 text-center">
                  {m.status !== "finished" && (
                    <ResultForm matchId={m.id} onSave={updateResult} saving={saving === m.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {matches.length === 0 && (
          <p className="p-8 text-center text-gray-400 italic">No hay partidos. Usa Seed Data para cargarlos.</p>
        )}
      </div>
    </div>
  );
}

function ResultForm({ matchId, onSave, saving }: { matchId: string; onSave: (id: string, h: number, a: number) => void; saving: boolean }) {
  const [h, setH] = useState(0);
  const [a, setA] = useState(0);

  return (
    <div className="flex items-center justify-center gap-1">
      <input type="number" min={0} value={h} onChange={(e) => setH(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-10 text-center border rounded text-sm" />
      <span className="text-gray-400">:</span>
      <input type="number" min={0} value={a} onChange={(e) => setA(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-10 text-center border rounded text-sm" />
      <button onClick={() => onSave(matchId, h, a)} disabled={saving}
        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50">
        {saving ? "..." : "OK"}
      </button>
    </div>
  );
}
