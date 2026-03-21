import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Prisma 7+ handles the datasource URL via prisma.config.ts or env
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
