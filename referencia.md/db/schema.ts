import {
  mysqlTable,
  serial,
  varchar,
  int,
  timestamp,
  json,
} from "drizzle-orm/mysql-core";

export const searches = mysqlTable("searches", {
  id: serial("id").primaryKey(),
  query: varchar("query", { length: 255 }).notNull().unique(),
  count: int("count").notNull().default(1),
  resultados_curados: json("resultados_curados"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

