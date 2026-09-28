"use strict";
const express = require("express");
const path = require("path");
const os = require("os");
const { execFile } = require("child_process");
const store = require("./store");
const gw = require("./gateway");
const signs = require("./signs");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

const MYANMAR_MONTHS = [
  "ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်",
  "ဇူလိုင်", "ဩဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ",
];
const MYANMAR_WEEKDAYS = ["တနင်္ဂနွေ", "တနင်္လာ", "အင်္ဂါ", "ဗုဒ္ဓဟူး", "ကြာသပတေး", "သောကြာ", "စနေ"];

function todayStr(tz = "Asia/Yangon") {
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}
function todayMy(tz = "Asia/Yangon") {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  return `${MYANMAR_WEEKDAYS[d.getDay()]}နေ့၊ ${MYANMAR_MONTHS[d.getMonth()]} ${toMyDigits(d.getDate())} ရက်၊ ${toMyDigits(d.getFullYear())} ခုနှစ်`;
}
function toMyDigits(n) {
  return String(n).replace(/\d/g, (c) => "၀၁၂၃၄၅၆၇၈၉"[+c]);
}

function creds() {
  return {
    baseUrl: store.getSetting("gateway_base_url") || gw.DEFAULT_BASE_URL,
    apiKey: store.getSecret("gateway_api_key"),
    model: store.getSetting("gateway_model") || gw.DEFAULT_MODEL,
  };
}

// ---- simple in-memory per-IP daily rate limiter ----
const buckets = new Map();
function rateLimit(key, maxPerDay) {
  const day = todayStr();
  const k = `${day}:${key}`;
  const n = (buckets.get(k) || 0) + 1;
  buckets.set(k, n);
  if (buckets.size > 5000) buckets.clear();
  return n <= maxPerDay ? null : maxPerDay;
}
function clientIp(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.ip || "local";
}

// ---- status / settings (gateway key stays server-side) ----
app.get("/api/status", (req, res) => {
  const c = creds();
  res.json({
    gatewayConfigured: Boolean(c.apiKey),
    ephemeralKey: store.isEphemeralKey(),
    baseUrl: c.baseUrl,
    model: c.model,
    dates: store.readingDates(),
  });
});

app.get("/api/settings", (req, res) => {
  const c = creds();
  res.json({ baseUrl: c.baseUrl, model: c.model, hasKey: Boolean(c.apiKey) });
});

app.post("/api/settings", (req, res) => {
  const { baseUrl, apiKey, model } = req.body || {};
  if (baseUrl) store.setSetting("gateway_base_url", String(baseUrl).trim());
  if (apiKey) store.setSecret("gateway_api_key", String(apiKey));
  if (model) store.setSetting("gateway_model", String(model));
  res.json({ ok: true, hasKey: Boolean(creds().apiKey) });
});

app.post("/api/settings/test", async (req, res) => {
  try {
    const c = creds();
    if (!c.apiKey) return res.status(400).json({ ok: false, error: "no-key" });
    const models = await gw.listModels(c.baseUrl, c.apiKey);
    res.json({ ok: true, count: models.length });
  } catch (e) {
    res.status(502).json({ ok: false, error: String(e.message || e).slice(0, 300) });
  }
});

app.get("/api/models", async (req, res) => {
  try {
    const c = creds();
    if (!c.apiKey) return res.status(400).json({ error: "no-key" });
    res.json({ models: await gw.listModels(c.baseUrl, c.apiKey) });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e).slice(0, 300) });
  }
});

// ---- signs ----
app.get("/api/signs", (req, res) => {
  res.json({ days: signs.DAYS, zodiacs: signs.ZODIACS });
});

// ---- daily reading (served from sqlite; generates on demand if gateway configured) ----
async function getOrGenerate(system, key) {
  const date = todayStr();
  const sign = signs.findSign(system, key);
  if (!sign) throw Object.assign(new Error("bad-sign"), { status: 400 });
  const row = store.getReading(date, system, key);
  if (row) return { date, system, sign, reading: JSON.parse(row.content_json), cached: true };

  const c = creds();
  if (!c.apiKey) throw Object.assign(new Error("not-generated"), { status: 404 });
  const extraMy =
    system === "zodiac"
      ? `ရာသီရက်စွဲ: ${sign.dates_my}`
      : `စိုးမိုးဂြိုဟ်: ${sign.planet_my} (${sign.planet_en})`;
  const raw = await gw.chatCompletion(
    c.baseUrl,
    c.apiKey,
    c.model,
    gw.DAILY_SYSTEM,
    gw.dailyUserPrompt({ system, signMy: sign.my, signEn: sign.en, extraMy, dateMy: todayMy() }),
    { maxTokens: 1500, temperature: 0.9 }
  );
  const reading = gw.validateReading(gw.extractJson(raw));
  store.upsertReading(date, system, key, JSON.stringify(reading));
  return { date, system, sign, reading, cached: false };
}

