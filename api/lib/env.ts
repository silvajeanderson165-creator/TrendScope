import "dotenv/config";

export const env = {
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  serperApiKey: process.env.SERPER_API_KEY ?? "",
};
