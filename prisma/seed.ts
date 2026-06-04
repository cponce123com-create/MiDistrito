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

  // ===== WORLD CUP 2026 TEAMS (48) =====
  // Organized by confederation. Groups are placeholders since the draw hasn't happened.

  const teamsData = [
    // Anfitriones CONCACAF (3)
    { id: "USA", name: "Estados Unidos", shortName: "USA", country: "Estados Unidos", flagUrl: "🇺🇸", group: "A" },
    { id: "CAN", name: "Canadá", shortName: "CAN", country: "Canadá", flagUrl: "🇨🇦", group: "B" },
    { id: "MEX", name: "México", shortName: "MEX", country: "México", flagUrl: "🇲🇽", group: "C" },
    // CONCACAF rest (3)
    { id: "CRC", name: "Costa Rica", shortName: "CRC", country: "Costa Rica", flagUrl: "🇨🇷", group: "D" },
    { id: "PAN", name: "Panamá", shortName: "PAN", country: "Panamá", flagUrl: "🇵🇦", group: "E" },
    { id: "JAM", name: "Jamaica", shortName: "JAM", country: "Jamaica", flagUrl: "🇯🇲", group: "F" },
    // CONMEBOL (6)
    { id: "ARG", name: "Argentina", shortName: "ARG", country: "Argentina", flagUrl: "🇦🇷", group: "A" },
    { id: "BRA", name: "Brasil", shortName: "BRA", country: "Brasil", flagUrl: "🇧🇷", group: "B" },
    { id: "URU", name: "Uruguay", shortName: "URU", country: "Uruguay", flagUrl: "🇺🇾", group: "C" },
    { id: "ECU", name: "Ecuador", shortName: "ECU", country: "Ecuador", flagUrl: "🇪🇨", group: "D" },
    { id: "COL", name: "Colombia", shortName: "COL", country: "Colombia", flagUrl: "🇨🇴", group: "E" },
    { id: "PAR", name: "Paraguay", shortName: "PAR", country: "Paraguay", flagUrl: "🇵🇾", group: "F" },
    // UEFA (16)
    { id: "GER", name: "Alemania", shortName: "GER", country: "Alemania", flagUrl: "🇩🇪", group: "G" },
    { id: "FRA", name: "Francia", shortName: "FRA", country: "Francia", flagUrl: "🇫🇷", group: "H" },
    { id: "ENG", name: "Inglaterra", shortName: "ENG", country: "Inglaterra", flagUrl: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "I" },
    { id: "ESP", name: "España", shortName: "ESP", country: "España", flagUrl: "🇪🇸", group: "J" },
    { id: "POR", name: "Portugal", shortName: "POR", country: "Portugal", flagUrl: "🇵🇹", group: "K" },
    { id: "NED", name: "Países Bajos", shortName: "NED", country: "Países Bajos", flagUrl: "🇳🇱", group: "L" },
    { id: "ITA", name: "Italia", shortName: "ITA", country: "Italia", flagUrl: "🇮🇹", group: "A" },
    { id: "BEL", name: "Bélgica", shortName: "BEL", country: "Bélgica", flagUrl: "🇧🇪", group: "B" },
    { id: "CRO", name: "Croacia", shortName: "CRO", country: "Croacia", flagUrl: "🇭🇷", group: "C" },
    { id: "SUI", name: "Suiza", shortName: "SUI", country: "Suiza", flagUrl: "🇨🇭", group: "D" },
    { id: "DEN", name: "Dinamarca", shortName: "DEN", country: "Dinamarca", flagUrl: "🇩🇰", group: "E" },
    { id: "POL", name: "Polonia", shortName: "POL", country: "Polonia", flagUrl: "🇵🇱", group: "F" },
    { id: "AUT", name: "Austria", shortName: "AUT", country: "Austria", flagUrl: "🇦🇹", group: "G" },
    { id: "SRB", name: "Serbia", shortName: "SRB", country: "Serbia", flagUrl: "🇷🇸", group: "H" },
    { id: "TUR", name: "Turquía", shortName: "TUR", country: "Turquía", flagUrl: "🇹🇷", group: "I" },
    { id: "UKR", name: "Ucrania", shortName: "UKR", country: "Ucrania", flagUrl: "🇺🇦", group: "J" },
    // CAF (9)
    { id: "MAR", name: "Marruecos", shortName: "MAR", country: "Marruecos", flagUrl: "🇲🇦", group: "G" },
    { id: "SEN", name: "Senegal", shortName: "SEN", country: "Senegal", flagUrl: "🇸🇳", group: "H" },
    { id: "NGA", name: "Nigeria", shortName: "NGA", country: "Nigeria", flagUrl: "🇳🇬", group: "I" },
    { id: "EGY", name: "Egipto", shortName: "EGY", country: "Egipto", flagUrl: "🇪🇬", group: "J" },
    { id: "TUN", name: "Túnez", shortName: "TUN", country: "Túnez", flagUrl: "🇹🇳", group: "K" },
    { id: "ALG", name: "Argelia", shortName: "ALG", country: "Argelia", flagUrl: "🇩🇿", group: "L" },
    { id: "CMR", name: "Camerún", shortName: "CMR", country: "Camerún", flagUrl: "🇨🇲", group: "A" },
    { id: "GHA", name: "Ghana", shortName: "GHA", country: "Ghana", flagUrl: "🇬🇭", group: "B" },
    { id: "CIV", name: "Costa de Marfil", shortName: "CIV", country: "Costa de Marfil", flagUrl: "🇨🇮", group: "C" },
    // AFC (8)
    { id: "JPN", name: "Japón", shortName: "JPN", country: "Japón", flagUrl: "🇯🇵", group: "D" },
    { id: "KOR", name: "Corea del Sur", shortName: "KOR", country: "Corea del Sur", flagUrl: "🇰🇷", group: "E" },
    { id: "AUS", name: "Australia", shortName: "AUS", country: "Australia", flagUrl: "🇦🇺", group: "F" },
    { id: "IRN", name: "Irán", shortName: "IRN", country: "Irán", flagUrl: "🇮🇷", group: "G" },
    { id: "KSA", name: "Arabia Saudita", shortName: "KSA", country: "Arabia Saudita", flagUrl: "🇸🇦", group: "H" },
    { id: "UAE", name: "Emiratos Árabes Unidos", shortName: "UAE", country: "EAU", flagUrl: "🇦🇪", group: "I" },
    { id: "QAT", name: "Qatar", shortName: "QAT", country: "Qatar", flagUrl: "🇶🇦", group: "J" },
    { id: "IRQ", name: "Irak", shortName: "IRQ", country: "Irak", flagUrl: "🇮🇶", group: "K" },
    // OFC (1)
    { id: "NZL", name: "Nueva Zelanda", shortName: "NZL", country: "Nueva Zelanda", flagUrl: "🇳🇿", group: "L" },
  ];

  const teams = [];
  for (const team of teamsData) {
    const t = await prisma.team.upsert({
      where: { id: team.id },
      update: {
        name: team.name,
        shortName: team.shortName,
        country: team.country,
        flagUrl: team.flagUrl,
      },
      create: {
        id: team.id,
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
    where: { id: "mundial-2026" },
    update: {},
    create: {
      id: "mundial-2026",
      name: "Mundial 2026",
      description: "Quiniela oficial del Mundial 2026 — Estados Unidos, Canadá y México",
      type: "Mundial",
      year: 2026,
      status: TournamentStatus.ACTIVE,
      entryFee: 5.0,
      prizeFirstPct: 60,
      prizeSecondPct: 30,
      prizeCharityPct: 10,
    },
  });

  // Create Phases
  const phasesData = [
    { id: "phase-groups", name: "Fase de Grupos", order: 1, type: PhaseType.GROUPS },
    { id: "phase-r32", name: "Ronda de 32", order: 2, type: PhaseType.ROUND_OF_32 },
    { id: "phase-r16", name: "Octavos de Final", order: 3, type: PhaseType.OCTAVOS },
    { id: "phase-qf", name: "Cuartos de Final", order: 4, type: PhaseType.CUARTOS },
    { id: "phase-sf", name: "Semifinales", order: 5, type: PhaseType.SEMIFINAL },
    { id: "phase-final", name: "Final", order: 6, type: PhaseType.FINAL },
  ];

  const phaseMap: Record<string, any> = {};
  for (const phase of phasesData) {
    const p = await prisma.phase.upsert({
      where: { id: phase.id },
      update: {},
      create: {
        id: phase.id,
        tournamentId: tournament.id,
        name: phase.name,
        order: phase.order,
        type: phase.type,
        active: phase.type === PhaseType.GROUPS,
      },
    });
    phaseMap[phase.id] = p;
  }

  const groupNames = ["A","B","C","D","E","F","G","H","I","J","K","L"];

  // Get teams by group from original data (Team model has no 'group' field)
  const teamsDataByGroup: Record<string, typeof teamsData> = {};
  for (const g of groupNames) {
    teamsDataByGroup[g] = teamsData.filter(t => t.group === g);
  }

  // Map team IDs to Prisma Team objects for lookups
  const teamsMap: Record<string, (typeof teams)[0]> = {};
  for (const t of teams) {
    teamsMap[t.id] = t;
  }

  // Generate Group Stage Matches (each team plays every other in same group = 6 matches per group x 12 = 72 matches)
  const groupMatches: any[] = [];
  const matchDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  for (const group of groupNames) {
    const groupTeams = teamsDataByGroup[group];
    if (groupTeams.length < 4) continue;

    // Generate round-robin: 0-1, 0-2, 0-3, 1-2, 1-3, 2-3
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        const matchTime = new Date(matchDate.getTime() + groupMatches.length * 4 * 60 * 60 * 1000); // 4h apart
        groupMatches.push({
          localTeamId: groupTeams[i].id,
          visitorTeamId: groupTeams[j].id,
          dateTime: matchTime,
          stadium: `${["Estadio Azteca","SoFi Stadium","MetLife Stadium","AT&T Stadium","Mercedes-Benz","Arrowhead","NRG Stadium","Levi's Stadium","Gillette","Hard Rock","BC Place","Estadio BBVA"][groupMatches.length % 12]}`,
          group: group,
          lockTime: new Date(matchTime.getTime() - 1 * 60 * 60 * 1000), // 1h before
        });
      }
    }
  }

  // Create Group Stage Matches
  for (const match of groupMatches) {
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        phaseId: phaseMap["phase-groups"].id,
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

  // Create placeholder for Round of 32 matches (16 matches, TBD based on group results)
  // These will be populated by admin after group stage ends
  for (let i = 0; i < 16; i++) {
    const matchTime = new Date("2026-06-29T16:00:00Z"); // Approximate R32 start
    const r32Time = new Date(matchTime.getTime() + i * 6 * 60 * 60 * 1000);
    await prisma.match.upsert({
      where: { id: `r32-placeholder-${i + 1}` },
      update: {},
      create: {
        id: `r32-placeholder-${i + 1}`,
        tournamentId: tournament.id,
        phaseId: phaseMap["phase-r32"].id,
        localTeamId: "USA", // Placeholder - admin will update
        visitorTeamId: "CAN", // Placeholder - admin will update
        dateTime: r32Time,
        stadium: "Por definir",
        group: null,
        status: MatchStatus.PROGRAMMED,
        localGoals: null,
        visitorGoals: null,
        lockTime: new Date(r32Time.getTime() - 1 * 60 * 60 * 1000),
      },
    });
  }

  // Create placeholder Round of 16 matches (8 matches)
  for (let i = 0; i < 8; i++) {
    const matchTime = new Date("2026-07-04T12:00:00Z");
    const r16Time = new Date(matchTime.getTime() + i * 6 * 60 * 60 * 1000);
    await prisma.match.upsert({
      where: { id: `r16-placeholder-${i + 1}` },
      update: {},
      create: {
        id: `r16-placeholder-${i + 1}`,
        tournamentId: tournament.id,
        phaseId: phaseMap["phase-r16"].id,
        localTeamId: "USA",
        visitorTeamId: "MEX",
        dateTime: r16Time,
        stadium: "Por definir",
        group: null,
        status: MatchStatus.PROGRAMMED,
        lockTime: new Date(r16Time.getTime() - 1 * 60 * 60 * 1000),
      },
    });
  }

  // Create Quarterfinal matches (4)
  for (let i = 0; i < 4; i++) {
    const matchTime = new Date("2026-07-09T12:00:00Z");
    const qfTime = new Date(matchTime.getTime() + i * 6 * 60 * 60 * 1000);
    await prisma.match.upsert({
      where: { id: `qf-placeholder-${i + 1}` },
      update: {},
      create: {
        id: `qf-placeholder-${i + 1}`,
        tournamentId: tournament.id,
        phaseId: phaseMap["phase-qf"].id,
        localTeamId: "USA",
        visitorTeamId: "ARG",
        dateTime: qfTime,
        stadium: "Por definir",
        group: null,
        status: MatchStatus.PROGRAMMED,
        lockTime: new Date(qfTime.getTime() - 1 * 60 * 60 * 1000),
      },
    });
  }

  // Create Semifinal matches (2)
  for (let i = 0; i < 2; i++) {
    const matchTime = new Date("2026-07-14T12:00:00Z");
    const sfTime = new Date(matchTime.getTime() + i * 6 * 60 * 60 * 1000);
    await prisma.match.upsert({
      where: { id: `sf-placeholder-${i + 1}` },
      update: {},
      create: {
        id: `sf-placeholder-${i + 1}`,
        tournamentId: tournament.id,
        phaseId: phaseMap["phase-sf"].id,
        localTeamId: "BRA",
        visitorTeamId: "FRA",
        dateTime: sfTime,
        stadium: "Por definir",
        group: null,
        status: MatchStatus.PROGRAMMED,
        lockTime: new Date(sfTime.getTime() - 1 * 60 * 60 * 1000),
      },
    });
  }

  // Create Final match (1)
  await prisma.match.upsert({
    where: { id: "final-2026" },
    update: {},
    create: {
      id: "final-2026",
      tournamentId: tournament.id,
      phaseId: phaseMap["phase-final"].id,
      localTeamId: "GER",
      visitorTeamId: "ARG",
      dateTime: new Date("2026-07-19T18:00:00Z"),
      stadium: "MetLife Stadium",
      group: null,
      status: MatchStatus.PROGRAMMED,
      lockTime: new Date("2026-07-19T17:00:00Z"),
    },
  });

  console.log("✅ Seed data for Mundial 2026 created successfully!");
  console.log(`   - ${teams.length} equipos en ${groupNames.length} grupos`);
  console.log(`   - ${groupMatches.length} partidos de fase de grupos`);
  console.log(`   - 16 R32 + 8 R16 + 4 QF + 2 SF + 1 Final = 31 partidos de llaves`);
  console.log(`   - Admin: admin@polla.com / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
