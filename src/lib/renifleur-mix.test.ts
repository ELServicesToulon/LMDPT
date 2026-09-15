import { describe, expect, it } from 'vitest';
import { FIRST_ROUND_HUES } from './comment-politics';
import {
  BLOC_TO_HUE_SLUGS,
  HUE_SLUG_TO_BLOC,
  MIX_BLOCS,
  computeBlocMixTargets,
  defaultMixTargets,
  l1Deviation,
  mixKeyForHueSlug,
  rebalanceItemsByPoliticalHue,
  selectItemsWithMixReport,
  type MixTarget,
  type PollMixCandidate,
} from './renifleur-mix';
import { capItemsByHostShare, type RenifleurItem } from './renifleur';

function hueItem(
  opts: {
    url: string;
    slug: string;
    published?: string;
    source_id?: string;
  },
): RenifleurItem {
  return {
    title: opts.slug,
    url: opts.url,
    published: opts.published ?? '2026-09-15',
    summary: '',
    source_id: opts.source_id ?? 'src',
    source_label: opts.source_id ?? 'src',
    source_type: 'traditional',
    politicalHue: {
      slug: opts.slug,
      label: opts.slug,
      color: '#000000',
      confidence: 0.8,
      rationale: 'test',
    },
  };
}

const SAMPLE_TARGETS: MixTarget[] = [
  { bloc: 'rn', hue_slugs: ['le-pen', 'bardella'], winner_slug: 'le-pen', raw_pct: 35, target_pct: 35 },
  { bloc: 'centre', hue_slugs: ['attal'], winner_slug: 'attal', raw_pct: 15, target_pct: 15 },
  { bloc: 'gauche', hue_slugs: ['melenchon'], winner_slug: 'melenchon', raw_pct: 15, target_pct: 15 },
  { bloc: 'centre-droit', hue_slugs: ['philippe'], winner_slug: 'philippe', raw_pct: 15, target_pct: 15 },
  { bloc: 'droite', hue_slugs: ['retailleau'], winner_slug: 'retailleau', raw_pct: 10, target_pct: 10 },
  { bloc: 'gauche-sociale-democrate', hue_slugs: ['glucksmann'], winner_slug: 'glucksmann', raw_pct: 10, target_pct: 10 },
];

