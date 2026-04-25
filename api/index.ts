import { Hono } from "hono";
import { handle } from "hono/vercel";
import { bodyLimit } from "hono/body-limit";
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

// ─── Vercel Serverless Runtime ──────────────────────────────────
export const config = {
  runtime: "nodejs",    // Força Node.js runtime (não Edge)
  maxDuration: 30,      // 30s timeout (Hobby max)
};

// ─── Schema (inline para evitar problemas de path alias) ────────
const searches = mysqlTable("searches", {
  id: serial("id").primaryKey(),
  query: varchar("query", { length: 255 }).notNull().unique(),
  count: int("count").notNull().default(1),
  resultados_curados: json("resultados_curados"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

// ─── Database connection ────────────────────────────────────────
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!dbInstance) {
    const url = process.env.DATABASE_URL ?? "";
    if (!url) {
      console.error("[DB] DATABASE_URL not set!");
    }
    const client = connect({ url });
    dbInstance = drizzle({ client });
  }
  return dbInstance;
}

// ─── tRPC Setup ─────────────────────────────────────────────────
type TrpcContext = { req: Request; resHeaders: Headers };

const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });
const createRouter = t.router;
const publicQuery = t.procedure;

async function createContext(opts: { req: Request; resHeaders: Headers }): Promise<TrpcContext> {
  return { req: opts.req, resHeaders: opts.resHeaders };
}

// ─── Constants ──────────────────────────────────────────────────
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1504711434969-e33886168fb5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
];

// ─── In-Memory Cache ────────────────────────────────────────────
const cache = new Map<string, { results: any[]; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(query: string): any[] | null {
  const entry = cache.get(query);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(query);
    return null;
  }
  return entry.results;
}

function setCached(query: string, results: any[]) {
  cache.set(query, { results, ts: Date.now() });
  if (cache.size > 500) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
}

// ─── Rate Limiting ──────────────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ─── Helpers ────────────────────────────────────────────────────
function sanitizeQuery(q: string): string {
  return q.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
}

function generateMockResults(query: string) {
  const topics = [
    {
      title: `${query}: O guia definitivo para dominar em 2026`,
      description: `Descubra tudo sobre ${query} neste guia completo.`,
      url: `https://exemplo.com/guia-${query.toLowerCase().replace(/\s+/g, "-")}`,
    },
    {
      title: `Como ${query} está revolucionando mercados globais`,
      description: `Análise profunda do impacto de ${query} em diferentes indústrias.`,
      url: `https://tecnologia.com/${query.toLowerCase().replace(/\s+/g, "-")}-revolucao`,
    },
    {
      title: `7 estratégias com ${query} que geram resultados extraordinários`,
      description: `Táticas validadas por especialistas sobre ${query}.`,
      url: `https://estrategias.com/${query.toLowerCase().replace(/\s+/g, "-")}-estrategias`,
    },
    {
      title: `${query}: O que mudou em 2026 e o que vem pela frente`,
      description: `Atualização completa sobre ${query}.`,
      url: `https://futuro.com/${query.toLowerCase().replace(/\s+/g, "-")}-2026`,
    },
    {
      title: `Estudo completo: ${query} na prática — casos reais analisados`,
      description: `Pesquisa aprofundada com dados de implementação real de ${query}.`,
      url: `https://estudo.com/${query.toLowerCase().replace(/\s+/g, "-")}-casos`,
    },
  ];

  return topics.map((topic, index) => ({
    id: `mock-${index}`,
    title: topic.title,
    description: topic.description,
    url: topic.url,
    image: MOCK_IMAGES[index % MOCK_IMAGES.length],
    source: new URL(topic.url).hostname.replace("www.", ""),
    date: new Date(Date.now() - index * 86400000).toLocaleDateString("pt-BR"),
    isMock: true,
  }));
}

async function fetchOgImage(targetUrl: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1",
        Accept: "text/html",
      },
      signal: controller.signal,
    }).catch(() => null);

    if (res && res.ok) {
      const html = await res.text().catch(() => "");
      clearTimeout(timeout);

      const ogMatch =
        html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["'](?:og:image|twitter:image)["']/i);

      if (ogMatch && ogMatch[1]) {
        let imageUrl = ogMatch[1];
        if (imageUrl.startsWith("/")) {
          const baseUrl = new URL(targetUrl).origin;
          imageUrl = baseUrl + imageUrl;
        }
        return imageUrl;
      }
    } else {
      clearTimeout(timeout);
    }
  } catch {
    // ignore timeout/network errors
  }

  return `https://s0.wordpress.com/mshots/v1/${encodeURIComponent(targetUrl)}?w=600&h=400`;
}

