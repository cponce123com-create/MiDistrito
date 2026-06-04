import { db } from "@/db";
import { sql } from "drizzle-orm";
import Link from "next/link";
import { Trophy, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const rankingData = await db.execute(sql`
    SELECT u.id, u.name, u.image, COALESCE(SUM(p.points), 0) as total_points,
      COUNT(p.id) as predictions_count
    FROM users u
    LEFT JOIN predictions p ON p.user_id = u.id
    LEFT JOIN matches m ON p.match_id = m.id
    WHERE m.status = 'finished' OR m.status IS NULL
    GROUP BY u.id, u.name, u.image
    ORDER BY total_points DESC
  `);

  const ranking = (rankingData.rows || []) as any[];

  const totalMatches = await db.execute(sql`
    SELECT COUNT(*) as count FROM matches WHERE status = 'finished'
  `);
  const totalFinished = Number(totalMatches.rows?.[0]?.count || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" /> Ranking Global
        </h1>
        <p className="text-gray-500">{totalFinished} partidos finalizados</p>
      </div>

      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 text-left text-sm font-medium text-gray-500">#</th>
                <th className="p-4 text-left text-sm font-medium text-gray-500">Participante</th>
                <th className="p-4 text-center text-sm font-medium text-gray-500">Pronósticos</th>
                <th className="p-4 text-center text-sm font-medium text-gray-500">Eficiencia</th>
                <th className="p-4 text-right text-sm font-medium text-gray-500">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ranking.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400 italic">Aún no hay participantes</td></tr>
              ) : (
                ranking.map((r: any, i: number) => {
                  const efficiency = totalFinished > 0
                    ? Math.round((Number(r.total_points) / (totalFinished * 3)) * 100)
                    : 0;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-lg">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                      </td>
                      <td className="p-4">
                        <Link href={`/participante/${r.id}`} className="font-medium hover:text-blue-600">
                          {r.name}
                        </Link>
                      </td>
                      <td className="p-4 text-center">{Number(r.predictions_count)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${Math.min(efficiency, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">{efficiency}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-green-600 text-lg">{Number(r.total_points)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
