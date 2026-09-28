"use strict";
// Client for the user's OpenAI-compatible gateway + horoscope prompt builders.

const DEFAULT_BASE_URL = "https://claude-n-codex.com:8443/v1";
const DEFAULT_MODEL = "claude-sonnet-5";

async function chatCompletion(baseUrl, apiKey, model, system, user, opts = {}) {
  const url = baseUrl.replace(/\/+$/, "") + "/chat/completions";
  const timeoutMs = opts.timeoutMs || 120000;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: opts.temperature != null ? opts.temperature : 0.9,
        max_tokens: opts.maxTokens || 1500,
      }),
      signal: ctrl.signal,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`gateway HTTP ${res.status}: ${text.slice(0, 300)}`);
    const data = JSON.parse(text);
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("gateway returned no content");
    return content;
  } finally {
    clearTimeout(t);
  }
}

async function listModels(baseUrl, apiKey, timeoutMs = 30000) {
  const url = baseUrl.replace(/\/+$/, "") + "/models";
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Authorization: "Bearer " + apiKey },
      signal: ctrl.signal,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`gateway HTTP ${res.status}: ${text.slice(0, 300)}`);
    const data = JSON.parse(text);
    return (data.data || []).map((m) => m.id).filter(Boolean).sort();
  } finally {
    clearTimeout(t);
  }
}

// Pull a JSON object out of a model reply (handles fenced code blocks too).
function extractJson(text) {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const cand = (fence ? fence[1] : text).trim();
  const start = cand.indexOf("{");
  const end = cand.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("no JSON object in reply");
  return JSON.parse(cand.slice(start, end + 1));
}

const READING_KEYS = ["love", "career", "health", "lucky_number", "lucky_color", "advice"];

function validateReading(obj) {
  if (!obj || typeof obj !== "object") throw new Error("reading is not an object");
  for (const k of READING_KEYS) {
    if (typeof obj[k] !== "string" || !obj[k].trim())
      throw new Error(`reading missing key: ${k}`);
  }
  return {
    love: obj.love.trim().slice(0, 600),
    career: obj.career.trim().slice(0, 600),
    health: obj.health.trim().slice(0, 600),
    lucky_number: obj.lucky_number.trim().slice(0, 40),
    lucky_color: obj.lucky_color.trim().slice(0, 60),
    advice: obj.advice.trim().slice(0, 600),
  };
}

const DAILY_SYSTEM = [
  "You are ရွှေဗေဒင်, an experienced and warm Myanmar ဗေဒင်ဆရာ (astrologer) with deep knowledge of Myanmar traditional astrology — the seven weekday birth signs and their ruling planets (တနင်္ဂနွေ-နေ, တနင်္လာ-လ, အင်္ဂါ-အင်္ဂါ, ဗုဒ္ဓဟူး-ဗုဒ္ဓဟူး, ကြာသပတေး-ကြာသပတေး, သောကြာ-သောကြာ, စနေ-စနေ), the Mahabote (မဟာဘုတ်) seven-year cycle, day-lucky colors, and the twelve zodiac signs.",
  "Write today's horoscope reading in PURE Burmese (Myanmar script only, no English except the JSON keys). Warm, encouraging, personal tone — like a kind elder astrologer speaking directly to the reader. Vary the content every day; never repeat generic filler.",
  "Output ONLY a single valid JSON object with exactly these keys:",
  '{ "love": "အချစ်ရေး 1-2 sentences", "career": "အလုပ်/စီးပွားရေး 1-2 sentences", "health": "ကျန်းမာရေး 1-2 sentences", "lucky_number": "ကံကောင်းဂဏန်း, e.g. ၃, ၇", "lucky_color": "ကံကောင်းအရောင်, e.g. အဝါရောင်", "advice": "ယနေ့အကြံပြုချက် 1-2 sentences" }',
  "Rules: no markdown, no code fences, no extra text outside the JSON. Keep each field concise (under 60 words).",
].join("\n");

function dailyUserPrompt({ system, signMy, signEn, extraMy, dateMy }) {
  const kind =
    system === "zodiac"
      ? `၁၂ ရာသီခွင်ထဲက ${signMy} (${signEn}) ဖွားအတွက်`
      : `၇ ရက်သားသမီးထဲက ${signMy}နေ့ (${signEn}) သားသမီးအတွက်`;
  return [
    `ယနေ့ (${dateMy}) ${kind} နေ့စဉ်ဗေဒင်ဟောစာတမ်းကို ရေးပေးပါ။`,
    extraMy ? `အထောက်အထား: ${extraMy}` : "",
    "JSON format နဲ့ပဲ ပြန်ပေးပါ။",
  ]
    .filter(Boolean)
    .join("\n");
}

const DREAM_SYSTEM = [
  "You are ရွှေဗေဒင်, a wise and warm Myanmar ဗေဒင်ဆရာ who interprets dreams (အိပ်မက်အဓိပ္ပာယ်) using Myanmar traditional dream symbolism and folk wisdom.",
  "Interpret the dream the user describes. Write in PURE Burmese (Myanmar script), warm and reassuring tone, 4-8 sentences: what the key symbols traditionally mean, whether it is an auspicious (နိမိတ်) or cautionary sign, and one gentle piece of advice.",
  "Never claim medical, legal or financial certainty. If the dream mentions danger, be calming, not frightening. Plain text only, no markdown headings.",
].join("\n");

const ASK_SYSTEM = [
  "You are ရွှေဗေဒင်, a warm, experienced Myanmar ဗေဒင်ဆရာ (astrologer). The user asks personal questions about love, career, health, luck, family, or daily life.",
  "Answer in PURE Burmese (Myanmar script), warm and encouraging like a kind elder. Be concise: 3-8 sentences. You may reference Myanmar astrology concepts (weekday birth signs, Mahabote, lucky colors/numbers) naturally when relevant.",
  "Never give medical diagnoses, legal advice, or guaranteed predictions. For serious health/legal/financial matters, gently suggest consulting a qualified professional. Plain text, no markdown.",
].join("\n");

module.exports = {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  chatCompletion,
  listModels,
  extractJson,
  validateReading,
  READING_KEYS,
  DAILY_SYSTEM,
  dailyUserPrompt,
  DREAM_SYSTEM,
  ASK_SYSTEM,
};
