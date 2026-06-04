import { auth } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import PredictionForm from "@/components/PredictionForm";

export const dynamic = "force-dynamic";

export default async function PronosticosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const matchesData = await db.execute(sql`
    SELECT m.*, ht.name as home_name, ht.flag_url as home_flag,
      at.name as away_name, at.flag_url as away_flag
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE m.status != 'finished'
    ORDER BY m.match_date ASC
  `);

  const predictionsData = await db.execute(sql`
    SELECT * FROM predictions WHERE user_id = ${session.user.id}
  `);

  const matches = (matchesData.rows || []) as any[];
  const userPredictions = (predictionsData.rows || []) as any[];

  const predictionMap: Record<string, any> = {};
  for (const p of userPredictions) {
    predictionMap[p.match_id] = p;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Pronósticos</h1>
      <p className="text-gray-500 mb-8">Ingresa tus predicciones para cada partido</p>

      {matches.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <p className="text-yellow-800 font-medium">No hay partidos disponibles para pronosticar</p>
          <p className="text-yellow-600 text-sm mt-1">Vuelve cuando se agreguen nuevos partidos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match: any) => {
            const pred = predictionMap[match.id];
            const isLocked = new Date(match.match_date).getTime() - 5 * 60 * 1000 < Date.now();

            return (
              <div
                key={match.id}
                className={`bg-white rounded-xl border shadow-sm p-4 ${isLocked ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400 uppercase">
                    {match.stage} {match.round ? `• ${match.round}` : ""}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(match.match_date).toLocaleDateString("es-PE", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{match.home_flag || "🏳️"}</span>
                    <span className="font-medium text-right flex-1">{match.home_name}</span>
                  </div>

                  <PredictionForm
                    matchId={match.id}
                    initialHome={pred?.home_score}
                    initialAway={pred?.away_score}
                    isLocked={isLocked}
                  />

                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="font-medium">{match.away_name}</span>
                    <span className="text-3xl">{match.away_flag || "🏳️"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
