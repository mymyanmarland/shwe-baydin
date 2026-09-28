#!/usr/bin/env python3
"""Render a 1080x1080 share card for Shwe Baydin daily horoscope readings.

Deep-navy + gold design (same aesthetic as the FB cover pipeline):
brand header, big sign name, date, love/career/health summaries,
lucky number + lucky color chips, footer brand.

Myanmar text is shaped with Padauk + RAQM layout engine.
Wrapping prefers Myanmar consonant boundaries to avoid broken clusters.

Usage:
  share_card.py --db <app.db> --system day|zodiac --key <sign> --name <display>
                --date YYYY-MM-DD --datemy <myanmar date> --out card.png
"""
from __future__ import annotations

import argparse
import json
import sqlite3
import sys

from PIL import Image, ImageDraw, ImageFont, ImageOps

W = H = 1080
FONTS_DIR = "/home/hatch/workspace/facebook-page-poster/fonts"
MY_FONT_B = f"{FONTS_DIR}/Padauk-Bold.ttf"
MY_FONT_R = f"{FONTS_DIR}/Padauk-Regular.ttf"
LATIN_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

BG_TOP = (10, 14, 38)
BG_BOT = (30, 24, 62)
GOLD = (212, 175, 55)
GOLD_LIGHT = (245, 215, 110)
WHITE = (255, 255, 255)
MUTED = (148, 158, 198)


def my_font(size: int, bold: bool = True):
    p = MY_FONT_B if bold else MY_FONT_R
    try:
        return ImageFont.truetype(p, size, layout_engine=ImageFont.Layout.RAQM)
    except OSError:
        return ImageFont.truetype(MY_FONT_B, size, layout_engine=ImageFont.Layout.RAQM)


def vertical_gradient(w, h, top, bot):
    row = Image.new("RGB", (1, h))
    px = row.load()
    for y in range(h):
        t = y / max(1, h - 1)
        px[0, y] = tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3))
    return row.resize((w, h))


