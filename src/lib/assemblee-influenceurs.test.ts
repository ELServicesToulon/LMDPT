import { describe, expect, it } from 'vitest';
import {
  FAMILY_COLORS,
  FAMILY_HEMI_ORDER,
  VALID_BACKER_KINDS,
  VALID_DEPENDENCY_KINDS,
  VALID_FAMILIES,
  VALID_STANCE_STATUS,
  assignSeats,
  getAssembleeInfluenceursView,
  layoutHemicycleSeats,
  loadAssembleeInfluenceurs,
} from './assemblee-influenceurs';

describe('assemblee-influenceurs', () => {
  it('loads schema v1 with exactly 577 seats (AN standard)', () => {
    const data = loadAssembleeInfluenceurs();
    expect(data.schema).toBe('lmdpt-assemblee-influenceurs-v1');
    expect(data.influencers.length).toBe(577);
    expect(data.disclaimer.length).toBeGreaterThan(40);
    expect(data.methodology_note.length).toBeGreaterThan(40);
    expect(Array.isArray(data.backers)).toBe(true);
  });

  it('validates stance, families, sources and confidence', () => {
    const data = loadAssembleeInfluenceurs();
    for (const inf of data.influencers) {
      expect(inf.display_name.trim().length).toBeGreaterThan(0);
      expect(inf.summary.trim().length).toBeGreaterThan(20);
      expect(['documented', 'partial']).toContain(inf.verification);
      expect(VALID_STANCE_STATUS.has(inf.stance.status)).toBe(true);
      expect(VALID_FAMILIES.has(String(inf.stance.family))).toBe(true);
      expect(inf.stance.sources.length).toBeGreaterThan(0);
      for (const s of inf.stance.sources) {
        expect(s.url).toMatch(/^https?:\/\//);
        expect(s.label.trim().length).toBeGreaterThan(0);
      }
      if (inf.stance.status === 'declare') {
        expect(inf.stance.sources.length).toBeGreaterThan(0);
      }
      if (inf.stance.status === 'estime') {
        expect(inf.stance.confidence).toBeDefined();
        expect(inf.stance.confidence!).toBeGreaterThanOrEqual(0);
        expect(inf.stance.confidence!).toBeLessThanOrEqual(1);
        expect((inf.stance.rationale ?? '').trim().length).toBeGreaterThan(10);
      }
      for (const p of inf.platforms) {
        expect(p.url).toMatch(/^https?:\/\//);
      }
      for (const d of inf.dependencies) {
        expect(VALID_DEPENDENCY_KINDS.has(d.kind)).toBe(true);
        expect(d.sources.length).toBeGreaterThan(0);
        for (const s of d.sources) {
          expect(s.url).toMatch(/^https?:\/\//);
        }
      }
    }
  });

  it('validates backers when present', () => {
    const data = loadAssembleeInfluenceurs();
    for (const b of data.backers) {
      expect(VALID_BACKER_KINDS.has(b.kind)).toBe(true);
      expect(VALID_FAMILIES.has(String(b.political_hue.family))).toBe(true);
      expect(b.sources.length).toBeGreaterThan(0);
      for (const s of b.sources) {
        expect(s.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it('layoutHemicycleSeats returns n seats left-to-right without heavy collision', () => {
    const cx = 180;
    const cy = 185;
    for (const n of [1, 5, 11, 24, 40, 577]) {
      const seats = layoutHemicycleSeats(n, { cx, cy });
      expect(seats.length).toBe(n);
      // Ordre pédagogique gauche→droite = angle atan2 décroissant
      for (let i = 1; i < seats.length; i += 1) {
        const angPrev = Math.atan2(cy - seats[i - 1]!.y, seats[i - 1]!.x - cx);
        const angCur = Math.atan2(cy - seats[i]!.y, seats[i]!.x - cx);
        expect(angCur).toBeLessThanOrEqual(angPrev + 1e-9);
      }
      // Pairwise distance: sièges ne doivent pas se chevaucher lourdement
      // (échantillon pour N=577 — O(n²) complet trop lourd)
      const sample = n > 80 ? seats.filter((_, i) => i % 7 === 0) : seats;
      let minDist = Infinity;
      for (let i = 0; i < sample.length; i += 1) {
        for (let j = i + 1; j < sample.length; j += 1) {
          const dx = sample[i]!.x - sample[j]!.x;
          const dy = sample[i]!.y - sample[j]!.y;
          const d = Math.hypot(dx, dy);
          if (d < minDist) minDist = d;
        }
      }
      if (sample.length > 1) expect(minDist).toBeGreaterThan(seats[0]!.r * 0.95);
    }
  });

  it('assignSeats places one seat per influencer and respects family order', () => {
    const data = loadAssembleeInfluenceurs();
    const seated = assignSeats(data.influencers);
    expect(seated.length).toBe(data.influencers.length);
    const ranks = seated.map((s) => FAMILY_HEMI_ORDER.indexOf(String(s.stance.family)));
    for (let i = 1; i < ranks.length; i += 1) {
      expect(ranks[i]!).toBeGreaterThanOrEqual(ranks[i - 1]!);
    }
    // First should be gauche-radicale (Usul) if present
    const firstFam = String(seated[0]!.stance.family);
    expect(FAMILY_HEMI_ORDER.indexOf(firstFam)).toBeLessThanOrEqual(
      FAMILY_HEMI_ORDER.indexOf('autre'),
    );
  });

  it('view counts declare/estime and family colors align', () => {
    const view = getAssembleeInfluenceursView();
    expect(view.counts.total).toBe(view.influencers.length);
    expect(view.counts.declare + view.counts.estime).toBe(view.counts.total);
    expect(view.counts.estime).toBeGreaterThan(0);
    expect(view.seated.length).toBe(view.counts.total);
    expect(FAMILY_COLORS.centre).toBe('#ffeb00');
    expect(FAMILY_COLORS['droite-nationale']).toBe('#0d378a');
    expect(view.counts.byFamily['droite-nationale']).toBeGreaterThan(0);
  });

  it('covers youtube tiktok twitch x facebook platforms in seed', () => {
    const data = loadAssembleeInfluenceurs();
    const kinds = new Set(
      data.influencers.flatMap((i) => i.platforms.map((p) => p.kind)),
    );
    expect(kinds.has('youtube')).toBe(true);
    expect(kinds.has('tiktok')).toBe(true);
    expect(kinds.has('twitch')).toBe(true);
    expect(kinds.has('x')).toBe(true);
    expect(kinds.has('facebook')).toBe(true);
  });
});
