export default function handler(req, res) {
  res.status(200).json({ result: { data: { json: { ok: true, ts: Date.now() } } } });
}