describe('renifleur-mix', () => {
  it('maps every documented bloc and every non-pluraliste hue slug exactly once', () => {
    const mapped = new Set(Object.keys(HUE_SLUG_TO_BLOC));
    for (const bloc of MIX_BLOCS) {
      expect(BLOC_TO_HUE_SLUGS[bloc]).toBeDefined();
    }
    for (const hue of FIRST_ROUND_HUES) {
      if (hue.slug === 'pluraliste') {
        expect(HUE_SLUG_TO_BLOC[hue.slug]).toBeUndefined();
        continue;
      }
      expect(mapped.has(hue.slug)).toBe(true);
    }
    expect(mixKeyForHueSlug('le-pen')).toBe('rn');
    expect(mixKeyForHueSlug('bardella')).toBe('rn');
    expect(mixKeyForHueSlug('pluraliste')).toBe('pluraliste');
  });

  it('takes one best score per bloc then renormalizes to 100%', () => {
    const candidates: PollMixCandidate[] = [
      { slug: 'le-pen', name: 'MLP', bloc: 'rn', latest_pct: 35.5, avg_pct: 34.5 },
      { slug: 'bardella', name: 'JB', bloc: 'rn', latest_pct: null, avg_pct: 34.5 },
      { slug: 'philippe', bloc: 'centre-droit', latest_pct: 16.5, avg_pct: 17.5 },
      { slug: 'darmanin', bloc: 'centre-droit', latest_pct: null, avg_pct: 8.8 },
      { slug: 'melenchon', bloc: 'gauche', latest_pct: 15.5, avg_pct: 14 },
      { slug: 'attal', bloc: 'centre', latest_pct: 12, avg_pct: 13.5 },
      { slug: 'skip-me', bloc: 'centre', latest_pct: null, avg_pct: null },
    ];
    const targets = computeBlocMixTargets(candidates);
    const blocs = targets.map((t) => t.bloc);
    expect(blocs).toEqual(['rn', 'centre-droit', 'gauche', 'centre']);
    expect(targets[0]?.winner_slug).toBe('le-pen');
    expect(targets.find((t) => t.bloc === 'centre-droit')?.winner_slug).toBe('philippe');
    const sum = targets.reduce((acc, t) => acc + t.target_pct, 0);
    expect(sum).toBeCloseTo(100, 5);
    expect(targets[0]?.target_pct).toBeGreaterThan(40);
  });

  it('builds live sondages targets that sum to ~100 and keep RN as top bloc', () => {
    const targets = defaultMixTargets();
    const sum = targets.reduce((acc, t) => acc + t.target_pct, 0);
    expect(sum).toBeGreaterThan(99.5);
    expect(sum).toBeLessThan(100.5);
    expect(targets[0]?.bloc).toBe('rn');
    expect(targets[0]?.hue_slugs).toEqual(['le-pen', 'bardella']);
  });

  it('rebalances a RN-heavy pool toward poll bloc shares', () => {
    const items: RenifleurItem[] = [];
    const rnHosts = [
      'lemonde.fr',
      'lefigaro.fr',
      'liberation.fr',
      'la-croix.com',
      'publicsenat.fr',
      'francetvinfo.fr',
      'france24.com',
      'assemblee-nationale.fr',
    ];
    for (const host of rnHosts) {
      items.push(hueItem({ url: `https://www.${host}/rn-a`, slug: 'le-pen', published: '2026-09-20' }));
      items.push(hueItem({ url: `https://www.${host}/rn-b`, slug: 'le-pen', published: '2026-09-19' }));
    }
    items.push(
      hueItem({ url: 'https://www.lefigaro.fr/attal', slug: 'attal', published: '2026-09-01' }),
      hueItem({ url: 'https://www.liberation.fr/lfi', slug: 'melenchon', published: '2026-09-01' }),
      hueItem({ url: 'https://www.la-croix.com/ph', slug: 'philippe', published: '2026-09-01' }),
      hueItem({ url: 'https://www.publicsenat.fr/lr', slug: 'retailleau', published: '2026-09-01' }),
      hueItem({ url: 'https://www.francetvinfo.fr/pp', slug: 'glucksmann', published: '2026-09-01' }),
    );

    const recency = capItemsByHostShare(items, 0.4, 10);
    const mixed = rebalanceItemsByPoliticalHue(items, {
      maxTotal: 10,
      maxSharePerHost: 0.4,
      targets: SAMPLE_TARGETS,
    });

    expect(mixed.length).toBe(10);
    const rnMixed = mixed.filter((i) => i.politicalHue?.slug === 'le-pen').length;
    const rnRecency = recency.filter((i) => i.politicalHue?.slug === 'le-pen').length;
    expect(rnRecency).toBeGreaterThanOrEqual(8);
    expect(rnMixed).toBeLessThan(rnRecency);
    expect(mixed.some((i) => i.politicalHue?.slug === 'attal')).toBe(true);
    expect(mixed.some((i) => i.politicalHue?.slug === 'melenchon')).toBe(true);
    const targetByBloc = Object.fromEntries(SAMPLE_TARGETS.map((t) => [t.bloc, t.target_pct]));
    expect(l1Deviation(mixed, targetByBloc)).toBeLessThan(l1Deviation(recency, targetByBloc));
  });

  it('keeps the per-host cap while mixing hues', () => {
    const items: RenifleurItem[] = [];
    for (let i = 0; i < 12; i++) {
      items.push(hueItem({ url: `https://www.lemonde.fr/${i}`, slug: 'le-pen', published: '2026-09-15' }));
    }
    for (let i = 0; i < 8; i++) {
      items.push(hueItem({ url: `https://www.lefigaro.fr/${i}`, slug: 'attal', published: '2026-09-14' }));
    }
    const mixed = rebalanceItemsByPoliticalHue(items, {
      maxTotal: 10,
      maxSharePerHost: 0.4,
      targets: SAMPLE_TARGETS,
    });
    expect(mixed.filter((i) => i.url.includes('lemonde.fr')).length).toBeLessThanOrEqual(4);
    expect(mixed.filter((i) => i.url.includes('lefigaro.fr')).length).toBeLessThanOrEqual(4);
    expect(mixed.length).toBeGreaterThan(0);
  });

  it('does not empty a thin pool', () => {
    const items = [
      hueItem({ url: 'https://www.lemonde.fr/a', slug: 'pluraliste', published: '2026-09-15' }),
      hueItem({ url: 'https://www.lemonde.fr/b', slug: 'ecolo', published: '2026-09-14' }),
    ];
    const mixed = rebalanceItemsByPoliticalHue(items, {
      maxTotal: 35,
      maxSharePerHost: 0.4,
      targets: SAMPLE_TARGETS,
    });
    expect(mixed).toHaveLength(2);
  });

  it('returns an empty selection for an empty pool', () => {
    expect(
      rebalanceItemsByPoliticalHue([], {
        maxTotal: 35,
        maxSharePerHost: 0.4,
        targets: SAMPLE_TARGETS,
      }),
    ).toEqual([]);
  });

  it('writes before/after mix stats on the report', () => {
    const collected = [
      ...Array.from({ length: 8 }, (_, i) =>
        hueItem({ url: `https://www.lemonde.fr/${i}`, slug: 'le-pen', published: '2026-09-15' }),
      ),
      hueItem({ url: 'https://www.liberation.fr/lfi', slug: 'melenchon', published: '2026-09-14' }),
    ];
    const { items, report } = selectItemsWithMixReport(collected, {
      maxTotal: 8,
      maxSharePerHost: 0.4,
      targets: SAMPLE_TARGETS,
      generatedAt: '2026-09-15T12:00:00.000Z',
    });
    expect(items.length).toBeGreaterThan(0);
    expect(report.doe).toMatch(/pas une prédiction/i);
    expect(report.method).toBe('v1-best-per-bloc-renormalized');
    expect(report.before.item_count).toBeGreaterThan(0);
    expect(report.after.item_count).toBe(items.length);
    expect(report.after.l1_deviation).toBeLessThanOrEqual(report.before.l1_deviation);
  });
});
