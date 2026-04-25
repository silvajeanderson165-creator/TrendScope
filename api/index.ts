import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono();

app.get("/api/trpc/ping", (c) => {
  return c.json({ result: { data: { json: { ok: true, ts: Date.now() } } } });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default handle(app);
