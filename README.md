<img src="assets/banner.svg" alt="ရွှေဗေဒင် Shwe Baydin — animated banner" width="100%"/>

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-22.5%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-node%3Asqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://nodejs.org/)
[![Bilingual](https://img.shields.io/badge/%E1%80%BB%E1%80%99%E1%80%94%E1%80%B9%E1%80%99%E1%80%AC_%7C_English-Bilingual-f59e0b?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

**AI နဲ့ နေ့စဉ် ဗေဒင်ဟောစာတမ်း — မြန်မာ့ ၇ ရက်သားနဲ့ ၁၂ ရာသီခွင်**

*AI-powered daily Burmese horoscope — Myanmar 7 weekdays + 12 zodiac signs.*

[✨ Features](#-features--လုပ်ဆောင်ချက်များ) ·
[🖼️ Share Cards](#%EF%B8%8F-share-cards) ·
[🚀 Quick Start](#-quick-start) ·
[🔌 API](#-api)

</div>

<img src="assets/divider.svg" alt="divider" width="100%"/>

## ✨ Features · လုပ်ဆောင်ချက်များ

| | |
|---|---|
| 🔮 **နေ့စဉ်ဟောစာတမ်း** | ၇ ရက်သား + ၁၂ ရာသီခွင် — အချစ်၊ အလုပ်၊ ကျန်းမာရေး၊ ကံကောင်းဂဏန်း/အရောင်၊ ယနေ့အကြံပြုချက် — *AI daily horoscope for all 7 weekdays + 12 zodiac signs* |
| 🌀 **မဟာဘုတ်** | မွေးနှစ်ထည့်ရုံနဲ့ တွက်ချက် — ဘင်္ဂ၊ အထွန်း၊ သရေ၊ အဓိပတိ၊ မရဏ၊ သိုက်၊ ရာဇ — *deterministic Mahabote cycle calculator* |
| 💭 **အိပ်မက်အဓိပ္ပာယ်** | အိပ်မက်ရေးထည့်ရင် AI က မြန်မာလို အဓိပ္ပာယ်ဖွင့်ပေး (တစ်နေ့ ၅ ကြိမ်) — *AI dream interpretation* |
| 💬 **AI မေးခန်း** | ဗေဒင်ဆရာနဲ့ စကားပြောသလို ကိုယ်ပိုင်မေးမြန်း — beta အခမဲ့ (တစ်နေ့ ၁၀ ကြိမ်) — *personal astrology Q&A* |
| 🖼️ **Share Card** | 1080×1080 Facebook share ပုံကဒ် — မြန်မာစာလုံး၀အမှန် — *viral-ready PNG cards* |
| ⚙️ **Settings** | Gateway URL + API key — **AES-256-GCM** encrypted, server-side ပဲခေါ်တယ်၊ frontend ကိုဘယ်တော့မှမရောက် |
| 🌐 **၂ ဘာသာ** | မြန်မာ default + English toggle — mobile-first gold & deep-navy design |

## 🖼️ Share Cards

ဟောစာတမ်းတိုင်းကို Facebook မှာ share လို့ရတဲ့ ပုံကဒ်လှလှထုတ်ပေးတယ် — *every reading becomes a shareable card.*

<div align="center">
<img src="assets/share-card-preview.png" alt="ရွှေဗေဒင် share card preview" width="380"/>
</div>

## ⚙️ How It Works · အလုပ်လုပ်ပုံ

```
cron (daily 00:30) ──► AI generates 19 readings ──► cached in sqlite
                                                            │
user opens app ──► served instantly from cache ─────────────┘
```

- တစ်နေ့စာကို **တစ်ခါတည်း ကြိုထုတ်**ထားတယ် (၇ ရက် + ၁၂ ရာသီ = ၁၉ ခါ gateway ခေါ်ရုံ) — *generated once per day*
- user တွေအားလုံး cache ကနေ ဖတ်တယ် — gateway ကုန်ကျစရိတ် **အနည်းဆုံး** — *all users share the cache, so AI cost stays tiny*
- key မရှိသေးရင်တောင် စာမျက်နှာဖွင့်တာနဲ့ on-demand ထုတ်ပေးတယ် (key ရှိမှ)

## 🚀 Quick Start

Requires **Node.js 22+** (`node:sqlite`).

```bash
npm install
npm start          # http://localhost:3102
```

1. Open **⚙ Settings** — Gateway URL + API key ထည့်၊ model ရွေး၊ **Test connection** နှိပ်
2. Generate today's readings: `npm run generate-daily`
   (သို့မဟုတ် စာမျက်နှာဖွင့်တာနဲ့ auto-generate + cache လုပ်ပေးတယ်)

### Daily cron

```cron
30 0 * * * cd /path/to/shwe-baydin && npm run generate-daily >> /tmp/shwe-baydin-cron.log 2>&1
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3102` | HTTP port |
| `APP_SECRET` | *(random per boot)* | Encrypts the stored gateway key — **set ≥16 chars in production**, or the saved key breaks on restart |
| `DATA_DIR` | `./data` | sqlite directory (gitignored) |

## 🔌 API

| Route | Description |
|---|---|
| `GET /api/status` | gateway configured?, model, cached dates |
| `GET/POST /api/settings`, `POST /api/settings/test`, `GET /api/models` | gateway config (key server-side only) |
| `GET /api/signs` | 7 weekdays + 12 zodiac signs (my/en) |
| `GET /api/daily?system=day\|zodiac&key=mon` | today's reading (cached or generated) |
| `GET /api/mahabote?year=1990` | deterministic Mahabote for birth year |
| `POST /api/dream` `{text}` | dream interpretation (5/day/IP) |
| `POST /api/ask` `{message, history[]}` | astrologer Q&A (10/day/IP, free beta) |
| `GET /api/share-card?system=&key=` | 1080×1080 PNG share card |

## 🏗️ Project Structure

```
src/
  server.js        Express routes (pages + /api/*)
  store.js         node:sqlite schema + AES-256-GCM key storage
  gateway.js       chat completions + astrologer prompt builders
  signs.js         7 weekdays + 12 zodiacs + Mahabote data (my/en)
scripts/
  generate-daily.js   daily cron: generates all 19 readings
  share_card.py       1080×1080 card renderer (PIL + Padauk + RAQM)
public/            vanilla JS frontend, bilingual, mobile-first
assets/            animated README art (banner, footer, divider)
data/              sqlite DB (gitignored — never commit)
```

## 🛣️ Roadmap

- [ ] 💰 Paid detailed readings (KBPay / WavePay)
- [ ] 📣 Facebook Page auto-share of daily cards
- [ ] 🔔 Daily push reminders
- [ ] 📱 PWA + installable mobile app
- [ ] 💑 Name / couple compatibility (စုံတွဲဗေဒင်)
- [ ] 📊 Admin dashboard + usage analytics

## 🤝 Contributing

PR တွေကြိုဆိုပါတယ်! *PRs welcome.*

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push & open a Pull Request

## 📄 License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
<img src="assets/footer.svg" alt="animated gold wave footer" width="100%"/>
<br/>
Made with 🔮 in Myanmar
</div>
