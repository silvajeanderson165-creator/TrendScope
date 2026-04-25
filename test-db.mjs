import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import { config } from "dotenv";
config();

const connection = connect({ url: process.env.DATABASE_URL });
const db = drizzle(connection);

async function run() {
  console.log("Testing DB connection to:", process.env.DATABASE_URL?.substring(0, 20) + "...");
  try {
    const res = await db.execute("SELECT 1 as val");
    console.log("Result:", res);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