async function trySerperSearch(query: string): Promise<any[] | null> {
  const apiKey = process.env.SERPER_API_KEY ?? "";
  if (!apiKey) {
    console.log("[SERPER] API key not configured");
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, gl: "br", hl: "pt-br", num: 5 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.log(`[SERPER] Failed with status ${response.status}`);
      return null;
    }

    const data = (await response.json()) as any;
    const organic = data.organic || [];

    const results: any[] = [];

    for (let i = 0; i < Math.min(organic.length, 5); i++) {
      const item = organic[i];
      results.push({
        id: `serper-${i}`,
        title: item.title,
        description: item.snippet,
        url: item.link,
        image: item.imageUrl || "",
        source: new URL(item.link).hostname.replace("www.", ""),
        date: item.date || new Date(Date.now() - i * 86400000).toLocaleDateString("pt-BR"),
        isMock: false,
      });
    }

    // Fetch OG images for results that don't have one
    if (results.length > 0) {
      await Promise.all(
        results.map(async (r) => {
          if (!r.image) {
            r.image = await fetchOgImage(r.url);
          }
        })
      );
      return results;
    }
  } catch (e) {
    console.log("[SERPER] Network error:", e);
  }

  return null;
}

async function persistSearch(query: string, results: any[] | null = null) {
  try {
    const db = getDb();
    const existing = await db.select().from(searches).where(eq(searches.query, query)).limit(1);

    if (existing.length > 0) {
      await db
        .update(searches)
        .set({
          count: sql`${searches.count} + 1`,
          ...(results ? { resultados_curados: results } : {}),
        })
        .where(eq(searches.id, existing[0].id));
    } else {
      await db.insert(searches).values({
        query,
        count: 1,
        ...(results ? { resultados_curados: results } : {}),
      });
    }
  } catch {
    // DB errors should not break search
  }
}

// ─── Router ─────────────────────────────────────────────────────
const searchRouter = createRouter({
  search: publicQuery
    .input(z.object({ query: z.string().min(1).max(200) }))
    .query(async ({ input, ctx }) => {
      const rawIp = ctx.req.headers.get("x-forwarded-for") || ctx.req.headers.get("x-real-ip") || "anonymous";
      const ip = rawIp.split(",")[0].trim();

      if (!checkRateLimit(ip)) {
        throw new Error("RATE_LIMITED");
      }

      const cleanQuery = sanitizeQuery(input.query);

      // Safe persist with 2s timeout to avoid cold-start DB hangs
      const safePersist = async (q: string, res: any[]) => {
        await Promise.race([persistSearch(q, res), new Promise((resolve) => setTimeout(resolve, 2000))]).catch(() => {});
      };

      // Try cache first
      const cached = getCached(cleanQuery);
      if (cached) {
        safePersist(cleanQuery, cached); // fire and forget
        return { results: cached, query: cleanQuery, source: "cache" };
      }

      const realResults = await trySerperSearch(cleanQuery);

      if (realResults && realResults.length > 0) {
        setCached(cleanQuery, realResults);
        safePersist(cleanQuery, realResults); // fire and forget
        return { results: realResults, query: cleanQuery, source: "serper" };
      }

      const mockResults = generateMockResults(cleanQuery);
      setCached(cleanQuery, mockResults);
      safePersist(cleanQuery, mockResults); // fire and forget

      return {
        results: mockResults,
        query: cleanQuery,
        source: "demo",
        notice: "Resultados de demonstração. Configure SERPER_API_KEY para buscas reais.",
      };
    }),

  popular: publicQuery.query(async () => {
    try {
      const db = getDb();
      const popular = await db.select().from(searches).orderBy(desc(searches.count)).limit(8);
      return { searches: popular };
    } catch {
      return {
        searches: [
          { query: "Inteligência Artificial", count: 42 },
          { query: "Marketing Digital", count: 38 },
          { query: "Programação", count: 35 },
          { query: "Design UX", count: 31 },
          { query: "Empreendedorismo", count: 28 },
          { query: "Data Science", count: 25 },
        ],
      };
    }
  }),

  stats: publicQuery.query(async () => {
    try {
      const db = getDb();
      const totalSearches = await db.select({ total: sql<number>`COALESCE(SUM(count), 0)` }).from(searches);
      const uniqueQueries = await db.select({ count: sql<number>`COUNT(*)` }).from(searches);

      return {
        totalSearches: totalSearches[0]?.total || 0,
        uniqueQueries: uniqueQueries[0]?.count || 0,
        uptimeDays: 99.9,
      };
    } catch {
      return { totalSearches: 1247, uniqueQueries: 312, uptimeDays: 99.9 };
    }
  }),
});

const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  search: searchRouter,
});

// ─── Hono App ───────────────────────────────────────────────────
const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default handle(app);
