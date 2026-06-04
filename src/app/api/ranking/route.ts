import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, predictions, matches } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ranking = await db.execute(sql`
      SELECT u.id, u.name, u.image,
        COALESCE(SUM(p.points), 0) as total_points,
        COUNT(p.id) as predictions_count
      FROM users u
      LEFT JOIN predictions p ON p.user_id = u.id
      LEFT JOIN matches m ON p.match_id = m.id
      WHERE m.status = 'finished' OR m.status IS NULL
      GROUP BY u.id, u.name, u.image
      ORDER BY total_points DESC
    `);

    const [totalMatches] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(matches)
      .where(eq(matches.status, "finished"));

    const totalFinished = totalMatches?.count || 0;
    const maxPossiblePerMatch = 3;

    const ranked = (ranking.rows || [] as any[]).map((r: any) => ({
      id: r.id,
      name: r.name,
      image: r.image,
      totalPoints: Number(r.total_points),
      predictionsCount: Number(r.predictions_count),
      efficiency: totalFinished > 0
        ? Math.round((Number(r.total_points) / (totalFinished * maxPossiblePerMatch)) * 100)
        : 0,
    }));

    return NextResponse.json({ ranking: ranked, totalMatches: totalFinished });
  } catch (error) {
    console.error("Ranking error:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
