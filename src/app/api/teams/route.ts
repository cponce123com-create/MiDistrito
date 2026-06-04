import { NextResponse } from "next/server";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const allTeams = await db.select().from(teams).orderBy(asc(teams.group), asc(teams.name));
  return NextResponse.json(allTeams);
}
