import { Router } from "express";

const router = Router();

const ALLOWED_HOSTS = [
  "handwrytten.com",
  "app.handwrytten.com",
  "cdn.handwrytten.com",
  "images.handwrytten.com",
  "s3.amazonaws.com",
  "s3.us-east-1.amazonaws.com",
  "handwrytten-images.s3.amazonaws.com",
  "handwrytten-cards.s3.amazonaws.com",
];

router.get("/card-proxy", async (req, res) => {
  const raw = req.query["url"];
  if (typeof raw !== "string" || !raw) {
    res.status(400).end();
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    res.status(400).end();
    return;
  }

  if (parsed.protocol !== "https:") {
    res.status(400).end();
    return;
  }

  const host = parsed.hostname.toLowerCase();
  const allowed = ALLOWED_HOSTS.some(h => host === h || host.endsWith(`.${h}`));
  if (!allowed) {
    res.status(403).end();
    return;
  }

  try {
    const upstream = await fetch(raw, {
      headers: { "User-Agent": "FIForgot-Demo-Mailer/1.0" },
    });

    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }

    const ct = upstream.headers.get("content-type") ?? "image/jpeg";
    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const buf = await upstream.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch {
    res.status(502).end();
  }
});

export default router;
