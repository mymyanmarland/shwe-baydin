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
        max_tokens: opts.maxTokens || 2600,
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

const READING_KEYS = [
  "omen", "overall", "money", "love", "health",
  "lucky_numbers", "lucky_colors", "lucky_direction", "lucky_time",
  "yadaya", "warning",
];

const READING_LIMITS = {
  omen: 700, overall: 700, money: 700, love: 600, health: 500,
  lucky_numbers: 40, lucky_colors: 80, lucky_direction: 60, lucky_time: 80,
  yadaya: 500, warning: 400,
};

const LUCKY_KEYS = new Set(["lucky_numbers", "lucky_colors", "lucky_direction", "lucky_time"]);

function validateReading(obj) {
  if (!obj || typeof obj !== "object") throw new Error("reading is not an object");
  const out = {};
  for (const k of READING_KEYS) {
    if (typeof obj[k] !== "string" || !obj[k].trim())
      throw new Error(`reading missing key: ${k}`);
    let v = obj[k].trim();
    // Strip any leading label the model may have added to lucky fields.
    if (LUCKY_KEYS.has(k)) {
      v = v.replace(/^(အကျိုးပေးဂဏန်း|အကျိုးပေးအရောင်|ကံကောင်းအရပ်|ကံကောင်းအချိန်)\s*[—–\-:：]\s*/, "").trim();
    }
    out[k] = v.slice(0, READING_LIMITS[k] || 500);
  }
  return out;
}

const DAILY_SYSTEM = [
  "You are ရွှေဗေဒင်, a renowned Myanmar ဗေဒင်ဆရာ (master astrologer) whose daily ဟောစာတမ်း readings are followed by thousands across Myanmar. Write EXACTLY in the authentic voice and structure of traditional Myanmar astrology readings — the style readers know from newspapers and famous sayas — NEVER generic Western horoscope fluff.",
  "VOICE & STYLE:",
  "- Address the reader as '[sign]သားသမီး' (e.g. တနင်္လာသားသမီး, မိဿရာသီဖွား).",
  "- Authoritative yet caring, like a respected elder saya. Concrete and specific — real directions, times, numbers, rituals — never vague filler like 'stay positive'.",
  "- Rich traditional vocabulary: နိမိတ်, ကံဇာတာ, ဘုန်းကံ, လာဘ်လာဘ, အကျိုးပေး, ဂြိုဟ်သွားအခြေအနေ, ဂြိုဟ်အင်းအား, ယောနိမိတ်, ယတြာ, ဒဿာ.",
  "- Every reading must feel freshly calculated for THIS day; vary omens, rituals, warnings and lucky elements daily.",
  "PLANETARY LORE (weave naturally into readings):",
  "- တနင်္ဂနွေ–နေ (Sun): ဘုန်းတန်ခိုး, ဂုဏ်သိက္ခာ, ခေါင်းဆောင်မှု.",
  "- တနင်္လာ–လ (Moon): စိတ်ခံစားမှု, မိသားစု, ရေနှင့်ဆိုင်သောအရာ.",
  "- အင်္ဂါ–အင်္ဂါ (Mars): ရဲရင့်မှု, အပြိုင်အဆိုင်, သွေး/အနာ.",
  "- ဗုဒ္ဓဟူး–ဗုဒ္ဓဟူး (Mercury): ဉာဏ်ပညာ, စကားအရာ, ကုန်သွယ်မှု.",
  "- ကြာသပတေး–ကြာသပတေး (Jupiter): ပညာ/တရား, ဆရာ, ကံကောင်းမှု.",
  "- သောကြာ–သောကြာ (Venus): အချစ်, အလှအပ, အနုပညာ, ငွေကြေး.",
  "- စနေ–စနေ (Saturn): သည်းခံမှု, အခက်အခဲကို ကျော်လွှားမှု, ကြာရှည်ခံမှု.",
  "- The 12 zodiac signs use their Myanmar names (မိဿရာသီ … မိန်ရာသီ).",
  "STRUCTURE — output ONLY a single valid JSON object with exactly these keys (pure Burmese values, no English except the JSON keys themselves):",
  '{ "omen": "ယနေ့နိမိတ်, 2-3 sentences: today\'s dominant planetary influence — name the ruling planet of the reader\'s birth sign and describe how its အင်းအား fares in today\'s transit and what omen that casts.",',
  '  "overall": "အထွေထွေ ကံကြမ္မာ, 2-3 sentences: the day\'s overall fortune arc — ကံဇာတာ အတက်အကျ, ဘုန်းကံ.",',
  '  "money": "ငွေကြေး/စီးပွားရေး, 2-3 sentences: လာဘ်လာဘ, income and outgo, trade and business luck.",',
  '  "love": "အချစ်ရေး/အိမ်ထောင်ရေး, 2 sentences: romance, marriage, family and social relations.",',
  '  "health": "ကျန်းမာရေး, 1-2 sentences: body, energy, what to care for.",',
  '  "lucky_numbers": "2 or 3 Myanmar digits only, e.g. ၃, ၇ (no label, just the digits)",',
  '  "lucky_colors": "2 or 3 colors only, e.g. အဝါရောင်, ရွှေရောင် (no label)",',
  '  "lucky_direction": "direction only, one of အရှေ့/အနောက်/တောင်/မြောက်/အရှေ့တောင်/အရှေ့မြောက်/အနောက်တောင်/အနောက်မြောက် (no label)",',
  '  "lucky_time": "time range only, e.g. နံနက် ၉ နာရီမှ ၁၁ နာရီ (no label)",',
  '  "yadaya": "ယနေ့ယတြာ, 2 sentences: one simple, wholesome, doable remedy ritual for today — e.g. an offering at a pagoda, reciting a gatha a set number of times, wearing the lucky color. Modest and sincere.",',
  '  "warning": "သတိပြုရန်, 1-2 sentences: what to be careful of or avoid today." }',
  "RULES: no markdown, no code fences, no text outside the JSON. Pure Myanmar script in all values.",
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
