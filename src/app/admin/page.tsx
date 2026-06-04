import { auth } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Trophy, Calendar, Settings, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/login");

  const statsResult = await db.execute(sql`
    SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM matches WHERE status = 'upcoming') as upcoming_matches,
      (SELECT COUNT(*) FROM matches WHERE status = 'finished') as finished_matches,
      (SELECT COUNT(*) FROM teams) as total_teams
  `);
  const s = (statsResult.rows?.[0] || {}) as any;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <Users className="h-6 w-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{Number(s.total_users) || 0}</p>
          <p className="text-sm text-gray-500">Usuarios</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <Calendar className="h-6 w-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{Number(s.upcoming_matches) || 0}</p>
          <p className="text-sm text-gray-500">Próximos</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{Number(s.finished_matches) || 0}</p>
          <p className="text-sm text-gray-500">Finalizados</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <Users className="h-6 w-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{Number(s.total_teams) || 0}</p>
          <p className="text-sm text-gray-500">Equipos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/partidos" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
          <Calendar className="h-8 w-8 text-blue-500 mb-3" />
          <h2 className="font-bold text-lg">Partidos</h2>
          <p className="text-sm text-gray-500">Gestionar partidos e ingresar resultados</p>
        </Link>
        <Link href="/admin/equipos" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
          <Trophy className="h-8 w-8 text-green-500 mb-3" />
          <h2 className="font-bold text-lg">Equipos</h2>
          <p className="text-sm text-gray-500">Gestionar equipos del torneo</p>
        </Link>
        <Link href="/admin/usuarios" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
          <Users className="h-8 w-8 text-purple-500 mb-3" />
          <h2 className="font-bold text-lg">Usuarios</h2>
          <p className="text-sm text-gray-500">Ver y gestionar usuarios</p>
        </Link>
        <Link href="/admin/seed" className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition">
          <Settings className="h-8 w-8 text-orange-500 mb-3" />
          <h2 className="font-bold text-lg">Seed Data</h2>
          <p className="text-sm text-gray-500">Cargar datos iniciales del Mundial</p>
        </Link>
      </div>
    </div>
  );
}
