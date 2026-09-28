/* Shared: i18n (my default), nav, header, helpers */
"use strict";

const I18N = {
  my: {
    tagline: "နေ့စဉ်ဗေဒင် • မဟာဘုတ် • အိပ်မက်အဓိပ္ပာယ်",
    nav_home: "ပင်မ", nav_daily: "နေ့စဉ်", nav_mahabote: "မဟာဘုတ်",
    nav_dream: "အိပ်မက်", nav_ask: "မေးခန်း",
    hero_title: "မင်္ဂလာပါ 🙏",
    hero_sub: "ယနေ့အတွက် သင့်ကံကြမ္မာကို ဗေဒင်ဆရာကြီးနှင့် အတူ ကြည့်ရှုလိုက်ပါ",
    choose_system: "ဗေဒင်စနစ် ရွေးချယ်ပါ",
    sys_day: "၇ ရက်သား", sys_day_sub: "မွေးနေ့အလိုက် မြန်မာ့ဗေဒင်",
    sys_zodiac: "၁၂ ရာသီခွင်", sys_zodiac_sub: "ရာသီခွင်အလိုက်",
    choose_sign: "သင့်မွေးနေ့ / ရာသီ ရွေးပါ",
    quick: "အခြားဝန်ဆောင်မှုများ",
    q_mahabote: "🔮 မဟာဘုတ် တွက်ရန်", q_mahabote_sub: "မွေးသက္ကရာဇ်ထည့်ပြီး တွက်မယ်",
    q_dream: "🌙 အိပ်မက်အဓိပ္ပာယ်", q_dream_sub: "အိပ်မက်ကို အဓိပ္ပာယ်ဖွင့်မယ်",
    q_ask: "💬 ဗေဒင်မေးခန်း", q_ask_sub: "ဆရာနှင့် တိုက်ရိုက်မေးမြန်းမယ်",
    need_key: "⚠ AI ဝန်ဆောင်မှုသုံးရန် Settings မှာ Gateway API key ထည့်ပေးပါ",
    go_settings: "Settings သို့သွားရန်",
    love: "❤ အချစ်ရေး", career: "💼 အလုပ်/စီးပွား", health: "🌿 ကျန်းမာရေး",
    lucky_number: "ကံကောင်းဂဏန်း", lucky_color: "ကံကောင်းအရောင်", advice: "💡 ယနေ့အကြံပြုချက်",
    share: "📤 Share Card ရယူရန်", back_home: "← ပင်မသို့ပြန်ရန်",
    loading: "ဗေဒင်ဆရာ တွက်ချက်နေပါသည်…",
    not_generated: "ယနေ့ဟောစာတမ်း မထုတ်ရသေးပါ။ Settings မှာ API key ထည့်ထားလျှင် အလိုအလျောက်ထုတ်ပေးပါမည်။",
    err: "အမှားတစ်ခု ဖြစ်ပေါ်နေပါသည်။ ထပ်ကြိုးစားကြည့်ပါ။",
    rate: "ယနေ့အသုံးပြုခွင့် ကုန်ဆုံးပါပြီ။ မနက်ဖြန် ပြန်လာခဲ့ပါ 🙏",
    mahabote_title: "မဟာဘုတ် တွက်ချက်ရန်",
    mahabote_sub: "မွေးသက္ကရာဇ် (ခရစ်နှစ်) ထည့်ပါ — ဥပမာ ၁၉၉၀",
    birth_year: "မွေးသက္ကရာဇ်",
    calc: "တွက်ချက်ရန်",
    your_mahabote: "ယခုနှစ် သင့်မဟာဘုတ်",
    dream_title: "အိပ်မက်အဓိပ္ပာယ် ဖွင့်ရန်",
    dream_sub: "မက်ခဲ့သောအိပ်မက်ကို ရေးထည့်ပါ (တစ်နေ့ ၅ ကြိမ်)",
    dream_ph: "ဥပမာ — ရေထဲမှာ ငါးကြီးတစ်ကောင် ဖမ်းမိတယ်လို့ အိပ်မက်မက်တယ်…",
    interpret: "အဓိပ္ပာယ်ဖွင့်ရန်",
    ask_title: "အသေးစိတ်ဗေဒင်မေးခန်း",
    ask_sub: "ဗေဒင်ဆရာကြီးကို တိုက်ရိုက်မေးမြန်းနိုင်ပါသည် (တစ်နေ့ ၁၀ ကြိမ်)",
    ask_ph: "မေးခွန်းရေးပါ… ဥပမာ ဒီနှစ် အလုပ်ပြောင်းသင့်လား",
    send: "ပို့ရန်",
    settings_title: "ဆက်တင်များ",
    gateway_url: "Gateway URL", api_key: "API Key", model: "Model",
    save: "သိမ်းရန်", test_conn: "ချိတ်ဆက်မှု စမ်းရန်",
    saved: "✓ သိမ်းဆည်းပြီးပါပြီ", testing: "စမ်းသပ်နေပါသည်…",
    conn_ok: "✓ ချိတ်ဆက်မှုအောင်မြင်ပါသည်", conn_fail: "✗ ချိတ်ဆက်မှု မအောင်မြင်ပါ",
    key_saved: "API key သိမ်းဆည်းထားပါသည် (လျှို့ဝှက်သိမ်းဆည်းထားသည်)",
    key_empty: "API key မထည့်ရသေးပါ",
    ephemeral_warn: "⚠ APP_SECRET မသတ်မှတ်ထားသဖြင့် server restart လုပ်လျှင် key ပျောက်မည်",
    footer: "ရွှေဗေဒင် • နေ့စဉ်ကံကြမ္မာအဖော်",
    advice_beta: "beta အခမဲ့",
  },
  en: {
    tagline: "Daily horoscope • Mahabote • Dream meanings",
    nav_home: "Home", nav_daily: "Daily", nav_mahabote: "Mahabote",
    nav_dream: "Dream", nav_ask: "Ask",
    hero_title: "Mingalaba 🙏",
    hero_sub: "Discover today's fortune with our master astrologer",
    choose_system: "Choose astrology system",
    sys_day: "7 Weekdays", sys_day_sub: "Myanmar birth-weekday astrology",
    sys_zodiac: "12 Zodiac", sys_zodiac_sub: "Western zodiac, Myanmar names",
    choose_sign: "Choose your birth day / sign",
    quick: "More services",
    q_mahabote: "🔮 Mahabote calculator", q_mahabote_sub: "Enter birth year",
    q_dream: "🌙 Dream interpretation", q_dream_sub: "Reveal your dream's meaning",
    q_ask: "💬 Ask the astrologer", q_ask_sub: "Chat directly with the master",
    need_key: "⚠ Add your Gateway API key in Settings to use AI features",
    go_settings: "Go to Settings",
    love: "❤ Love", career: "💼 Career", health: "🌿 Health",
    lucky_number: "Lucky number", lucky_color: "Lucky color", advice: "💡 Today's advice",
    share: "📤 Get Share Card", back_home: "← Back to home",
    loading: "The astrologer is calculating…",
    not_generated: "Today's reading is not ready yet. It will generate automatically once an API key is set in Settings.",
    err: "Something went wrong. Please try again.",
    rate: "You've reached today's limit. Please come back tomorrow 🙏",
    mahabote_title: "Mahabote calculator",
    mahabote_sub: "Enter birth year (Gregorian) — e.g. 1990",
    birth_year: "Birth year",
    calc: "Calculate",
    your_mahabote: "Your Mahabote this year",
    dream_title: "Dream interpretation",
    dream_sub: "Describe your dream (5 times per day)",
    dream_ph: "e.g. I dreamed of catching a big fish in the river…",
    interpret: "Interpret",
    ask_title: "Personal astrology Q&A",
    ask_sub: "Ask the master astrologer directly (10 times per day)",
    ask_ph: "Type your question… e.g. Should I change jobs this year?",
    send: "Send",
    settings_title: "Settings",
    gateway_url: "Gateway URL", api_key: "API Key", model: "Model",
    save: "Save", test_conn: "Test connection",
    saved: "✓ Saved", testing: "Testing…",
    conn_ok: "✓ Connection successful", conn_fail: "✗ Connection failed",
    key_saved: "API key is saved (stored encrypted)",
    key_empty: "No API key saved yet",
    ephemeral_warn: "⚠ APP_SECRET is not set — the key will be lost on server restart",
    footer: "Shwe Baydin • Your daily fortune companion",
    advice_beta: "free beta",
  },
};

