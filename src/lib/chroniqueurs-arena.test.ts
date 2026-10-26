import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ANALYSIS_CATALOG } from './analyses';
import { FIRST_ROUND_HUES } from './comment-politics';
import {
  allocateCheck,
  computeKnot,
  loadArena,
  teaserForChronique,
  validateArenaData,
  type ChroniqueursArenaData,
  type FactCheck,
} from './chroniqueurs-arena';

function fixtureCheck(overrides: Partial<FactCheck> = {}): FactCheck {
  return {
    id: 'fc-test',
    chronique_slug: 'mouvement-lyceen-revendications-saucissonne',
    label: 'Affirmation de test',
    status: 'confirme',
    weight: 2,
    supports_hues: ['pluraliste'],
    source: { label: 'Test', url: 'https://lmdpt.iarbre.org/charte/' },
    reviewed_at: '2026-10-08',
    reviewer_role: 'modo',
    ...overrides,
  };
}

describe('chroniqueurs arena registry', () => {
  it('validates the committed JSON against hues, slugs and reviewer role', () => {
    const arena = loadArena();
    expect(arena.chroniqueurs.some((c) => c.id === 'manusk' && c.status === 'actif')).toBe(true);
    expect(arena.chroniqueurs.filter((c) => c.status === 'invite_vide').length).toBeGreaterThanOrEqual(2);
    expect(arena.fact_checks.length).toBeGreaterThanOrEqual(8);
    for (const hue of FIRST_ROUND_HUES) {
      expect(arena.hue_to_side[hue.slug]).toMatch(/^(gauche|droite|centre|exclu)$/);
    }
  });

  it('keeps the retired Manusk tribune out of the public analysis catalog', () => {
    const arena = loadArena();
    const archived = arena.chroniques.find(
      (entry) => entry.slug === 'on-a-vole-la-revolution-puis-la-revolte',
    );
    expect(archived?.catalog).toBe('archive');
    expect(archived?.href).toBeNull();
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).not.toContain(
      'on-a-vole-la-revolution-puis-la-revolte',
    );
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain(
      'mouvement-lyceen-revendications-saucissonne',
    );
  });

  it('rejects a check without review date or below modo', () => {
    const arena = loadArena();
    const clone: ChroniqueursArenaData = {
      ...arena,
      fact_checks: [{ ...arena.fact_checks[0]!, reviewed_at: '' }],
    };
    expect(() => validateArenaData(clone)).toThrow(/date invalide/);

    const junior: ChroniqueursArenaData = {
      ...arena,
      fact_checks: [{ ...arena.fact_checks[0]!, reviewer_role: 'contributeur' }],
    };
    expect(() => validateArenaData(junior)).toThrow(/reviewer_role/);
  });
});

describe('knot math', () => {
  it('stays at documentary center when nothing pulls', () => {
    const arena = loadArena();
    const knot = computeKnot(arena, []);
    expect(knot.knotRatio).toBe(0);
    expect(knot.knotPercent).toBe(50);
    expect(knot.inNeutralZone).toBe(true);
    expect(knot.bootstrapping).toBe(true);
    expect(knot.totals).toEqual({ gauche: 0, droite: 0, transversal: 0 });
  });

  it('ignores debattu and non_etaye for the rope', () => {
    const arena = loadArena();
    const ignored = [
      fixtureCheck({ id: 'a', status: 'debattu', supports_hues: ['le-pen'] }),
      fixtureCheck({ id: 'b', status: 'non_etaye', supports_hues: ['melenchon'] }),
      fixtureCheck({ id: 'c', status: 'confirme', supports_hues: ['pluraliste'] }),
    ];
    const knot = computeKnot(arena, ignored);
    expect(knot.totals.gauche).toBe(0);
    expect(knot.totals.droite).toBe(0);
    expect(knot.totals.transversal).toBe(2);
    expect(knot.pullingCheckCount).toBe(0);
    expect(knot.knotPercent).toBe(50);
  });

  it('halves partiel weight and counts same-side hues once', () => {
    const arena = loadArena();
    const check = fixtureCheck({
      status: 'partiel',
      weight: 2,
      supports_hues: ['melenchon', 'parti-socialiste'],
    });
    expect(allocateCheck(check, arena.hue_to_side)).toEqual({
      gauche: 1,
      droite: 0,
      transversal: 0,
    });
  });

  it('splits both-side hues 50/50 unless explicit weights are set', () => {
    const arena = loadArena();
    const split = allocateCheck(
      fixtureCheck({ supports_hues: ['melenchon', 'le-pen'], weight: 2 }),
      arena.hue_to_side,
    );
    expect(split).toEqual({ gauche: 1, droite: 1, transversal: 0 });

    const explicit = allocateCheck(
      fixtureCheck({
        supports_hues: ['melenchon', 'le-pen'],
        weight_left: 3,
        weight_right: 1,
      }),
      arena.hue_to_side,
    );
    expect(explicit).toEqual({ gauche: 3, droite: 1, transversal: 0 });
  });

  it('moves the knot toward the heavier documented side', () => {
    const arena = loadArena();
    const knot = computeKnot(arena, [
      fixtureCheck({ id: 'g', supports_hues: ['melenchon'], weight: 3 }),
      fixtureCheck({ id: 'd', supports_hues: ['retailleau'], weight: 1 }),
    ]);
    expect(knot.knotRatio).toBe(-0.5);
    expect(knot.knotPercent).toBe(30);
    expect(knot.inNeutralZone).toBe(false);
    expect(knot.bootstrapping).toBe(false);
  });

  it('computes the live registry knot from published checks', () => {
    const knot = computeKnot(loadArena());
    expect(knot.checkCount).toBe(loadArena().fact_checks.length);
    expect(knot.knotPercent).toBeGreaterThanOrEqual(10);
    expect(knot.knotPercent).toBeLessThanOrEqual(90);
    expect(knot.lastReviewed).toBe('2026-10-08');
  });
});

describe('tribune teaser and public links', () => {
  it('exposes a teaser for the public Manusk tribune', () => {
    const teaser = teaserForChronique('mouvement-lyceen-revendications-saucissonne');
    expect(teaser?.href).toBe('/analyses/mouvement-lyceen-revendications-saucissonne/');
    expect(teaser?.checkCount).toBeGreaterThan(0);
  });

  it('does not invent a public URL for the archived tribune', () => {
    const teaser = teaserForChronique('on-a-vole-la-revolution-puis-la-revolte');
    expect(teaser?.catalog).toBe('archive');
    expect(teaser?.href).toBeNull();
  });

  it('links the arena from charte and redaction pages', () => {
    const charte = readFileSync(path.join(process.cwd(), 'src/pages/charte.astro'), 'utf8');
    const redaction = readFileSync(path.join(process.cwd(), 'src/pages/redaction/index.astro'), 'utf8');
    expect(charte).toContain('href="/chroniqueurs/"');
    expect(redaction).toContain('href="/chroniqueurs/"');
  });

  it('embeds an arena teaser on the public Manusk tribune', () => {
    const src = readFileSync(
      path.join(process.cwd(), 'src/pages/analyses/mouvement-lyceen-revendications-saucissonne.astro'),
      'utf8',
    );
    expect(src).toContain('<ChroniqueursArenaTeaser');
    expect(src).toContain('slug={data.slug}');
  });
});