app.get("/api/daily", async (req, res) => {
  try {
    const { system, key } = req.query;
    if (system !== "day" && system !== "zodiac")
      return res.status(400).json({ error: "bad-system" });
    const out = await getOrGenerate(system, String(key || ""));
    res.json({ ...out, dateMy: todayMy() });
  } catch (e) {
    const status = e.status || 502;
    res.status(status).json({ error: String(e.message || e).slice(0, 200) });
  }
});

// ---- mahabote (fully deterministic, no AI needed) ----
app.get("/api/mahabote", (req, res) => {
  const year = Number(req.query.year);
  const nowY = new Date().getFullYear();
  if (!Number.isInteger(year) || year < 1900 || year > nowY)
    return res.status(400).json({ error: "bad-year" });
  res.json({ birthYear: year, ...signs.mahaboteFor(year), cycle: signs.MAHABOTE.map((m) => ({ my: m.my, en: m.en })) });
});

// ---- dream interpretation ----
app.post("/api/dream", async (req, res) => {
  try {
    const text = String((req.body || {}).text || "").trim().slice(0, 1000);
    if (text.length < 4) return res.status(400).json({ error: "too-short" });
    const over = rateLimit("dream:" + clientIp(req), 5);
    if (over) return res.status(429).json({ error: "rate-limit", limit: over });
    const c = creds();
    if (!c.apiKey) return res.status(400).json({ error: "no-key" });
    const reply = await gw.chatCompletion(c.baseUrl, c.apiKey, c.model, gw.DREAM_SYSTEM,
      `အိပ်မက်အကြောင်း: ${text}`, { maxTokens: 1200, temperature: 0.85 });
    res.json({ interpretation: reply.trim().slice(0, 3000) });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e).slice(0, 300) });
  }
});

// ---- personal Q&A with the astrologer ----
app.post("/api/ask", async (req, res) => {
  try {
    const message = String((req.body || {}).message || "").trim().slice(0, 800);
    if (message.length < 2) return res.status(400).json({ error: "too-short" });
    const over = rateLimit("ask:" + clientIp(req), 10);
    if (over) return res.status(429).json({ error: "rate-limit", limit: over });
    const c = creds();
    if (!c.apiKey) return res.status(400).json({ error: "no-key" });
    const history = Array.isArray((req.body || {}).history) ? req.body.history : [];
    const convo = history
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
      .slice(-6)
      .map((m) => `${m.role === "user" ? "မေးခွန်း" : "ဗေဒင်ဆရာ"}: ${m.text.slice(0, 500)}`)
      .join("\n");
    const user = (convo ? `ယခင်စကားဝိုင်း:\n${convo}\n\n` : "") + `ယခုမေးခွန်း: ${message}`;
    const reply = await gw.chatCompletion(c.baseUrl, c.apiKey, c.model, gw.ASK_SYSTEM, user,
      { maxTokens: 1200, temperature: 0.85 });
    res.json({ reply: reply.trim().slice(0, 3000) });
  } catch (e) {
    res.status(502).json({ error: String(e.message || e).slice(0, 300) });
  }
});

// ---- share card (1080x1080 PNG via python PIL + RAQM) ----
app.get("/api/share-card", async (req, res) => {
  try {
    const { system, key } = req.query;
    if (system !== "day" && system !== "zodiac")
      return res.status(400).json({ error: "bad-system" });
    const sign = signs.findSign(system, String(key || ""));
    if (!sign) return res.status(400).json({ error: "bad-sign" });
    const out = await getOrGenerate(system, sign.key); // ensures today's reading exists
    const pngPath = path.join(os.tmpdir(), `shwe-baydin-${system}-${sign.key}-${out.date}.png`);
    const script = path.join(__dirname, "..", "scripts", "share_card.py");
    const datemy = todayMy();
    await new Promise((resolve, reject) => {
      execFile(
        "python3",
        [script, "--db", store.dbPath, "--system", system, "--key", sign.key,
         "--name", sign.my, "--date", out.date, "--datemy", datemy, "--out", pngPath],
        { timeout: 60000 },
        (err, stdout, stderr) => (err ? reject(new Error((stderr || err.message).slice(0, 300))) : resolve(stdout))
      );
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `inline; filename="shwe-baydin-${sign.key}.png"`);
    res.sendFile(pngPath);
  } catch (e) {
    const status = e.status || 502;
    res.status(status).json({ error: String(e.message || e).slice(0, 300) });
  }
});

const PORT = process.env.PORT || 3102;
app.listen(PORT, () => console.log(`shwe-baydin listening on :${PORT}`));
