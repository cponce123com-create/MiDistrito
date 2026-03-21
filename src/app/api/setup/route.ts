import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "phone" TEXT,
        "role" TEXT NOT NULL DEFAULT 'PARTICIPANT',
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Tournament" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "type" TEXT NOT NULL,
        "year" INTEGER NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "entryFee" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
        "prizeFirstPct" DOUBLE PRECISION NOT NULL DEFAULT 60.0,
        "prizeSecondPct" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
        "prizeCharityPct" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Phase" (
        "id" TEXT NOT NULL,
        "tournamentId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        "type" TEXT NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Team" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "shortName" TEXT,
        "flagUrl" TEXT,
        "country" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Match" (
        "id" TEXT NOT NULL,
        "tournamentId" TEXT NOT NULL,
        "phaseId" TEXT NOT NULL,
        "localTeamId" TEXT NOT NULL,
        "visitorTeamId" TEXT NOT NULL,
        "dateTime" TIMESTAMP(3) NOT NULL,
        "stadium" TEXT,
        "group" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PROGRAMMED',
        "localGoals" INTEGER,
        "visitorGoals" INTEGER,
        "lockTime" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Participant" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "tournamentId" TEXT NOT NULL,
        "code" TEXT,
        "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "amountPaid" DOUBLE PRECISION,
        "paymentDate" TIMESTAMP(3),
        "totalPoints" INTEGER NOT NULL DEFAULT 0,
        "rank" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Participant_code_key" ON "Participant"("code");`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Prediction" (
        "id" TEXT NOT NULL,
        "participantId" TEXT NOT NULL,
        "matchId" TEXT NOT NULL,
        "localPred" INTEGER NOT NULL,
        "visitorPred" INTEGER NOT NULL,
        "points" INTEGER NOT NULL DEFAULT 0,
        "correctWinner" BOOLEAN,
        "correctScore" BOOLEAN,
        "locked" BOOLEAN NOT NULL DEFAULT false,
        "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT NOT NULL,
        "participantId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "method" TEXT,
        "reference" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "validatedByAdmin" BOOLEAN NOT NULL DEFAULT false,
        "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "StandingsSnapshot" (
        "id" TEXT NOT NULL,
        "tournamentId" TEXT NOT NULL,
        "participantId" TEXT NOT NULL,
        "points" INTEGER NOT NULL,
        "rank" INTEGER NOT NULL,
        "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "StandingsSnapshot_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PdfExport" (
        "id" TEXT NOT NULL,
        "participantId" TEXT NOT NULL,
        "tournamentId" TEXT NOT NULL,
        "fileUrl" TEXT NOT NULL,
        "generationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PdfExport_pkey" PRIMARY KEY ("id")
      );
    `);

    return NextResponse.json({ ok: true, message: "Tablas creadas correctamente" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

