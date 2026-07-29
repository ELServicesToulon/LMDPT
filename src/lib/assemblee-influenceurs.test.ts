import { describe, expect, it } from 'vitest';
import {
  FAMILY_COLORS,
  FAMILY_HEMI_ORDER,
  HEMI_ZOOM_TIERS,
  VALID_BACKER_KINDS,
  VALID_DEPENDENCY_KINDS,
  VALID_FAMILIES,
  VALID_FOREIGN_LINK_KINDS,
  VALID_STANCE_STATUS,
  assignSeats,
  getAssembleeInfluenceursView,
  layoutHemicycleSeats,
  loadAssembleeInfluenceurs,
  normalizeAssembleeCategory,
  resolveAudience,
  resolveForeignSignal,
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

  it('documents stance_history when present (évolutions sourcées)', () => {
    const data = loadAssembleeInfluenceurs();
    const withHist = data.influencers.filter((i) => (i.stance_history?.length ?? 0) > 0);
    expect(withHist.length).toBeGreaterThanOrEqual(8);
    const tv = data.influencers.find((i) => i.id === 'tatiana-ventose');
    expect(tv).toBeTruthy();
    expect(String(tv!.stance.family)).toBe('droite-nationale');
    expect(tv!.stance_history?.length).toBeGreaterThanOrEqual(2);
    for (const h of tv!.stance_history ?? []) {
      expect(h.as_of.trim().length).toBeGreaterThan(0);
      expect(VALID_FAMILIES.has(String(h.family))).toBe(true);
      expect(h.motifs.length).toBeGreaterThan(0);
      expect(h.sources.length).toBeGreaterThan(0);
      for (const s of h.sources) expect(s.url).toMatch(/^https?:\/\//);
    }
    // Basculé depuis la gauche
    expect(tv!.stance_history!.some((h) => h.family === 'gauche-radicale')).toBe(true);
  });

  it('Casus Lady: Soral/Reconquête → liberté d’expression (zone Knafo/Lisnard)', () => {
    const data = loadAssembleeInfluenceurs();
    const cl = data.influencers.find((i) => i.id === 'casus-lady');
    expect(cl).toBeTruthy();
    expect(String(cl!.stance.family)).toBe('droite');
    expect(cl!.stance.status).toBe('estime');
    expect((cl!.stance.confidence ?? 1)).toBeLessThanOrEqual(0.5);
    expect(cl!.stance_history?.length).toBeGreaterThanOrEqual(3);
    expect(cl!.stance_history!.some((h) => h.family === 'droite-nationale')).toBe(true);
    expect(cl!.stance.rationale.toLowerCase()).toMatch(/knafo|lisnard|libert/);
  });

  it('focus égal Nathan Keskon + Ali Babal (@BolbBilal) + Jack Le Fou', () => {
    const data = loadAssembleeInfluenceurs();
    const nk = data.influencers.find((i) => i.id === 'nathan-keskon');
    const ab = data.influencers.find((i) => i.id === 'ali-babal-bolb-bilal');
    const jlf = data.influencers.find((i) => i.id === 'jack-le-fou');
    expect(nk).toBeTruthy();
    expect(ab).toBeTruthy();
    expect(jlf).toBeTruthy();
    expect(nk!.category).toBe('societe-civile');
    expect(ab!.category).toBe('societe-civile');
    expect(jlf!.category).toBe('societe-civile');
    expect(String(nk!.stance.family)).toBe('autre');
    expect(String(ab!.stance.family)).toBe('autre');
    expect(String(jlf!.stance.family)).toBe('autre');
    expect(nk!.summary.length).toBeGreaterThan(120);
    expect(ab!.summary.length).toBeGreaterThan(120);
    expect(jlf!.summary.length).toBeGreaterThan(120);
    expect(nk!.platforms.some((p) => p.url.includes('nathankeskon69'))).toBe(true);
    expect(ab!.platforms.some((p) => p.url.includes('BolbBilal'))).toBe(true);
    expect(jlf!.platforms.some((p) => p.url.includes('JackLeFouX'))).toBe(true);
    expect((nk!.stance_history?.length ?? 0)).toBeGreaterThanOrEqual(1);
    expect((ab!.stance_history?.length ?? 0)).toBeGreaterThanOrEqual(1);
    expect((jlf!.stance_history?.length ?? 0)).toBeGreaterThanOrEqual(1);
  });

  it('nourishes descriptions for all seats', () => {
    const data = loadAssembleeInfluenceurs();
    for (const inf of data.influencers) {
      expect(inf.summary.trim().length).toBeGreaterThan(100);
      expect((inf.stance.rationale ?? '').trim().length).toBeGreaterThan(20);
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

  it('assignSeats puts higher audiences on front rows (row 0)', () => {
    const data = loadAssembleeInfluenceurs();
    const seated = assignSeats(data.influencers);
    expect(seated.length).toBe(data.influencers.length);
    const byRow = new Map<number, number[]>();
    for (const s of seated) {
      const list = byRow.get(s.seat.row) ?? [];
      list.push(s.audienceResolved.followers_total);
      byRow.set(s.seat.row, list);
    }
    const rows = [...byRow.keys()].sort((a, b) => a - b);
    expect(rows.length).toBeGreaterThan(1);
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    // Rang avant (row 0) ≥ rang arrière (dernière row) en moyenne
    expect(avg(byRow.get(rows[0]!)!)).toBeGreaterThan(avg(byRow.get(rows.at(-1)!)!));
    // Casus Lady (~68k) devant un député typique (~<45k)
    const casus = seated.find((s) => s.id === 'casus-lady');
    expect(casus).toBeTruthy();
    const backbenchDeputies = seated.filter(
      (s) =>
        s.category === 'elu-parlementaire' &&
        s.audienceResolved.followers_total < (casus!.audienceResolved.followers_total),
    );
    expect(backbenchDeputies.length).toBeGreaterThan(50);
    const maxDeputyBehind = Math.max(...backbenchDeputies.map((s) => s.seat.row));
    expect(casus!.seat.row).toBeLessThanOrEqual(maxDeputyBehind);
  });

  it('resolves foreign links fail-closed and ranks RT/Sputnik/AJ+ in front', () => {
    const data = loadAssembleeInfluenceurs();
    const rt = data.influencers.find(
      (i) => i.id === 'rt-en-fran-ais-comptes-sociaux-rtenfrancais',
    );
    const sputnik = data.influencers.find(
      (i) => i.id === 'sputnik-comptes-sociaux-fr-sputnik-fr',
    );
    const aj = data.influencers.find((i) => i.id === 'aj-plus-francais');
    const hugo = data.influencers.find((i) => i.id === 'hugo-decrypte');
    expect(rt && sputnik && aj && hugo).toBeTruthy();
    const rtSig = resolveForeignSignal(rt!);
    const sputnikSig = resolveForeignSignal(sputnik!);
    const ajSig = resolveForeignSignal(aj!);
    const hugoSig = resolveForeignSignal(hugo!);
    expect(rtSig.signal).toBeGreaterThanOrEqual(6); // organe + sanction
    expect(sputnikSig.signal).toBeGreaterThanOrEqual(6);
    expect(ajSig.signal).toBeGreaterThanOrEqual(2);
    expect(hugoSig.signal).toBe(0);
    expect(hugoSig.links).toEqual([]);
    for (const link of [...rtSig.links, ...sputnikSig.links, ...ajSig.links]) {
      expect(VALID_FOREIGN_LINK_KINDS.has(link.kind)).toBe(true);
      expect(link.sources.length).toBeGreaterThan(0);
      for (const s of link.sources) expect(s.url).toMatch(/^https?:\/\//);
    }
    const seatedForeign = assignSeats(data.influencers, { rankBy: 'foreign' });
    const rtSeat = seatedForeign.find((s) => s.id === rt!.id)!;
    const hugoSeat = seatedForeign.find((s) => s.id === hugo!.id)!;
    // Peu de fiches documentées → toutes au 1er rang avec d’autres sièges (départage audience).
    expect(rtSeat.seat.row).toBe(0);
    expect(rtSeat.foreignResolved.signal).toBeGreaterThan(hugoSeat.foreignResolved.signal);
    const documentedRows = seatedForeign
      .filter((s) => s.foreignResolved.signal > 0)
      .map((s) => s.seat.row);
    expect(Math.max(...documentedRows)).toBe(0);
    const view = getAssembleeInfluenceursView();
    expect(view.counts.foreignDocumented).toBeGreaterThanOrEqual(3);
    expect(view.seated.find((s) => s.id === rt!.id)?.seatForeign).toBeTruthy();
  });

  it('resolveAudience prefers overrides for known mega-comptes', () => {
    const data = loadAssembleeInfluenceurs();
    const hugo = data.influencers.find((i) => i.id === 'hugo-decrypte');
    expect(hugo).toBeTruthy();
    const aud = resolveAudience(hugo!);
    expect(aud.followers_total).toBeGreaterThan(1_000_000);
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

  it('normalizes categories and exposes byCategory (influenceurs default < 50)', () => {
    expect(normalizeAssembleeCategory(undefined)).toBe('influenceur');
    expect(normalizeAssembleeCategory(null)).toBe('influenceur');
    expect(normalizeAssembleeCategory('societe-civile')).toBe('societe-civile');
    expect(normalizeAssembleeCategory('elu-parlementaire')).toBe('elu-parlementaire');
    const view = getAssembleeInfluenceursView();
    const { influenceur, 'societe-civile': civile, 'elu-parlementaire': elus } =
      view.counts.byCategory;
    expect(influenceur + civile + elus).toBe(577);
    expect(influenceur).toBeGreaterThan(0);
    expect(influenceur).toBeLessThan(50);
    expect(elus).toBeGreaterThan(200);
    expect(HEMI_ZOOM_TIERS.fit).toBe(1);
    expect(HEMI_ZOOM_TIERS.lire).toBe(2);
    expect(HEMI_ZOOM_TIERS.detail).toBe(3.5);
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
