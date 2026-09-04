#!/usr/bin/env python3
"""
Croquis 16:9 SANS TEXTE pour le hero LMDPT.

Esthétique : encre sombre, parchemin, sièges, bannières vides, cartes —
registre médiéval épique original (maisons / pouvoir / pluralité).
Pas de logos HBO, pas de sigils de fiction, pas de personnalités, pas de
signes religieux, pas de lettres ni chiffres.

Usage:
  python3 scripts/hero-daily-sketch.py --motif urne --seed 42 --out path.jpg
  python3 scripts/hero-daily-sketch.py --batch-named --dir public/illustrations/2027
"""
from __future__ import annotations

import argparse
import math
import random
from pathlib import Path

import cairo


W, H = 1280, 720

# Croquis nommés (galerie / posters) — motifs + graines stables.
NAMED_ASSETS: list[tuple[str, str, int]] = [
    ("hero-premier-tour-2027.jpg", "campagne", 20270),
    ("dessin-urne-2027.jpg", "urne", 20271),
    ("pluralite-1er-tour.jpg", "urne", 8811),
    ("democracy-over-elimination.jpg", "censure", 20273),
    ("illustration-voix-egales.jpg", "documents", 20274),
    ("photo-citoyens-data-2027.jpg", "documents", 3344),
    ("meme-1er-tour-ne-ment-pas.jpg", "urne", 5566),
    ("meme-vote-pensee.jpg", "campagne", 7788),
    ("hero-urne-nb-croquis-2026-07-25.jpg", "urne", 2507),
]


def bone(ctx: cairo.Context, a: float = 1.0) -> None:
    ctx.set_source_rgba(0.78, 0.71, 0.55, a)


def soot(ctx: cairo.Context, a: float = 1.0) -> None:
    ctx.set_source_rgba(0.07, 0.06, 0.05, a)


def ember(ctx: cairo.Context, a: float = 0.85) -> None:
    ctx.set_source_rgba(0.52, 0.34, 0.14, a)


def iron(ctx: cairo.Context, a: float = 0.9) -> None:
    ctx.set_source_rgba(0.42, 0.44, 0.46, a)


def parchment_bg(ctx: cairo.Context, rng: random.Random) -> None:
    """Ciel d’orage + parchemin bas — pas de papier crème « doodle X »."""
    grad = cairo.LinearGradient(0, 0, 0, H)
    grad.add_color_stop_rgb(0.0, 0.07, 0.08, 0.10)
    grad.add_color_stop_rgb(0.45, 0.11, 0.10, 0.09)
    grad.add_color_stop_rgb(1.0, 0.09, 0.07, 0.05)
    ctx.set_source(grad)
    ctx.rectangle(0, 0, W, H)
    ctx.fill()

    # nuages bas
    for _ in range(7):
        ctx.set_source_rgba(0.16, 0.15, 0.14, 0.22)
        ctx.arc(rng.randint(40, 1240), rng.randint(20, 160), rng.randint(50, 120), 0, 2 * math.pi)
        ctx.fill()

    # grain
    for _ in range(4200):
        x, y = rng.random() * W, rng.random() * H
        g = 0.05 + rng.random() * 0.10
        ctx.set_source_rgba(g, g * 0.92, g * 0.78, 0.55)
        ctx.rectangle(x, y, 1.8, 1.8)
        ctx.fill()

    # neige / cendre
    for _ in range(90):
        bone(ctx, 0.12 + rng.random() * 0.12)
        ctx.arc(rng.random() * W, rng.random() * 280, rng.uniform(0.6, 1.8), 0, 2 * math.pi)
        ctx.fill()

    keep_skyline(ctx, rng)


