#!/usr/bin/env python3
"""
Génère un croquis encre N&B 16:9 SANS TEXTE pour le hero LMDPT.
Motifs pilotés par le scoop du jour (motif id), jamais de lettres/chiffres.
Usage:
  python3 scripts/hero-daily-sketch.py --motif urne --seed 42 --out path.jpg
"""
from __future__ import annotations

import argparse
import math
import random
from pathlib import Path

import cairo


W, H = 1280, 720


def paper_bg(ctx: cairo.Context) -> None:
    ctx.set_source_rgb(0.97, 0.96, 0.94)
    ctx.rectangle(0, 0, W, H)
    ctx.fill()
    # grain léger
    rng = random.Random(7)
    for _ in range(1800):
        x, y = rng.random() * W, rng.random() * H
        g = 0.88 + rng.random() * 0.1
        ctx.set_source_rgba(g, g, g, 0.35)
        ctx.rectangle(x, y, 1.2, 1.2)
        ctx.fill()


def ink(ctx: cairo.Context, a: float = 1.0) -> None:
    ctx.set_source_rgba(0.08, 0.08, 0.09, a)


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
    steps = max(4, int(math.hypot(x2 - x1, y2 - y1) / 18))
    ctx.move_to(x1, y1)
    for i in range(1, steps + 1):
        t = i / steps
        x = x1 + (x2 - x1) * t + rng.uniform(-wobble, wobble)
        y = y1 + (y2 - y1) * t + rng.uniform(-wobble, wobble)
        ctx.line_to(x, y)
    ctx.stroke()


def draw_person(
    ctx: cairo.Context,
    cx: float,
    cy: float,
    scale: float,
    rng: random.Random,
    arm_up: bool = False,
) -> None:
    ink(ctx, 0.95)
    # head
    ctx.arc(cx, cy - 55 * scale, 18 * scale, 0, 2 * math.pi)
    ctx.set_line_width(2.2)
    ctx.stroke()
    # smile
    ctx.arc(cx, cy - 52 * scale, 8 * scale, 0.2, math.pi - 0.2)
    ctx.set_line_width(1.4)
    ctx.stroke()
    # body
    stroke_line(ctx, cx, cy - 37 * scale, cx, cy + 10 * scale, 2.4, 0.8, rng)
    # legs
    stroke_line(ctx, cx, cy + 10 * scale, cx - 14 * scale, cy + 48 * scale, 2.2, 0.6, rng)
    stroke_line(ctx, cx, cy + 10 * scale, cx + 14 * scale, cy + 48 * scale, 2.2, 0.6, rng)
    # arms
    if arm_up:
        stroke_line(ctx, cx, cy - 20 * scale, cx + 22 * scale, cy - 48 * scale, 2.0, 0.7, rng)
        stroke_line(ctx, cx, cy - 20 * scale, cx - 18 * scale, cy + 5 * scale, 2.0, 0.7, rng)
    else:
        stroke_line(ctx, cx, cy - 20 * scale, cx - 20 * scale, cy + 8 * scale, 2.0, 0.7, rng)
        stroke_line(ctx, cx, cy - 20 * scale, cx + 20 * scale, cy + 8 * scale, 2.0, 0.7, rng)


def draw_ballot(ctx: cairo.Context, x: float, y: float, s: float, rng: random.Random) -> None:
    ink(ctx, 0.85)
    ctx.set_line_width(1.5)
    pts = [
        (x, y),
        (x + 22 * s + rng.uniform(-2, 2), y + rng.uniform(-3, 3)),
        (x + 18 * s, y + 28 * s),
        (x - 4 * s, y + 26 * s),
    ]
    ctx.move_to(*pts[0])
    for p in pts[1:]:
        ctx.line_to(*p)
    ctx.close_path()
    ctx.stroke()


