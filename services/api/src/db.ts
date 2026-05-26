import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("🐘 PostgreSQL database connected successfully via Prisma.");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL database:", error);
    return false;
  }
}
