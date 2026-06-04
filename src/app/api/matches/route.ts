import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("tournamentId");
    const status = searchParams.get("status");

    let query = sql`
      SELECT m.*, ht.name as home_name, ht.flag_url as home_flag, 
             at.name as away_name, at.flag_url as away_flag,
             t.name as tournament_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      JOIN tournaments t ON m.tournament_id = t.id
      WHERE 1=1
    `;

    if (tournamentId) {
      query = sql`${query} AND m.tournament_id = ${tournamentId}`;
    }
    if (status) {
      query = sql`${query} AND m.status = ${status}`;
    }

    query = sql`${query} ORDER BY m.match_date ASC`;

    const result = await db.execute(query);
    return NextResponse.json(result.rows || [] as any[]);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
