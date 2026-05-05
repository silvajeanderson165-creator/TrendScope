import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

// ═══════════════════════════════════════════════════════
// 🛡️ PROTOCOLO DE SEGURANÇA ENTERPRISE — TRENDSCOPE
// ═══════════════════════════════════════════════════════

const app = new Hono<{ Bindings: HttpBindings }>();

// [SEGURANÇA] Headers HTTP de proteção (equivalente ao Helmet para Hono)
// Configura: X-Content-Type-Options, X-Frame-Options, HSTS, CSP, etc.
app.use(secureHeaders());

// [SEGURANÇA] CORS Restrito — Aceita APENAS o frontend autorizado
app.use(cors({
  origin: [
    'https://trend-scope.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  credentials: true,
}));

// [SEGURANÇA] Limite de body (anti payload bomb)
app.use(bodyLimit({ maxSize: 1 * 1024 * 1024 })); // 1MB (reduzido de 50MB)

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction && !process.env.VERCEL) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
