# ရွှေဗေဒင် (Shwe Baydin)

Burmese AI horoscope app — daily horoscope readings (Myanmar 7 weekdays + 12 zodiac),
Mahabote (မဟာဘုတ်) calculator, dream interpretation (အိပ်မက်အဓိပ္ပာယ်),
personal astrology Q&A, and 1080×1080 share cards.

**Tech Stack 2:** Node.js + Express + `node:sqlite` + vanilla JS.
AI via the user's Claude N Codex OpenAI-compatible gateway (chat models).

## Run locally

```bash
npm install
npm start          # http://localhost:3102
```

1. Open **⚙ Settings**, enter your Gateway URL + API key (stored server-side,
   AES-256-GCM encrypted — it never reaches the browser), pick a model,
   and press **Test connection**.
2. Generate today's readings: `npm run generate-daily`
   (or open any sign — the app generates on demand and caches).

Set `APP_SECRET` (≥16 chars) so the saved key survives restarts,
and `PORT` / `DATA_DIR` as needed.

## Daily cron

```cron
30 0 * * * cd /path/to/shwe-baydin && npm run generate-daily >> /tmp/shwe-baydin-cron.log 2>&1
```

The script generates 7 weekday + 12 zodiac readings once per day and caches
them in sqlite — all users share the cache, so gateway cost stays tiny.

## API

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

## Security notes

- The gateway API key is encrypted with AES-256-GCM and stored in sqlite;
  it is never sent to the browser or written to logs.
- `data/` (sqlite) and `.env` are git-ignored — never commit them.
