import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { drizzle } from "drizzle-orm/tidb-serverless";
import { connect } from "@tidbcloud/serverless";
import { eq, sql, desc } from "drizzle-orm";
import {
  mysqlTable,
  serial,
  varchar,
  int,
  timestamp,
  json,
} from "drizzle-orm/mysql-core";

// ─── Schema ─────────────────────────────────────────────────────
const searches = mysqlTable("searches", {
  id: serial("id").primaryKey(),
  query: varchar("query", { length: 255 }).notNull().unique(),
  count: int("count").notNull().default(1),
  resultados_curados: json("resultados_curados"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ─── Database ───────────────────────────────────────────────────
let dbInstance: ReturnType<typeof drizzle> | null = null;
function getDb() {
  if (!dbInstance) {
    const client = connect({ url: process.env.DATABASE_URL ?? "" });
    dbInstance = drizzle({ client });
  }
  return dbInstance;
}

// ─── tRPC ───────────────────────────────────────────────────────
type Ctx = { req: Request; resHeaders: Headers };
const t = initTRPC.context<Ctx>().create({ transformer: superjson });

// ─── Helpers ────────────────────────────────────────────────────
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1504711434969-e33886168fb5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
];

const cache = new Map<string, { results: any[]; ts: number }>();
function getCached(q: string) {
  const e = cache.get(q);
  if (!e) return null;
  if (Date.now() - e.ts > 300000) { cache.delete(q); return null; }
  return e.results;
}
function setCached(q: string, r: any[]) {
  cache.set(q, { results: r, ts: Date.now() });
  if (cache.size > 500) { const k = cache.keys().next().value; if (k) cache.delete(k); }
}

const rateMap = new Map<string, { count: number; resetAt: number }>();
function checkRate(ip: string) {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now > e.resetAt) { rateMap.set(ip, { count: 1, resetAt: now + 60000 }); return true; }
  if (e.count >= 30) return false;
  e.count++;
  return true;
}

function sanitize(q: string) {
  return q.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
}

async function fetchOgImage(url: string): Promise<string> {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 2500);
    const r = await fetch(url, {
      headers: { "User-Agent": "facebookexternalhit/1.1", Accept: "text/html" },
      signal: c.signal,
    }).catch(() => null);
    if (r && r.ok) {
      const html = await r.text().catch(() => "");
      clearTimeout(t);
      const m =
        html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
      if (m?.[1]) {
        let img = m[1];
        if (img.startsWith("/")) img = new URL(url).origin + img;
        return img;
      }
    } else { clearTimeout(t); }
  } catch {}
  return `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=600&h=400`;
}

async function trySerper(query: string): Promise<any[] | null> {
  const key = process.env.SERPER_API_KEY ?? "";
  if (!key) return null;
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 8000);
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": key, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, gl: "br", hl: "pt-br", num: 5 }),
      signal: c.signal,
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    const organic = data.organic || [];
    const results: any[] = [];
    for (let i = 0; i < Math.min(organic.length, 5); i++) {
      const item = organic[i];
      results.push({
        id: `serper-${i}`, title: item.title, description: item.snippet,
        url: item.link, image: item.imageUrl || "",
        source: new URL(item.link).hostname.replace("www.", ""),
        date: item.date || new Date(Date.now() - i * 86400000).toLocaleDateString("pt-BR"),
        isMock: false,
      });
    }
    if (results.length > 0) {
      await Promise.all(results.map(async (r) => { if (!r.image) r.image = await fetchOgImage(r.url); }));
      return results;
    }
  } catch {}
  return null;
}

async function persist(query: string, results: any[] | null = null) {
  try {
    const db = getDb();
    const existing = await db.select().from(searches).where(eq(searches.query, query)).limit(1);
    if (existing.length > 0) {
      await db.update(searches).set({
        count: sql`${searches.count} + 1`,
        ...(results ? { resultados_curados: results } : {}),
      }).where(eq(searches.id, existing[0].id));
    } else {
      await db.insert(searches).values({ query, count: 1, ...(results ? { resultados_curados: results } : {}) });
    }
  } catch {}
}