def motif_urne(ctx: cairo.Context, rng: random.Random) -> None:
    # crowd left
    xs = [140, 210, 280, 340, 400, 460]
    for i, x in enumerate(xs):
        draw_person(ctx, x, 480 + rng.randint(-8, 12), 0.95 + rng.random() * 0.15, rng, arm_up=i % 3 == 0)
        if i % 2 == 0:
            draw_ballot(ctx, x + 18, 390 + rng.randint(0, 20), 1.0, rng)

    # glass urn
    ux, uy, uw, uh = 620, 220, 320, 320
    ink(ctx, 0.9)
    ctx.set_line_width(3.2)
    ctx.rectangle(ux, uy, uw, uh)
    ctx.stroke()
    # lid open
    stroke_line(ctx, ux, uy, ux + 40, uy - 50, 2.8, 0.5, rng)
    stroke_line(ctx, ux + 40, uy - 50, ux + uw + 10, uy - 30, 2.8, 0.5, rng)
    stroke_line(ctx, ux + uw + 10, uy - 30, ux + uw, uy, 2.8, 0.5, rng)
    # ballots inside
    for _ in range(42):
        draw_ballot(
            ctx,
            ux + 30 + rng.random() * (uw - 70),
            uy + 40 + rng.random() * (uh - 80),
            0.7 + rng.random() * 0.5,
            rng,
        )
    # spill
    for _ in range(12):
        draw_ballot(ctx, ux + rng.randint(-40, uw + 20), uy + uh + rng.randint(-10, 40), 0.9, rng)

    # empty oval mirror (no inscription)
    mx, my = 1020, 300
    ink(ctx, 0.88)
    ctx.set_line_width(3.0)
    ctx.save()
    ctx.translate(mx, my)
    ctx.scale(1.0, 1.35)
    ctx.arc(0, 0, 95, 0, 2 * math.pi)
    ctx.stroke()
    ctx.arc(0, 0, 78, 0, 2 * math.pi)
    ctx.set_line_width(1.6)
    ctx.stroke()
    ctx.restore()
    # stand
    stroke_line(ctx, mx - 10, my + 125, mx - 40, my + 200, 2.5, 0.4, rng)
    stroke_line(ctx, mx + 10, my + 125, mx + 40, my + 200, 2.5, 0.4, rng)


def motif_documents(ctx: cairo.Context, rng: random.Random) -> None:
    """Ingérence / loi / paperasse — documents flottants + balance abstraite, zéro texte."""
    # stack of blank sheets
    for i in range(8):
        x = 180 + i * 18
        y = 200 + i * 12
        ink(ctx, 0.75 + i * 0.02)
        ctx.set_line_width(2.0)
        ctx.rectangle(x, y, 260, 340)
        ctx.stroke()
        # blank lines as hatch only (not letters)
        for j in range(10):
            yy = y + 40 + j * 28
            stroke_line(ctx, x + 30, yy, x + 220, yy + rng.uniform(-1, 1), 1.0, 0.3, rng)

    # seal / stamp circle empty
    ink(ctx, 0.85)
    ctx.set_line_width(2.5)
    ctx.arc(900, 320, 70, 0, 2 * math.pi)
    ctx.stroke()
    ctx.arc(900, 320, 50, 0, 2 * math.pi)
    ctx.stroke()

    # abstract scales of justice (no text)
    ink(ctx, 0.9)
    stroke_line(ctx, 700, 160, 700, 520, 3.0, 0.4, rng)
    stroke_line(ctx, 560, 220, 840, 220, 2.8, 0.5, rng)
    for side, sx in ((-1, 560), (1, 840)):
        ctx.set_line_width(2.0)
        ctx.arc(sx, 280, 55, 0, 2 * math.pi)
        ctx.stroke()
        stroke_line(ctx, sx, 220, sx, 230, 2.0, 0.2, rng)

    # citizens small far right
    for i, x in enumerate([980, 1050, 1120]):
        draw_person(ctx, x, 500, 0.75, rng, arm_up=i == 1)


