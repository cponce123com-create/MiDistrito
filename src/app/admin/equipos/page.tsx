"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function AdminEquiposPage() {
  const [teamsList, setTeamsList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/teams").then((r) => r.json()).then(setTeamsList).catch(() => {});
  }, []);

  const grouped: Record<string, any[]> = {};
  for (const t of teamsList) {
    const g = t.group || "Sin grupo";
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(t);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Equipos</h1>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-400 italic py-12">No hay equipos. Usa Seed Data primero.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(grouped).sort().map(([group, groupTeams]) => (
            <div key={group} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b font-bold">Grupo {group}</div>
              <div className="divide-y">
                {(groupTeams as any[]).map((team: any) => (
                  <div key={team.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getFlag(team.name)}</span>
                      <span className="font-medium">{team.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getFlag(country: string): string {
  const flags: Record<string, string> = {
    "Argentina": "🇦🇷", "Brasil": "🇧🇷", "Uruguay": "🇺🇾", "Paraguay": "🇵🇾",
    "Francia": "🇫🇷", "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Países Bajos": "🇳🇱", "Ucrania": "🇺🇦",
    "España": "🇪🇸", "Alemania": "🇩🇪", "Italia": "🇮🇹", "Polonia": "🇵🇱",
    "Portugal": "🇵🇹", "Bélgica": "🇧🇪", "Croacia": "🇭🇷", "Suiza": "🇨🇭",
    "Colombia": "🇨🇴", "Ecuador": "🇪🇨", "Chile": "🇨🇱",
    "México": "🇲🇽", "Estados Unidos": "🇺🇸", "Costa Rica": "🇨🇷", "Canadá": "🇨🇦",
    "Japón": "🇯🇵", "Corea del Sur": "🇰🇷", "Arabia Saudita": "🇸🇦", "Australia": "🇦🇺",
    "Senegal": "🇸🇳", "Marruecos": "🇲🇦", "Nigeria": "🇳🇬", "Camerún": "🇨🇲",
    "Ghana": "🇬🇭", "Egipto": "🇪🇬", "Túnez": "🇹🇳", "Argelia": "🇩🇿",
  };
  return flags[country] || "🏳️";
}