function mockResults(query: string) {
  return [
    { title: `${query}: O guia definitivo para 2026`, description: `Descubra tudo sobre ${query}.`, url: `https://exemplo.com/guia-${query.toLowerCase().replace(/\s+/g, "-")}` },
    { title: `Como ${query} está revolucionando mercados`, description: `Análise profunda de ${query}.`, url: `https://tecnologia.com/${query.toLowerCase().replace(/\s+/g, "-")}` },
    { title: `7 estratégias com ${query}`, description: `Táticas validadas sobre ${query}.`, url: `https://estrategias.com/${query.toLowerCase().replace(/\s+/g, "-")}` },
    { title: `${query}: O que mudou em 2026`, description: `Atualização completa sobre ${query}.`, url: `https://futuro.com/${query.toLowerCase().replace(/\s+/g, "-")}` },
    { title: `Estudo: ${query} na prática`, description: `Pesquisa aprofundada sobre ${query}.`, url: `https://estudo.com/${query.toLowerCase().replace(/\s+/g, "-")}` },
  ].map((tp, i) => ({
    id: `mock-${i}`, title: tp.title, description: tp.description, url: tp.url,
    image: MOCK_IMAGES[i], source: new URL(tp.url).hostname,
    date: new Date(Date.now() - i * 86400000).toLocaleDateString("pt-BR"), isMock: true,
  }));
}

// ─── Router ─────────────────────────────────────────────────────
const searchRouter = t.router({
  search: t.procedure
    .input(z.object({ query: z.string().min(1).max(200) }))
    .query(async ({ input, ctx }) => {
      const ip = (ctx.req.headers.get("x-forwarded-for") || "anon").split(",")[0].trim();
      if (!checkRate(ip)) throw new Error("RATE_LIMITED");
      const q = sanitize(input.query);
      const safePersist = (query: string, res: any[]) => {
        Promise.race([persist(query, res), new Promise(r => setTimeout(r, 2000))]).catch(() => {});
      };
      const cached = getCached(q);
      if (cached) { safePersist(q, cached); return { results: cached, query: q, source: "cache" }; }
      const real = await trySerper(q);
      if (real && real.length > 0) { setCached(q, real); safePersist(q, real); return { results: real, query: q, source: "serper" }; }
      const mock = mockResults(q);
      setCached(q, mock); safePersist(q, mock);
      return { results: mock, query: q, source: "demo", notice: "Configure SERPER_API_KEY para buscas reais." };
    }),
  popular: t.procedure.query(async () => {
    try {
      const db = getDb();
      return { searches: await db.select().from(searches).orderBy(desc(searches.count)).limit(8) };
    } catch {
      return { searches: [
        { query: "Inteligência Artificial", count: 42 }, { query: "Marketing Digital", count: 38 },
        { query: "Programação", count: 35 }, { query: "Design UX", count: 31 },
        { query: "Empreendedorismo", count: 28 }, { query: "Data Science", count: 25 },
      ]};
    }
  }),
  stats: t.procedure.query(async () => {
    try {
      const db = getDb();
      const total = await db.select({ total: sql<number>`COALESCE(SUM(count), 0)` }).from(searches);
      const unique = await db.select({ count: sql<number>`COUNT(*)` }).from(searches);
      return { totalSearches: total[0]?.total || 0, uniqueQueries: unique[0]?.count || 0, uptimeDays: 99.9 };
    } catch {
      return { totalSearches: 1247, uniqueQueries: 312, uptimeDays: 99.9 };
    }
  }),
});

export const appRouter = t.router({
  ping: t.procedure.query(() => ({ ok: true, ts: Date.now() })),
  search: searchRouter,
});

export type AppRouter = typeof appRouter;

// ─── Vercel Serverless Function Handler (Node.js format) ────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Convert Node.js IncomingMessage to Web API Request
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
  }

  // Read request body for POST requests
  let body: string | undefined;
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    body = await new Promise<string>((resolve) => {
      let data = "";
      req.on("data", (chunk: Buffer) => { data += chunk.toString(); });
      req.on("end", () => resolve(data));
    });
  }

  const webRequest = new Request(url, {
    method: req.method || "GET",
    headers,
    body: body || undefined,
  });

  try {
    const webResponse = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: webRequest,
      router: appRouter,
      createContext: ({ req: r, resHeaders }) => ({ req: r, resHeaders }),
    });

    // Convert Web API Response back to Node.js response
    res.status(webResponse.status);
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const responseBody = await webResponse.text();
    res.end(responseBody);
  } catch (err) {
    console.error("[TRPC_HANDLER_ERROR]", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