def motif_censure(ctx: cairo.Context, rng: random.Random) -> None:
    """Chaîne brisée + écran vide + urne lointaine — pas de texte."""
    # blank screen frame
    ink(ctx, 0.9)
    ctx.set_line_width(3.5)
    ctx.rectangle(160, 140, 420, 300)
    ctx.stroke()
    # static noise hatch
    for _ in range(80):
        x1 = 180 + rng.random() * 380
        y1 = 160 + rng.random() * 260
        stroke_line(ctx, x1, y1, x1 + rng.uniform(-20, 20), y1 + rng.uniform(-20, 20), 1.0, 0.5, rng)

    # broken chain links
    for i in range(6):
        cx = 650 + i * 70
        cy = 280 + (8 if i % 2 else -8)
        ink(ctx, 0.88)
        ctx.set_line_width(3.0)
        ctx.arc(cx, cy, 28, 0.3, math.pi + 0.8)
        ctx.stroke()
        if i == 3:
            # break
            stroke_line(ctx, cx + 20, cy - 15, cx + 40, cy + 25, 2.5, 1.0, rng)

    # distant urn silhouette
    ink(ctx, 0.7)
    ctx.set_line_width(2.5)
    ctx.rectangle(980, 360, 140, 160)
    ctx.stroke()
    for _ in range(8):
        draw_ballot(ctx, 1000 + rng.random() * 100, 380 + rng.random() * 100, 0.6, rng)

    draw_person(ctx, 220, 560, 1.0, rng, arm_up=True)
    draw_person(ctx, 320, 560, 1.0, rng)
    draw_person(ctx, 420, 560, 1.0, rng)


def motif_hemicycle(ctx: cairo.Context, rng: random.Random) -> None:
    """Hémicycle abstrait + urne centrale."""
    cx, cy = 640, 520
    for r in range(3, 0, -1):
        ink(ctx, 0.55 + r * 0.1)
        ctx.set_line_width(2.0)
        ctx.arc(cx, cy, 80 + r * 90, math.pi, 2 * math.pi)
        ctx.stroke()
        # seats as arcs of dots
        for a in range(12):
            ang = math.pi + (a / 11) * math.pi
            x = cx + math.cos(ang) * (80 + r * 90)
            y = cy + math.sin(ang) * (80 + r * 90) * 0.55
            ctx.arc(x, y, 4, 0, 2 * math.pi)
            ctx.fill()

    # central urn
    ink(ctx, 0.92)
    ctx.set_line_width(3.0)
    ctx.rectangle(580, 300, 120, 140)
    ctx.stroke()
    for _ in range(15):
        draw_ballot(ctx, 590 + rng.random() * 90, 310 + rng.random() * 100, 0.55, rng)

    # people bottom
    for i, x in enumerate([200, 300, 400, 900, 1000, 1100]):
        draw_person(ctx, x, 600, 0.85, rng, arm_up=i % 2 == 0)


def motif_campaign(ctx: cairo.Context, rng: random.Random) -> None:
    """Campagne / candidats génériques — drapeaux vides (sans emblème texte)."""
    # empty poles / blank banners (no letters)
    for i, x in enumerate([180, 320, 460]):
        stroke_line(ctx, x, 520, x, 180, 3.0, 0.4, rng)
        ink(ctx, 0.8)
        ctx.set_line_width(2.0)
        ctx.move_to(x, 180)
        ctx.line_to(x + 90, 210)
        ctx.line_to(x, 240)
        ctx.close_path()
        ctx.stroke()

    motif_urne(ctx, rng)


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
    paper_bg(ctx)
    # soft cloud blobs
    for _ in range(5):
        ink(ctx, 0.06)
        ctx.arc(rng.randint(100, 1180), rng.randint(40, 160), rng.randint(40, 90), 0, 2 * math.pi)
        ctx.fill()

    fn = MOTIFS.get(motif, motif_urne)
    fn(ctx, rng)

    # bottom ground line
    ink(ctx, 0.35)
    stroke_line(ctx, 40, 640, W - 40, 645, 1.5, 1.2, rng)

    out.parent.mkdir(parents=True, exist_ok=True)
    # write PNG then convert via cairo jpeg? cairo has no jpeg — write PNG
    png = out.with_suffix(".png")
    surface.write_to_png(str(png))
    if out.suffix.lower() in {".jpg", ".jpeg"}:
        from PIL import Image

        im = Image.open(png).convert("RGB")
        im.save(out, "JPEG", quality=90, optimize=True)
        png.unlink(missing_ok=True)
    else:
        if out != png:
            png.rename(out)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--motif", default="urne", choices=sorted(MOTIFS.keys()))
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    render(args.motif, args.seed, Path(args.out))
    print(f"OK sketch motif={args.motif} seed={args.seed} → {args.out}")


if __name__ == "__main__":
    main()