def keep_skyline(ctx: cairo.Context, rng: random.Random) -> None:
    """Donjon lointain — créneaux génériques, pas un château de fiction."""
    ctx.set_source_rgba(0.22, 0.18, 0.14, 0.55)
    base_y = 168
    x0 = 720
    ctx.rectangle(x0, base_y - 48, 220, 48)
    ctx.fill()
    bone(ctx, 0.5)
    ctx.set_line_width(2.4)
    # mur
    ctx.move_to(x0, base_y)
    ctx.line_to(x0, base_y - 48)
    for i in range(9):
        xx = x0 + 18 + i * 22
        h = 10 if i % 2 == 0 else 0
        ctx.line_to(xx, base_y - 48 - h)
        ctx.line_to(xx + 11, base_y - 48 - h)
        ctx.line_to(xx + 11, base_y - 48)
    ctx.line_to(x0 + 220, base_y - 48)
    ctx.line_to(x0 + 220, base_y)
    ctx.stroke()
    # tour
    stroke_line(ctx, x0 + 88, base_y - 48, x0 + 88, base_y - 92, 2.0, 0.2, rng)
    stroke_line(ctx, x0 + 128, base_y - 48, x0 + 128, base_y - 92, 2.0, 0.2, rng)
    stroke_line(ctx, x0 + 84, base_y - 92, x0 + 132, base_y - 92, 1.8, 0.2, rng)
    for i in range(4):
        xx = x0 + 88 + i * 12
        stroke_line(ctx, xx, base_y - 92, xx, base_y - 104, 1.4, 0.15, rng)


def torch(ctx: cairo.Context, x: float, y: float, rng: random.Random) -> None:
    ember(ctx, 0.22)
    ctx.arc(x, y - 6, 38, 0, 2 * math.pi)
    ctx.fill()
    bone(ctx, 0.8)
    stroke_line(ctx, x, y + 48, x, y, 4.0, 0.3, rng)
    ember(ctx, 0.75)
    ctx.move_to(x - 10, y + 2)
    ctx.line_to(x - 4, y - 28)
    ctx.line_to(x, y - 42 + rng.uniform(-3, 3))
    ctx.line_to(x + 5, y - 26)
    ctx.line_to(x + 11, y + 2)
    ctx.close_path()
    ctx.fill()
    bone(ctx, 0.55)
    ctx.set_line_width(1.6)
    ctx.move_to(x - 8, y)
    ctx.line_to(x, y - 36)
    ctx.line_to(x + 8, y)
    ctx.stroke()


def map_table(ctx: cairo.Context, x: float, y: float, w: float, h: float, rng: random.Random) -> None:
    """Table de guerre : côtes abstraites, aucun toponyme."""
    bone(ctx, 0.88)
    ctx.set_line_width(2.6)
    ctx.rectangle(x, y, w, h)
    ctx.stroke()
    hatch_rect(ctx, x, y, w, 18, rng, 10)
    # côte
    ctx.set_line_width(1.8)
    ctx.move_to(x + 24, y + 50)
    for i in range(8):
        ctx.line_to(
            x + 24 + i * (w - 50) / 7,
            y + 50 + math.sin(i * 0.9) * 28 + rng.uniform(-4, 4),
        )
    ctx.stroke()
    ctx.move_to(x + 40, y + h - 40)
    for i in range(6):
        ctx.line_to(
            x + 40 + i * (w - 80) / 5,
            y + h - 40 + math.cos(i * 1.1) * 18,
        )
    ctx.stroke()
    for _ in range(5):
        ctx.arc(x + rng.uniform(40, w - 40), y + rng.uniform(70, h - 50), 4, 0, 2 * math.pi)
        ctx.fill()
    # pions neutres (cercles vides)
    for i in range(4):
        ctx.arc(x + 70 + i * 70, y + h * 0.55, 8, 0, 2 * math.pi)
        ctx.stroke()


def stroke_line(
    ctx: cairo.Context,
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    width: float = 2.0,
    wobble: float = 0.0,
    rng: random.Random | None = None,
) -> None:
    rng = rng or random.Random()
    ctx.set_line_width(width)
    ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    if wobble <= 0:
        ctx.move_to(x1, y1)
        ctx.line_to(x2, y2)
        ctx.stroke()
        return
    steps = max(4, int(math.hypot(x2 - x1, y2 - y1) / 16))
    ctx.move_to(x1, y1)
    for i in range(1, steps + 1):
        t = i / steps
        x = x1 + (x2 - x1) * t + rng.uniform(-wobble, wobble)
        y = y1 + (y2 - y1) * t + rng.uniform(-wobble, wobble)
        ctx.line_to(x, y)
    ctx.stroke()


