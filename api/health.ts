// Minimal test - absolutely nothing imported except Vercel handler
export default function handler(req, res) {
  res.status(200).json({ ok: true, ts: Date.now(), msg: "alive" });
}
