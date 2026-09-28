"use strict";
// SQLite storage + AES-256-GCM encrypted settings (gateway key never stored in plain text).
const { DatabaseSync } = require("node:sqlite");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const dataDir = process.env.DATA_DIR || path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "app.db");
const db = new DatabaseSync(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS daily_readings (
  date TEXT NOT NULL,
  system TEXT NOT NULL,
  sign TEXT NOT NULL,
  content_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (date, system, sign)
);`);

// ---- encryption (APP_SECRET env, per-boot ephemeral fallback with warning) ----
let _key = null;
let _ephemeral = false;
function appKey() {
  if (_key) return _key;
  const s = process.env.APP_SECRET;
  if (s && s.length >= 16) {
    _key = crypto.createHash("sha256").update(String(s)).digest();
  } else {
    _key = crypto.randomBytes(32);
    _ephemeral = true;
    console.warn(
      "[store] APP_SECRET not set — using an ephemeral key. The saved gateway key will NOT survive a restart."
    );
  }
  return _key;
}
function enc(plain) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", appKey(), iv);
  const ct = Buffer.concat([c.update(String(plain), "utf8"), c.final()]);
  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: c.getAuthTag().toString("base64"),
    data: ct.toString("base64"),
  });
}
function dec(payload) {
  const o = JSON.parse(payload);
  const d = crypto.createDecipheriv(
    "aes-256-gcm",
    appKey(),
    Buffer.from(o.iv, "base64")
  );
  d.setAuthTag(Buffer.from(o.tag, "base64"));
  return Buffer.concat([
    d.update(Buffer.from(o.data, "base64")),
    d.final(),
  ]).toString("utf8");
}

function getSetting(key) {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row ? row.value : null;
}
function setSetting(key, value) {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
  ).run(key, value);
}

const SECRET_PREFIX = "enc:";
function getSecret(name) {
  const v = getSetting("secret:" + name);
  if (!v) return null;
  try {
    return v.startsWith(SECRET_PREFIX) ? dec(v.slice(SECRET_PREFIX.length)) : v;
  } catch {
    return null;
  }
}
function setSecret(name, plain) {
  setSetting("secret:" + name, SECRET_PREFIX + enc(plain));
}

// ---- daily readings ----
function upsertReading(date, system, sign, contentJson) {
  db.prepare(
    `INSERT INTO daily_readings (date, system, sign, content_json, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date, system, sign) DO UPDATE SET content_json = excluded.content_json, created_at = excluded.created_at`
  ).run(date, system, sign, contentJson, Date.now());
}

function getReading(date, system, sign) {
  const row = db
    .prepare(
      "SELECT content_json, created_at FROM daily_readings WHERE date = ? AND system = ? AND sign = ?"
    )
    .get(date, system, sign);
  return row || null;
}

function readingDates() {
  return db
    .prepare("SELECT DISTINCT date FROM daily_readings ORDER BY date DESC LIMIT 14")
    .all()
    .map((r) => r.date);
}

function cleanupOldReadings(keepDays = 7) {
  const cutoff = new Date(Date.now() - keepDays * 86400000);
  const d = cutoff.toLocaleDateString("en-CA", { timeZone: "Asia/Yangon" });
  db.prepare("DELETE FROM daily_readings WHERE date < ?").run(d);
}

module.exports = {
  dbPath,
  getSetting,
  setSetting,
  getSecret,
  setSecret,
  upsertReading,
  getReading,
  readingDates,
  cleanupOldReadings,
  isEphemeralKey: () => _ephemeral,
};