def hatch_rect(
    ctx: cairo.Context,
    x: float,
    y: float,
    w: float,
    h: float,
    rng: random.Random,
    density: int = 14,
) -> None:
    bone(ctx, 0.28)
    for i in range(density):
        xx = x + (i / max(1, density - 1)) * w
        stroke_line(ctx, xx, y, xx - h * 0.18, y + h, 1.4, 0.8, rng)


def stone_floor(ctx: cairo.Context, rng: random.Random) -> None:
    ctx.set_source_rgba(0.12, 0.10, 0.08, 0.55)
    ctx.rectangle(0, 630, W, H - 630)
    ctx.fill()
    bone(ctx, 0.45)
    stroke_line(ctx, 20, 638, W - 20, 646, 4.0, 2.2, rng)
    for i in range(8):
        x = 50 + i * 150
        stroke_line(ctx, x, 640, x + rng.randint(-12, 12), 718, 2.4, 1.1, rng)


def raven(ctx: cairo.Context, x: float, y: float, s: float, rng: random.Random) -> None:
    """Silhouette pleine — os clair sur ciel d’orage."""
    bone(ctx, 0.82)
    ctx.move_to(x - 16 * s, y + 2 * s)
    ctx.line_to(x - 2 * s, y - 8 * s)
    ctx.line_to(x + 4 * s, y - 3 * s)
    ctx.line_to(x + 18 * s, y - 6 * s)
    ctx.line_to(x + 6 * s, y + 2 * s)
    ctx.line_to(x + 2 * s, y + 10 * s)
    ctx.close_path()
    ctx.fill()
    soot(ctx, 0.35)
    ctx.set_line_width(1.2)
    ctx.move_to(x + 4 * s, y - 3 * s)
    ctx.line_to(x + 10 * s + rng.uniform(-1, 1), y - 11 * s)
    ctx.stroke()


def cloaked_figure(
    ctx: cairo.Context,
    cx: float,
    cy: float,
    scale: float,
    rng: random.Random,
    arm_up: bool = False,
) -> None:
    """Cape pleine + capuche sombre — aucun visage."""
    s = scale
    # cape remplie — brun lisible sur parchemin d’orage
    ctx.set_source_rgba(0.38, 0.28, 0.18, 0.92)
    ctx.move_to(cx - 28 * s, cy + 56 * s)
    ctx.line_to(cx - 22 * s, cy - 4 * s)
    ctx.line_to(cx, cy - 32 * s)
    ctx.line_to(cx + 22 * s, cy - 4 * s)
    ctx.line_to(cx + 30 * s, cy + 56 * s)
    ctx.close_path()
    ctx.fill()
    bone(ctx, 0.88)
    ctx.set_line_width(3.2)
    ctx.move_to(cx - 28 * s, cy + 56 * s)
    ctx.line_to(cx - 22 * s, cy - 4 * s)
    ctx.line_to(cx, cy - 32 * s)
    ctx.line_to(cx + 22 * s, cy - 4 * s)
    ctx.line_to(cx + 30 * s, cy + 56 * s)
    ctx.close_path()
    ctx.stroke()
    hatch_rect(ctx, cx - 20 * s, cy - 2 * s, 40 * s, 52 * s, rng, 6)
    # capuche (larme, pas un smiley)
    ctx.set_source_rgba(0.05, 0.04, 0.03, 0.95)
    ctx.move_to(cx, cy - 58 * s)
    ctx.curve_to(cx + 18 * s, cy - 54 * s, cx + 16 * s, cy - 28 * s, cx, cy - 22 * s)
    ctx.curve_to(cx - 16 * s, cy - 28 * s, cx - 18 * s, cy - 54 * s, cx, cy - 58 * s)
    ctx.fill()
    bone(ctx, 0.9)
    ctx.set_line_width(2.8)
    ctx.move_to(cx, cy - 58 * s)
    ctx.curve_to(cx + 18 * s, cy - 54 * s, cx + 16 * s, cy - 28 * s, cx, cy - 22 * s)
    ctx.curve_to(cx - 16 * s, cy - 28 * s, cx - 18 * s, cy - 54 * s, cx, cy - 58 * s)
    ctx.stroke()
    if arm_up:
        stroke_line(ctx, cx + 10 * s, cy - 6 * s, cx + 34 * s, cy - 58 * s, 3.2, 0.8, rng)
        stroke_line(ctx, cx - 10 * s, cy - 4 * s, cx - 28 * s, cy + 14 * s, 3.2, 0.8, rng)
    else:
        stroke_line(ctx, cx - 12 * s, cy - 2 * s, cx - 32 * s, cy + 20 * s, 3.2, 0.8, rng)
        stroke_line(ctx, cx + 12 * s, cy - 2 * s, cx + 32 * s, cy + 20 * s, 3.2, 0.8, rng)