def glow_orb(diameter, color, peak_alpha):
    mask = Image.radial_gradient("L").resize((diameter, diameter))
    if mask.getpixel((diameter // 2, diameter // 2)) < 128:
        mask = ImageOps.invert(mask)
    mask = mask.point(lambda v: int(v * peak_alpha / 255))
    orb = Image.new("RGBA", (diameter, diameter), color + (0,))
    orb.putalpha(mask)
    return orb


def dot_grid(d, x0, y0, cols, rows, gap, r, color):
    for i in range(cols):
        for j in range(rows):
            x = x0 + i * gap
            y = y0 + j * gap
            d.ellipse([x - r, y - r, x + r, y + r], fill=color)


def is_breakable(ch: str) -> bool:
    o = ord(ch)
    return ch == " " or 0x1000 <= o <= 0x102A


def wrap_mm(draw, font, text, max_w, max_lines=3):
    """Wrap Myanmar text, preferring breaks before consonants/spaces."""
    lines: list[str] = []
    src = " ".join(text.split())
    i, cur = 0, ""
    while i < len(src):
        ch = src[i]
        if draw.textlength(cur + ch, font=font) <= max_w:
            cur += ch
            i += 1
            continue
        cut = -1
        for j in range(len(cur) - 1, 0, -1):
            if is_breakable(cur[j]):
                cut = j
                break
        if cut > 0:
            lines.append(cur[:cut])
            cur = cur[cut:] + ch
        else:
            if cur:
                lines.append(cur)
            cur = ch
        i += 1
        if len(lines) >= max_lines:
            break
    if cur and len(lines) < max_lines:
        lines.append(cur)
    lines = lines[:max_lines]
    if lines and len("".join(lines)) < len(src):
        lines[-1] = lines[-1].rstrip() + "…"
    return lines


def letter_spaced(d, xy, text, font, fill, spacing):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + spacing
    return x


def spaced_width(d, text, font, spacing):
    return sum(d.textlength(ch, font=font) + spacing for ch in text) - spacing


def center_text(d, cx, y, text, font, fill):
    w = d.textlength(text, font=font)
    d.text((cx - w / 2, y), text, font=font, fill=fill)


def main(argv=None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True)
    ap.add_argument("--system", required=True, choices=["day", "zodiac"])
    ap.add_argument("--key", required=True)
    ap.add_argument("--name", required=True, help="sign display name (Myanmar)")
    ap.add_argument("--date", required=True)
    ap.add_argument("--datemy", required=True, help="date in Myanmar text")
    ap.add_argument("--out", required=True)
    a = ap.parse_args(argv)

    con = sqlite3.connect(a.db)
    row = con.execute(
        "SELECT content_json FROM daily_readings WHERE date=? AND system=? AND sign=?",
        (a.date, a.system, a.key),
    ).fetchone()
    con.close()
    if not row:
        print("error: no reading in DB for %s/%s/%s" % (a.date, a.system, a.key),
              file=sys.stderr)
        return 1
    r = json.loads(row[0])

    # ---- base ----
    img = vertical_gradient(W, H, BG_TOP, BG_BOT).convert("RGBA")
    img.alpha_composite(glow_orb(620, (212, 175, 55), 44), (560, -220))
    img.alpha_composite(glow_orb(520, (90, 110, 255), 48), (-180, 420))
    img.alpha_composite(glow_orb(420, (150, 90, 220), 38), (700, 700))
    d = ImageDraw.Draw(img)
    dot_grid(d, 862, 96, 8, 4, 26, 3, (200, 180, 120, 40))
    dot_grid(d, 56, 884, 8, 4, 26, 3, (200, 180, 120, 30))

    cx = 80
    # ---- brand header ----
    d.text((cx, 54), "ရွှေဗေဒင်", font=my_font(52), fill=GOLD_LIGHT + (255,))
    sub_font = ImageFont.truetype(LATIN_FONT, 22)
    label = "SHWE BAYDIN"
    letter_spaced(d, (W - cx - spaced_width(d, label, sub_font, 8), 76),
                  label, sub_font, MUTED + (255,), 8)

    # ---- sign name + date (centered) ----
    sign_font = my_font(88)
    center_text(d, W / 2, 168, a.name, sign_font, WHITE + (255,))
    center_text(d, W / 2, 292, a.datemy, my_font(32, bold=False), MUTED + (255,))

    # gold divider
    div_y = 372
    for x in range(W // 2 - 130, W // 2 + 130):
        t = (x - (W // 2 - 130)) / 260
        d.line([(x, div_y), (x, div_y + 4)],
               fill=tuple(int(GOLD[i] + (GOLD_LIGHT[i] - GOLD[i]) * t) for i in range(3)) + (255,))

    # ---- three summary sections ----
    def short(s, n=115):
        s = " ".join(s.split())
        if len(s) <= n:
            return s
        cut = s.rfind(" ", 0, n)
        return (s[:cut] if cut > 0 else s[:n]).rstrip() + "…"

    sections = [
        ("အချစ်ရေး", short(r.get("love", ""))),
        ("အလုပ်/စီးပွားရေး", short(r.get("career", ""))),
        ("ကျန်းမာရေး", short(r.get("health", ""))),
    ]
    y = 400
    for title, body in sections:
        d.text((cx, y), title, font=my_font(28), fill=GOLD_LIGHT + (255,))
        y += 46
        font = my_font(29, bold=False)
        asc, desc = font.getmetrics()
        line_h = int((asc + desc) * 1.12)
        for line in wrap_mm(d, font, body, W - cx * 2, max_lines=2):
            d.text((cx, y), line, font=font, fill=WHITE + (255,))
            y += line_h
        y += 18

    # ---- lucky chips (placed dynamically below the sections) ----
    chip_y = y + 22
    chips = [
        ("ကံကောင်းဂဏန်း", r.get("lucky_number", "—")),
        ("ကံကောင်းအရောင်", r.get("lucky_color", "—")),
    ]
    chip_font_l = my_font(26)
    chip_font_v = my_font(34)
    total_w = 0
    widths = []
    for lab, val in chips:
        wlab = d.textlength(lab, font=chip_font_l)
        wval = d.textlength(val, font=chip_font_v)
        widths.append((wlab, wval))
        total_w += max(wlab, wval) + 96
    total_w += 40
    x = (W - total_w) / 2
    for (lab, val), (wlab, wval) in zip(chips, widths):
        cw = max(wlab, wval) + 96
        ch = 104
        chip = Image.new("RGBA", (int(cw), ch), (212, 175, 55, 30))
        cmask = Image.new("L", (int(cw), ch), 0)
        ImageDraw.Draw(cmask).rounded_rectangle([0, 0, cw, ch], radius=24, fill=255)
        gold_line = Image.new("RGBA", (int(cw), ch), (0, 0, 0, 0))
        ImageDraw.Draw(gold_line).rounded_rectangle([0, 0, cw, ch], radius=24,
                                                   outline=GOLD + (170,), width=3)
        img.paste(chip, (int(x), chip_y), cmask)
        img.alpha_composite(gold_line, (int(x), chip_y))
        d = ImageDraw.Draw(img)
        center_text(d, x + cw / 2, chip_y + 12, lab, chip_font_l, GOLD_LIGHT + (255,))
        center_text(d, x + cw / 2, chip_y + 46, val, chip_font_v, WHITE + (255,))
        x += cw + 40

    # ---- footer ----
    center_text(d, W / 2, chip_y + ch + 26, "နေ့စဉ်ဗေဒင်ဟောစာတမ်း", my_font(24, bold=False),
                MUTED + (255,))

    img.convert("RGB").save(a.out)
    print(f"saved {a.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
