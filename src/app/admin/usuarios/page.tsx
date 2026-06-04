import { db } from "@/db";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/login");

  const usersData = await db.execute(sql`
    SELECT u.*, 
      (SELECT COUNT(*) FROM predictions p JOIN matches m ON p.match_id = m.id WHERE m.status = 'finished' AND p.user_id = u.id) as predictions_finished,
      COALESCE((SELECT SUM(p.points) FROM predictions p JOIN matches m ON p.match_id = m.id WHERE m.status = 'finished' AND p.user_id = u.id), 0) as total_points
    FROM users u
    ORDER BY total_points DESC
  `);
  const usersList = (usersData.rows || []) as any[];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Usuarios</h1>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-left text-sm">Nombre</th>
                <th className="p-3 text-left text-sm">Email</th>
                <th className="p-3 text-center text-sm">Rol</th>
                <th className="p-3 text-center text-sm">Pronósticos</th>
                <th className="p-3 text-right text-sm">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usersList.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-sm text-gray-500">{u.email}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === "admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    }`}>{u.role}</span>
                  </td>
                  <td className="p-3 text-center">{Number(u.predictions_finished)}</td>
                  <td className="p-3 text-right font-bold">{Number(u.total_points)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