def blank_banner(
    ctx: cairo.Context,
    x: float,
    y_top: float,
    h: float,
    rng: random.Random,
    pattern: int = 0,
) -> None:
    """Bannière de tissu — barres / losange / hachures, jamais de lettre."""
    w = 78
    ctx.set_source_rgba(0.42, 0.28, 0.16, 0.88)
    ctx.move_to(x, y_top)
    ctx.line_to(x + w, y_top + 16)
    ctx.line_to(x + w, y_top + 100)
    ctx.line_to(x + w * 0.5, y_top + 118)
    ctx.line_to(x, y_top + 100)
    ctx.close_path()
    ctx.fill()
    bone(ctx, 0.9)
    stroke_line(ctx, x, y_top + h, x, y_top, 4.4, 0.5, rng)
    ctx.set_line_width(2.8)
    ctx.move_to(x, y_top)
    ctx.line_to(x + w, y_top + 16)
    ctx.line_to(x + w, y_top + 100)
    ctx.line_to(x + w * 0.5, y_top + 118)
    ctx.line_to(x, y_top + 100)
    ctx.close_path()
    ctx.stroke()
    bone(ctx, 0.55)
    if pattern % 3 == 0:
        for i in range(5):
            yy = y_top + 28 + i * 14
            stroke_line(ctx, x + 10, yy, x + w - 12, yy + 3, 2.0, 0.5, rng)
    elif pattern % 3 == 1:
        # losange — pas une croix
        mx, my = x + w * 0.5, y_top + 58
        ctx.set_line_width(2.2)
        ctx.move_to(mx, my - 28)
        ctx.line_to(mx + 18, my)
        ctx.line_to(mx, my + 28)
        ctx.line_to(mx - 18, my)
        ctx.close_path()
        ctx.stroke()
    else:
        ctx.set_line_width(2.4)
        ctx.arc(x + w * 0.5, y_top + 56, 16, 0, 2 * math.pi)
        ctx.stroke()


def iron_chest(ctx: cairo.Context, x: float, y: float, w: float, h: float, rng: random.Random) -> None:
    """Coffre ferré 3/4 — urne, pas une grille plate."""
    ctx.set_source_rgba(0.36, 0.30, 0.22, 0.92)
    ctx.rectangle(x, y, w, h)
    ctx.fill()
    bone(ctx, 0.92)
    ctx.set_line_width(4.0)
    ctx.rectangle(x, y, w, h)
    ctx.stroke()
    # volume : panneau droit
    ctx.set_source_rgba(0.32, 0.26, 0.18, 0.85)
    ctx.move_to(x + w, y)
    ctx.line_to(x + w + 28, y - 18)
    ctx.line_to(x + w + 28, y + h - 18)
    ctx.line_to(x + w, y + h)
    ctx.close_path()
    ctx.fill_preserve()
    bone(ctx, 0.75)
    ctx.set_line_width(2.4)
    ctx.stroke()
    # bandes de fer + rivets
    iron(ctx, 0.85)
    for t in (0.22, 0.5, 0.78):
        stroke_line(ctx, x + 6, y + h * t, x + w - 6, y + h * t, 5.0, 0.4, rng)
        for k in range(5):
            rx = x + 18 + k * (w - 36) / 4
            ry = y + h * t
            ctx.arc(rx, ry, 3.2, 0, 2 * math.pi)
            ctx.fill()
    # couvercle entrouvert (volume)
    ctx.set_source_rgba(0.40, 0.32, 0.22, 0.88)
    ctx.move_to(x, y)
    ctx.line_to(x + 36, y - 48)
    ctx.line_to(x + w + 20, y - 28)
    ctx.line_to(x + w, y)
    ctx.close_path()
    ctx.fill_preserve()
    bone(ctx, 0.9)
    ctx.set_line_width(3.2)
    ctx.stroke()
    # serrure ovale vide
    bone(ctx, 0.85)
    ctx.set_line_width(2.6)
    ctx.arc(x + w * 0.5, y + h * 0.62, 14, 0, 2 * math.pi)
    ctx.stroke()
    ctx.arc(x + w * 0.5, y + h * 0.62, 5, 0, 2 * math.pi)
    ctx.stroke()


