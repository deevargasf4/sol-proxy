const SECRET = "DVF4-8bd3fb9b8a30aa93c2b12c54";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const key = req.headers["x-api-key"] || "";
  if (key !== SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const qs     = req.url.includes("?") ? req.url.slice(req.url.indexOf("?") + 1) : "";
    const params = new URLSearchParams(qs);
    const path   = params.get("path") || "quote";
    params.delete("path");
    const rest   = params.toString();
    const jupUrl = `https://quote-api.jup.ag/v6/${path}${rest ? "?" + rest : ""}`;

    const options = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
    };
    if (req.method === "POST" && req.body) {
      options.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const upstream = await fetch(jupUrl, options);
    const text = await upstream.text();

    try {
      const json = JSON.parse(text);
      res.status(upstream.status).json(json);
    } catch {
      res.status(upstream.status).send(text);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
