import { PrismaClient, Role, TournamentStatus, PhaseType, MatchStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: "admin@polla.com" },
    update: {},
    create: {
      email: "admin@polla.com",
      name: "Administrador",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  // Create Teams
  const teamsData = [
    { name: "Argentina", shortName: "ARG", country: "Argentina", flagUrl: "🇦🇷" },
    { name: "Brasil", shortName: "BRA", country: "Brasil", flagUrl: "🇧🇷" },
    { name: "Colombia", shortName: "COL", country: "Colombia", flagUrl: "🇨🇴" },
    { name: "Perú", shortName: "PER", country: "Perú", flagUrl: "🇵🇪" },
  ];

  const teams = [];
  for (const team of teamsData) {
    const t = await prisma.team.upsert({
      where: { id: team.shortName }, // Using shortName as ID for simplicity in seed
      update: {},
      create: {
        id: team.shortName,
        name: team.name,
        shortName: team.shortName,
        country: team.country,
        flagUrl: team.flagUrl,
      },
    });
    teams.push(t);
  }

  // Create Tournament
  const tournament = await prisma.tournament.upsert({
    where: { id: "copa-america-2024" },
    update: {},
    create: {
      id: "copa-america-2024",
      name: "Copa América 2024",
      description: "Quiniela oficial Copa América 2024",
      type: "Copa América",
      year: 2024,
      status: TournamentStatus.ACTIVE,
      entryFee: 5.0,
      prizeFirstPct: 60,
      prizeSecondPct: 30,
      prizeCharityPct: 10,
    },
  });

  // Create Phase
  const phase = await prisma.phase.upsert({
    where: { id: "phase-groups-1" },
    update: {},
    create: {
      id: "phase-groups-1",
      tournamentId: tournament.id,
      name: "Fase de Grupos",
      order: 1,
      type: PhaseType.GROUPS,
      active: true,
    },
  });

  // Create Matches
  const matchesData = [
    {
      localTeamId: "ARG",
      visitorTeamId: "PER",
      dateTime: new Date("2024-06-20T20:00:00Z"),
      stadium: "Mercedes-Benz Stadium",
      group: "A",
      lockTime: new Date("2024-06-20T19:00:00Z"),
    },
    {
      localTeamId: "BRA",
      visitorTeamId: "COL",
      dateTime: new Date("2024-06-24T18:00:00Z"),
      stadium: "SoFi Stadium",
      group: "D",
      lockTime: new Date("2024-06-24T17:00:00Z"),
    },
  ];

  for (const match of matchesData) {
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        phaseId: phase.id,
        localTeamId: match.localTeamId,
        visitorTeamId: match.visitorTeamId,
        dateTime: match.dateTime,
        stadium: match.stadium,
        group: match.group,
        lockTime: match.lockTime,
        status: MatchStatus.PROGRAMMED,
      },
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