def draw_ballot(ctx: cairo.Context, x: float, y: float, s: float, rng: random.Random) -> None:
    ctx.set_source_rgba(0.72, 0.64, 0.48, 0.55)
    pts = [
        (x, y),
        (x + 22 * s + rng.uniform(-2, 2), y + rng.uniform(-2, 2)),
        (x + 18 * s, y + 26 * s),
        (x - 3 * s, y + 24 * s),
    ]
    ctx.move_to(*pts[0])
    for p in pts[1:]:
        ctx.line_to(*p)
    ctx.close_path()
    ctx.fill_preserve()
    bone(ctx, 0.8)
    ctx.set_line_width(1.8)
    ctx.stroke()


def stone_seat(ctx: cairo.Context, cx: float, cy: float, rng: random.Random) -> None:
    """Siège de pierre à dossier haut — pas un trône d’épées."""
    ctx.set_source_rgba(0.34, 0.28, 0.20, 0.92)
    ctx.move_to(cx - 82, cy + 48)
    ctx.line_to(cx - 102, cy + 82)
    ctx.line_to(cx + 102, cy + 82)
    ctx.line_to(cx + 82, cy + 48)
    ctx.close_path()
    ctx.fill()
    bone(ctx, 0.9)
    ctx.set_line_width(3.4)
    ctx.move_to(cx - 82, cy + 48)
    ctx.line_to(cx - 102, cy + 82)
    ctx.line_to(cx + 102, cy + 82)
    ctx.line_to(cx + 82, cy + 48)
    ctx.close_path()
    ctx.stroke()
    hatch_rect(ctx, cx - 80, cy + 48, 160, 32, rng, 9)
    # assise
    ctx.set_source_rgba(0.38, 0.32, 0.22, 0.9)
    ctx.rectangle(cx - 46, cy - 8, 92, 58)
    ctx.fill_preserve()
    bone(ctx, 0.9)
    ctx.set_line_width(3.2)
    ctx.stroke()
    # dossier
    ctx.set_source_rgba(0.36, 0.30, 0.20, 0.92)
    ctx.rectangle(cx - 38, cy - 168, 76, 160)
    ctx.fill_preserve()
    bone(ctx, 0.9)
    ctx.stroke()
    for i in range(5):
        xx = cx - 28 + i * 14
        stroke_line(ctx, xx, cy - 160, xx, cy - 14, 2.4, 0.4, rng)
    # accoudoirs
    stroke_line(ctx, cx - 46, cy + 8, cx - 70, cy + 28, 3.4, 0.4, rng)
    stroke_line(ctx, cx + 46, cy + 8, cx + 70, cy + 28, 3.4, 0.4, rng)
    for xx in (cx - 38, cx, cx + 38):
        stroke_line(ctx, xx, cy - 168, xx, cy - 198, 3.0, 0.3, rng)


def wax_seal(ctx: cairo.Context, cx: float, cy: float, r: float) -> None:
    bone(ctx, 0.85)
    ctx.set_line_width(2.2)
    ctx.arc(cx, cy, r, 0, 2 * math.pi)
    ctx.stroke()
    ctx.arc(cx, cy, r * 0.62, 0, 2 * math.pi)
    ctx.set_line_width(1.4)
    ctx.stroke()


