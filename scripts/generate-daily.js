#!/usr/bin/env node
"use strict";
// Generate all daily horoscope readings via the gateway and cache them in sqlite.
// Designed to run once a day from cron (~00:30 Asia/Yangon).
// Usage: npm run generate-daily
const path = require("path");
const store = require(path.join(__dirname, "..", "src", "store"));
const gw = require(path.join(__dirname, "..", "src", "gateway"));
const signs = require(path.join(__dirname, "..", "src", "signs"));

const MYANMAR_MONTHS = [
  "ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်",
  "ဇူလိုင်", "ဩဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ",
];
const MYANMAR_WEEKDAYS = ["တနင်္ဂနွေ", "တနင်္လာ", "အင်္ဂါ", "ဗုဒ္ဓဟူး", "ကြာသပတေး", "သောကြာ", "စနေ"];
const toMyDigits = (n) => String(n).replace(/\d/g, (c) => "၀၁၂၃၄၅၆၇၈၉"[+c]);

function todayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Yangon" });
}
function todayMy() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Yangon" }));
  return `${MYANMAR_WEEKDAYS[d.getDay()]}နေ့၊ ${MYANMAR_MONTHS[d.getMonth()]} ${toMyDigits(d.getDate())} ရက်၊ ${toMyDigits(d.getFullYear())} ခုနှစ်`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const date = process.argv[2] || todayStr();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error("usage: generate-daily [YYYY-MM-DD]  (default: today Asia/Yangon)");
    process.exit(2);
  }
  const baseUrl = store.getSetting("gateway_base_url") || gw.DEFAULT_BASE_URL;
  const apiKey = store.getSecret("gateway_api_key");
  const model = store.getSetting("gateway_model") || gw.DEFAULT_MODEL;
  if (!apiKey) {
    console.error("ERROR: no gateway API key saved. Open the app Settings page and add it first.");
    process.exit(1);
  }

  const jobs = [
    ...signs.DAYS.map((s) => ({ system: "day", sign: s })),
    ...signs.ZODIACS.map((s) => ({ system: "zodiac", sign: s })),
  ];
  const dateMy = date === todayStr() ? todayMy() : date;
  let ok = 0, fail = 0;

  for (const { system, sign } of jobs) {
    if (store.getReading(date, system, sign.key)) {
      console.log(`skip  ${system}/${sign.key} (already cached)`);
      continue;
    }
    const extraMy =
      system === "zodiac"
        ? `ရာသီရက်စွဲ: ${sign.dates_my}`
        : `စိုးမိုးဂြိုဟ်: ${sign.planet_my} (${sign.planet_en})`;
    try {
      const raw = await gw.chatCompletion(
        baseUrl, apiKey, model, gw.DAILY_SYSTEM,
        gw.dailyUserPrompt({ system, signMy: sign.my, signEn: sign.en, extraMy, dateMy }),
        { maxTokens: 1500, temperature: 0.9, timeoutMs: 180000 }
      );
      const reading = gw.validateReading(gw.extractJson(raw));
      store.upsertReading(date, system, sign.key, JSON.stringify(reading));
      ok++;
      console.log(`ok    ${system}/${sign.key}`);
    } catch (e) {
      fail++;
      console.error(`fail  ${system}/${sign.key}: ${String(e.message || e).slice(0, 160)}`);
    }
    await sleep(1500); // be gentle with the gateway
  }

  store.cleanupOldReadings(7);
  console.log(`done: ${ok} generated, ${fail} failed, date=${date}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error("fatal:", e.message);
  process.exit(1);
});