function getLang() {
  return localStorage.getItem("sb_lang") || "my";
}
function setLang(l) {
  localStorage.setItem("sb_lang", l);
  applyI18n();
}
function t(key) {
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || I18N.my[key] || key;
}
function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.querySelectorAll(".lang-toggle button").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === getLang());
  });
  document.documentElement.lang = getLang() === "my" ? "my" : "en";
}

async function api(path, opts) {
  const r = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...(opts || {}),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const e = new Error(data.error || "request-failed");
    e.code = data.error;
    e.limit = data.limit;
    throw e;
  }
  return data;
}

function headerHTML(active) {
  const tabs = [
    ["index.html", "nav_home", "🏠"],
    ["daily.html", "nav_daily", "📿"],
    ["mahabote.html", "nav_mahabote", "🔮"],
    ["dream.html", "nav_dream", "🌙"],
    ["ask.html", "nav_ask", "💬"],
  ];
  return `
    <div class="brand">
      <div class="mark">☸</div>
      <div><h1>ရွှေဗေဒင်</h1><small data-i18n="tagline">${t("tagline")}</small></div>
      <div class="lang-toggle">
        <button data-lang="my" class="${getLang() === "my" ? "active" : ""}">မြန်မာ</button>
        <button data-lang="en" class="${getLang() === "en" ? "active" : ""}">EN</button>
      </div>
    </div>
    <nav class="nav">
      ${tabs.map(([href, key, ic]) =>
        `<a href="${href}" class="${active === href ? "active" : ""}"><span class="ic">${ic}</span><span data-i18n="${key}">${t(key)}</span></a>`
      ).join("")}
    </nav>`;
}

function footerHTML() {
  return `<footer class="foot"><span data-i18n="footer">${t("footer")}</span> • <a href="settings.html" style="color:var(--muted)">⚙</a></footer>`;
}

function keyWarningHTML() {
  return `<div class="card" id="keyWarn" hidden>
    <p style="margin:0">⚠ <span data-i18n="need_key">${t("need_key")}</span><br>
    <a href="settings.html" data-i18n="go_settings">${t("go_settings")}</a></p>
  </div>`;
}

async function checkKey() {
  try {
    const s = await api("/api/status");
    const w = document.getElementById("keyWarn");
    if (w) w.hidden = s.gatewayConfigured;
  } catch { /* offline: leave hidden */ }
}

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  document.querySelectorAll(".lang-toggle button").forEach((b) => {
    b.onclick = () => setLang(b.dataset.lang);
  });
});