def motif_urne(ctx: cairo.Context, rng: random.Random) -> None:
    for i, x in enumerate([120, 190, 255, 320, 385]):
        cloaked_figure(ctx, x, 500 + rng.randint(-6, 10), 1.25 + rng.random() * 0.12, rng, arm_up=i % 3 == 0)
        if i % 2 == 0:
            draw_ballot(ctx, x + 16, 410 + rng.randint(0, 16), 1.0, rng)

    iron_chest(ctx, 560, 250, 280, 250, rng)
    for _ in range(28):
        draw_ballot(
            ctx,
            580 + rng.random() * 220,
            270 + rng.random() * 180,
            0.65 + rng.random() * 0.4,
            rng,
        )
    for _ in range(8):
        draw_ballot(ctx, 540 + rng.random() * 320, 510 + rng.random() * 40, 0.85, rng)

    stone_seat(ctx, 1040, 430, rng)
    torch(ctx, 470, 210, rng)
    torch(ctx, 890, 200, rng)
    for i in range(7):
        raven(ctx, 70 + i * 62, 58 + rng.randint(0, 36), 1.1, rng)
    raven(ctx, 1180, 90, 1.3, rng)


def motif_documents(ctx: cairo.Context, rng: random.Random) -> None:
    # rouleaux
    for i in range(6):
        x = 140 + i * 22
        y = 180 + i * 14
        bone(ctx, 0.8)
        ctx.set_line_width(2.4)
        ctx.rectangle(x, y, 200, 300)
        ctx.stroke()
        for j in range(8):
            yy = y + 36 + j * 30
            stroke_line(ctx, x + 24, yy, x + 170, yy + rng.uniform(-1, 1), 1.6, 0.4, rng)
    wax_seal(ctx, 240, 430, 28)

    # balance de hall (poutre, pas « justice religieuse »)
    bone(ctx, 0.9)
    stroke_line(ctx, 720, 140, 720, 540, 3.2, 0.35, rng)
    stroke_line(ctx, 560, 210, 880, 210, 2.8, 0.4, rng)
    for sx in (560, 880):
        ctx.set_line_width(2.0)
        ctx.arc(sx, 275, 48, 0, math.pi)
        ctx.stroke()
        stroke_line(ctx, sx, 210, sx, 228, 2.0, 0.2, rng)

    map_table(ctx, 430, 300, 420, 250, rng)
    wax_seal(ctx, 1020, 220, 40)
    for i, x in enumerate([980, 1060, 1140]):
        cloaked_figure(ctx, x, 520, 1.05, rng, arm_up=i == 1)
    torch(ctx, 80, 180, rng)
    raven(ctx, 1100, 80, 1.2, rng)


def motif_censure(ctx: cairo.Context, rng: random.Random) -> None:
    # portail grillagé (fenêtre close)
    bone(ctx, 0.9)
    ctx.set_line_width(3.4)
    ctx.rectangle(150, 120, 400, 320)
    ctx.stroke()
    for i in range(7):
        xx = 170 + i * 52
        stroke_line(ctx, xx, 130, xx, 430, 3.0, 0.5, rng)
    for j in range(5):
        yy = 150 + j * 60
        stroke_line(ctx, 160, yy, 540, yy, 2.6, 0.5, rng)

    # chaîne brisée
    for i in range(7):
        cx = 620 + i * 62
        cy = 260 + (10 if i % 2 else -10)
        ctx.set_line_width(3.0)
        ctx.arc(cx, cy, 22, 0.2, math.pi + 0.9)
        ctx.stroke()
        if i == 3:
            stroke_line(ctx, cx + 16, cy - 12, cx + 38, cy + 22, 2.4, 0.9, rng)

    iron_chest(ctx, 980, 380, 130, 150, rng)
    cloaked_figure(ctx, 210, 560, 1.05, rng, arm_up=True)
    cloaked_figure(ctx, 310, 560, 1.0, rng)
    cloaked_figure(ctx, 410, 555, 1.0, rng)
    torch(ctx, 80, 160, rng)
    torch(ctx, 1220, 170, rng)
    for i in range(6):
        raven(ctx, 640 + i * 80, 70 + rng.randint(0, 28), 1.05, rng)


