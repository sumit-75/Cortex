import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const basePrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

export const prisma = basePrisma;

/**
 * Executes a database query with automatic reconnection handling if Neon closes an idle connection socket.
 */
export async function withRetry<T>(queryFn: () => Promise<T>): Promise<T> {
  try {
    return await queryFn();
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (
      errMsg.includes("Closed") ||
      errMsg.includes("P1017") ||
      errMsg.includes("P1001") ||
      errMsg.includes("kind: Closed")
    ) {
      console.warn("Prisma connection closed by serverless database, reconnecting...");
      try {
        await prisma.$connect();
      } catch (connectErr) {
        console.error("Prisma reconnect error:", connectErr);
      }
      return await queryFn();
    }
    throw err;
  }
}
