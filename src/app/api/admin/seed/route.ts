import { NextResponse } from "next/server";
import { db } from "@/db";
import { tournaments, teams, matches } from "@/db/schema";
import { auth } from "@/lib/auth";
import { sql } from "drizzle-orm";

// FIFA World Cup 2026 - 48 teams, 12 groups of 4
const GROUPS = [
  { letter: "A", teams: ["Argentina", "México", "Arabia Saudita", "Ghana"] },
  { letter: "B", teams: ["Francia", "Inglaterra", "Países Bajos", "Canadá"] },
  { letter: "C", teams: ["España", "Alemania", "Japón", "Ecuador"] },
  { letter: "D", teams: ["Portugal", "Bélgica", "Corea del Sur", "Túnez"] },
  { letter: "E", teams: ["Brasil", "Colombia", "Senegal", "Australia"] },
  { letter: "F", teams: ["Italia", "Uruguay", "Costa Rica", "Argelia"] },
  { letter: "G", teams: ["Estados Unidos", "Croacia", "Nigeria", "Paraguay"] },
  { letter: "H", teams: ["Marruecos", "Suiza", "Ucrania", "Chile"] },
  { letter: "I", teams: ["Polonia", "Camerún", "Egipto", "Bolivia"] },
  { letter: "J", teams: ["Suecia", "Irán", "Venezuela", "Mali"] },
  { letter: "K", teams: ["Dinamarca", "Serbia", "Panamá", "Perú"] },
  { letter: "L", teams: ["Noruega", "República Checa", "Honduras", "Nueva Zelanda"] },
];

export async function POST() {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Check if already seeded
    const existing = await db.execute(sql`SELECT COUNT(*) as count FROM teams`);
    if (Number(existing.rows?.[0]?.count) > 0) {
      return NextResponse.json({ message: "Los datos ya fueron cargados. Limpia la BD primero." }, { status: 400 });
    }

    // Create tournament
    const [tournament] = await db
      .insert(tournaments)
      .values({
        name: "Mundial 2026",
        startDate: new Date("2026-06-11"),
        endDate: new Date("2026-07-19"),
        isActive: true,
        status: "active",
      })
      .returning();

    // Create all teams
    const teamIds: Record<string, string> = {};
    for (const group of GROUPS) {
      for (const teamName of group.teams) {
        const [team] = await db
          .insert(teams)
          .values({
            name: teamName,
            group: group.letter,
          })
          .returning();
        teamIds[teamName] = team.id;
      }
    }

    // Generate group stage matches
    const matchDate = new Date("2026-06-14T10:00:00Z");
    let matchCount = 0;

    for (const group of GROUPS) {
      const t = group.teams;
      // Each team plays each other once (6 matches per group)
      const pairings = [
        [t[0], t[1]], [t[2], t[3]],
        [t[0], t[2]], [t[1], t[3]],
        [t[0], t[3]], [t[1], t[2]],
      ];

      for (const [home, away] of pairings) {
        await db.insert(matches).values({
          tournamentId: tournament.id,
          homeTeamId: teamIds[home],
          awayTeamId: teamIds[away],
          matchDate: new Date(matchDate.getTime() + matchCount * 3 * 60 * 60 * 1000),
          stage: "group",
          status: "upcoming",
          round: `Grupo ${group.letter}`,
        });
        matchCount++;
      }
    }

    // Create an admin user if not exists
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash("admin123", 10);

    await db.execute(sql`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin', 'admin@polla.com', ${passwordHash}, 'admin')
      ON CONFLICT (email) DO NOTHING
    `);

    return NextResponse.json({
      message: `Datos cargados: 1 torneo, ${Object.keys(teamIds).length} equipos, ${matchCount} partidos`,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