def motif_hemicycle(ctx: cairo.Context, rng: random.Random) -> None:
    cx, cy = 640, 560
    for r in range(3, 0, -1):
        bone(ctx, 0.45 + r * 0.12)
        ctx.set_line_width(3.4)
        ctx.arc(cx, cy, 70 + r * 95, math.pi, 2 * math.pi)
        ctx.stroke()
        for a in range(13):
            ang = math.pi + (a / 12) * math.pi
            x = cx + math.cos(ang) * (70 + r * 95)
            y = cy + math.sin(ang) * (70 + r * 95) * 0.52
            ctx.arc(x, y, 7, 0, 2 * math.pi)
            ctx.fill()

    stone_seat(ctx, cx, 340, rng)
    iron_chest(ctx, 590, 430, 100, 80, rng)
    for i, x in enumerate([160, 250, 340, 940, 1030, 1120]):
        cloaked_figure(ctx, x, 600, 0.82, rng, arm_up=i % 2 == 0)
    blank_banner(ctx, 80, 120, 380, rng, 0)
    blank_banner(ctx, 1180, 130, 360, rng, 1)
    torch(ctx, 40, 200, rng)
    torch(ctx, 1240, 210, rng)


def motif_campaign(ctx: cairo.Context, rng: random.Random) -> None:
    for i, x in enumerate([130, 250, 370, 490]):
        blank_banner(ctx, x, 130 + i * 6, 420, rng, i)
    for i, x in enumerate([150, 270, 390]):
        cloaked_figure(ctx, x, 530, 1.2, rng, arm_up=i == 1)
    iron_chest(ctx, 700, 280, 240, 220, rng)
    for _ in range(18):
        draw_ballot(ctx, 720 + rng.random() * 180, 300 + rng.random() * 150, 0.7, rng)
    stone_seat(ctx, 1080, 400, rng)
    torch(ctx, 640, 180, rng)
    for i in range(8):
        raven(ctx, 50 + i * 48, 50 + rng.randint(0, 22), 1.05, rng)


MOTIFS = {
    "urne": motif_urne,
    "documents": motif_documents,
    "censure": motif_censure,
    "hemicycle": motif_hemicycle,
    "campagne": motif_campaign,
}


def render(motif: str, seed: int, out: Path) -> None:
    rng = random.Random(seed)
    surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
    ctx = cairo.Context(surface)
    parchment_bg(ctx, rng)
    fn = MOTIFS.get(motif, motif_urne)
    fn(ctx, rng)
    stone_floor(ctx, rng)
    # lueur basse (torche hors-champ)
    ember(ctx, 0.16)
    ctx.arc(W * 0.5, H + 50, 340, math.pi, 2 * math.pi)
    ctx.fill()
    # suie finale
    for _ in range(900):
        x, y = rng.random() * W, rng.random() * H
        ctx.set_source_rgba(0.04, 0.03, 0.02, 0.18)
        ctx.rectangle(x, y, 2.2, 2.2)
        ctx.fill()

    out.parent.mkdir(parents=True, exist_ok=True)
    png = out.with_suffix(".png")
    surface.write_to_png(str(png))
    if out.suffix.lower() in {".jpg", ".jpeg"}:
        from PIL import Image

        im = Image.open(png).convert("RGB")
        im.save(out, "JPEG", quality=90, optimize=True)
        webp = out.with_suffix(".webp")
        im.save(webp, "WEBP", quality=82, method=4)
        png.unlink(missing_ok=True)
    else:
        if out != png:
            png.rename(out)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--motif", default="urne", choices=sorted(MOTIFS.keys()))
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--out", default="")
    ap.add_argument("--batch-named", action="store_true")
    ap.add_argument("--dir", default="")
    args = ap.parse_args()
    if args.batch_named:
        dest = Path(args.dir or "public/illustrations/2027")
        for name, motif, seed in NAMED_ASSETS:
            target = dest / name
            render(motif, seed, target)
            print(f"OK named {name} motif={motif} seed={seed}")
        return
    if not args.out:
        ap.error("--out requis (sauf --batch-named)")
    render(args.motif, args.seed, Path(args.out))
    print(f"OK sketch motif={args.motif} seed={args.seed} → {args.out}")


if __name__ == "__main__":
    main()
