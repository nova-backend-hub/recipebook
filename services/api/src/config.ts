import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/recipebook?schema=public",
  jwtSecret: process.env.JWT_SECRET || "recipebook-jwt-super-secret-key-12345",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "recipebook-jwt-refresh-super-secret-key-54321",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  redisUrl: process.env.REDIS_URL || "",
  adminUsername: process.env.ADMIN_USERNAME || "Soli",
  adminPassword: process.env.ADMIN_PASSWORD || "Soliman@1234",
};

// Simple configuration checker
export function validateConfig() {
  if (!process.env.JWT_SECRET) {
    console.warn("⚠️ JWT_SECRET not specified. Using default fallback.");
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ GEMINI_API_KEY not specified. AI extraction will run in mock mode.");
  }
}
