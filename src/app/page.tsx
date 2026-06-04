import { db } from "@/db";
import { sql } from "drizzle-orm";
import Link from "next/link";
import { Trophy, Users, Target, ArrowRight } from "lucide-react";
import Countdown from "@/components/Countdown";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tournament = await db.execute(sql`
    SELECT * FROM tournaments WHERE status = 'active' LIMIT 1
  `);
  const t = tournament.rows?.[0];

  const nextMatch = await db.execute(sql`
    SELECT m.*, ht.name as home_name, ht.flag_url as home_flag,
      at.name as away_name, at.flag_url as away_flag
    FROM matches m
    JOIN teams ht ON m.home_team_id = ht.id
    JOIN teams at ON m.away_team_id = at.id
    WHERE m.status = 'upcoming'
    ORDER BY m.match_date ASC LIMIT 1
  `);
  const next = nextMatch.rows?.[0];

  const rankingData = await db.execute(sql`
    SELECT u.id, u.name, u.image, COALESCE(SUM(p.points), 0) as total_points
    FROM users u
    LEFT JOIN predictions p ON p.user_id = u.id
    LEFT JOIN matches m ON p.match_id = m.id
    WHERE m.status = 'finished' OR m.status IS NULL
    GROUP BY u.id, u.name, u.image
    ORDER BY total_points DESC LIMIT 10
  `);
  const top10 = (rankingData.rows || []) as any[];

  const countData = await db.execute(sql`
    SELECT COUNT(*) as total FROM users
  `);
  const totalUsers = Number(countData.rows?.[0]?.total || 0);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 text-white py-20 px-4">
        <div className="max-6xl mx-auto text-center">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-yellow-400" />
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Polla Mundial 2026</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-8">
            Pronostica los resultados del Mundial 2026, compite con tus amigos y gana grandes premios.
          </p>
          {next && <Countdown targetDate={next.match_date as string} />}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/registro" className="bg-white text-green-700 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg">
              ¡Participar Ahora!
            </Link>
            <Link href="/ranking" className="bg-green-800 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-green-900 transition border border-green-500 shadow-lg">
              Ver Ranking
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 text-center border">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-3xl font-bold">{totalUsers}</p>
            <p className="text-gray-500 text-sm">Participantes</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center border">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-3xl font-bold">{t ? "ACTIVO" : "PRÓXIMAMENTE"}</p>
            <p className="text-gray-500 text-sm">Torneo</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center border">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-3xl font-bold">{top10.length > 0 ? String(top10[0].name) : "—"}</p>
            <p className="text-gray-500 text-sm">Líder Actual</p>
          </div>
        </div>
      </section>

      {/* Ranking Top 10 */}
      {top10.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 mb-12">
          <div className="bg-white rounded-xl shadow-md border overflow-hidden">
            <div className="p-4 border-b bg-yellow-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Top 10 Ranking
              </h2>
            </div>
            <div className="divide-y">
              {top10.map((r: any, i: number) => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center font-bold text-lg">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <span className="font-bold text-green-600">{r.total_points} pts</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t text-center">
              <Link href="/ranking" className="text-blue-600 hover:underline text-sm font-medium">
                Ver ranking completo →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">1</div>
              <h3 className="font-bold mb-2">Regístrate</h3>
              <p className="text-gray-600 text-sm">Crea tu cuenta gratis y únete a la quiniela del Mundial.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">2</div>
              <h3 className="font-bold mb-2">Pronostica</h3>
              <p className="text-gray-600 text-sm">Predice el marcador de cada partido antes que empiece.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-yellow-600">3</div>
              <h3 className="font-bold mb-2">Gana Puntos</h3>
              <p className="text-gray-600 text-sm">Acumula puntos por cada acierto y sube en el ranking.</p>
            </div>
          </div>
          <div className="mt-8">
            <Link href="/reglas" className="text-blue-600 hover:underline font-medium">
              Ver sistema de puntuación completo →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
