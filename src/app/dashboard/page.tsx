import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, predictions, matches, teams, tournaments } from "@/db/schema";
import { eq, sql, desc, asc, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, Target, Calendar, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) redirect("/login");

  // User's predictions with match data
  const userPredictions = await db.execute(sql`
    SELECT p.*, m.match_date, m.home_score, m.away_score, m.status as match_status,
      ht.name as home_name, ht.flag_url as home_flag,
      at.name as away_name, at.flag_url as away_flag
    FROM predictions p
    JOIN matches m ON p.match_id = m.id
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE p.user_id = ${user.id}
    ORDER BY m.match_date DESC
  `);

  const rows = (userPredictions.rows || []) as any[];
  const totalPoints = rows.reduce((sum: number, r: any) => sum + Number(r.points), 0);
  const correctScores = rows.filter((r: any) => Number(r.points) === 3).length;
  const correctWinners = rows.filter((r: any) => Number(r.points) >= 1).length;

  // Next upcoming matches
  const upcomingMatches = await db.execute(sql`
    SELECT m.*, ht.name as home_name, ht.flag_url as home_flag,
      at.name as away_name, at.flag_url as away_flag
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE m.status = 'upcoming'
    ORDER BY m.match_date ASC
    LIMIT 5
  `);

  // User ranking position
  const ranking = await db.execute(sql`
    SELECT u.id, COALESCE(SUM(p.points), 0) as total_points
    FROM users u
    LEFT JOIN predictions p ON p.user_id = u.id
    LEFT JOIN matches m ON p.match_id = m.id
    WHERE m.status = 'finished' OR m.status IS NULL
    GROUP BY u.id
    ORDER BY total_points DESC
  `);

  const position = (ranking.rows || [] as any[]).findIndex((r: any) => r.id === user.id) + 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hola, {user.name} 👋</h1>
        <p className="text-gray-500">Tu panel personal</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-500">Puntos</span>
          </div>
          <p className="text-2xl font-bold">{totalPoints}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-500">Posición</span>
          </div>
          <p className="text-2xl font-bold">#{position || "-"}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-500">Exactos</span>
          </div>
          <p className="text-2xl font-bold">{correctScores}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-500">Pronosticados</span>
          </div>
          <p className="text-2xl font-bold">{rows.length}</p>
        </div>
      </div>

      {/* Next matches */}
      <div className="bg-white rounded-xl border shadow-sm mb-8">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Próximos Partidos</h2>
          <Link href="/pronosticos" className="text-blue-600 text-sm font-medium hover:underline">Pronosticar</Link>
        </div>
        <div className="divide-y">
          {(upcomingMatches.rows || [] as any[]).length === 0 ? (
            <p className="p-6 text-center text-gray-400 italic">No hay partidos próximos</p>
          ) : (
            (upcomingMatches.rows || [] as any[]).map((m: any) => (
              <div key={m.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.home_flag || "🏳️"}</span>
                  <span className="font-medium">{m.home_name}</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">vs</p>
                  <p className="text-xs text-gray-500">{new Date(m.match_date).toLocaleDateString("es-PE")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{m.away_name}</span>
                  <span className="text-2xl">{m.away_flag || "🏳️"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent predictions */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">Mis Pronósticos</h2>
        </div>
        <div className="divide-y">
          {rows.slice(0, 10).map((p: any) => (
            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <span>{p.home_flag || "🏳️"}</span>
                <span className="font-medium text-sm">{p.home_name}</span>
              </div>
              <div className="text-center">
                <p className="font-bold">{p.home_score ?? "?"}-{p.away_score ?? "?"}</p>
                <p className="text-xs text-gray-400">
                  {p.match_status === "finished" ? `${p.home_score}-${p.away_score}` : new Date(p.match_date).toLocaleDateString("es-PE")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">{p.away_name}</span>
                <span>{p.away_flag || "🏳️"}</span>
                {p.match_status === "finished" && (
                  <span className={`text-sm font-bold ${Number(p.points) > 0 ? "text-green-600" : "text-red-400"}`}>
                    +{p.points}
                  </span>
                )}
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="p-6 text-center text-gray-400 italic">
              Aún no has hecho ningún pronóstico.{" "}
              <Link href="/pronosticos" className="text-blue-600 hover:underline">¡Empieza aquí!</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
