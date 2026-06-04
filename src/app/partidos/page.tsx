import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function PartidosPage() {
  const matchesData = await db.execute(sql`
    SELECT m.*, ht.name as home_name, ht.flag_url as home_flag,
      at.name as away_name, at.flag_url as away_flag,
      t.name as tournament_name
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    JOIN tournaments t ON m.tournament_id = t.id
    ORDER BY m.match_date ASC
  `);

  const matches = (matchesData.rows || []) as any[];

  const grouped: Record<string, any[]> = {};
  for (const m of matches) {
    const date = new Date(m.match_date).toLocaleDateString("es-PE", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Partidos</h1>
      <p className="text-gray-500 mb-8">Todos los partidos del Mundial 2026</p>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-center text-gray-400 italic py-12">No hay partidos registrados</p>
      ) : (
        Object.entries(grouped).map(([date, dayMatches]) => (
          <div key={date} className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-3 capitalize">{date}</h2>
            <div className="space-y-3">
              {(dayMatches as any[]).map((m: any) => (
                <div key={m.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{m.home_flag || "🏳️"}</span>
                    <span className="font-medium">{m.home_name}</span>
                  </div>

                  <div className="text-center">
                    {m.status === "finished" ? (
                      <span className="text-xl font-bold tabular-nums">
                        {m.home_score} - {m.away_score}
                      </span>
                    ) : m.status === "live" ? (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">EN VIVO</span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        {new Date(m.match_date).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{m.stage}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="font-medium">{m.away_name}</span>
                    <span className="text-2xl">{m.away_flag || "🏳️"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
