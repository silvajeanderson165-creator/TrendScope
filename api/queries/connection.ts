import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    let url = env.databaseUrl;
    if (url.includes("sslaccept=strict")) {
      url = url.replace("sslaccept=strict", "ssl={\"rejectUnauthorized\":true}");
    } else if (!url.includes("ssl=")) {
      url += url.includes("?") ? "&ssl={\"rejectUnauthorized\":true}" : "?ssl={\"rejectUnauthorized\":true}";
    }

    const poolConnection = mysql.createPool(url);
    
    instance = drizzle(poolConnection, {
      mode: "default", // planetscale mode is for PlanetScale HTTP driver, not mysql2 TCP driver!
      schema: fullSchema,
    });
  }
  return instance;
}
