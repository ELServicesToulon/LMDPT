import { describe, expect, it } from 'vitest';
import {
  FAMILY_COLORS,
  VALID_FAMILIES,
  VALID_FUNDING_KINDS,
  countFundingByKind,
  getIndependanceView,
  loadIndependanceDataset,
  resolveHueColor,
  sortMediaByName,
} from './independance-medias';

describe('independance-medias', () => {
  it('loads schema v1 with 12 media seed', () => {
    const data = loadIndependanceDataset();
    expect(data.schema).toBe('lmdpt-independance-medias-v1');
    expect(data.media.length).toBe(12);
    expect(data.disclaimer.length).toBeGreaterThan(20);
    expect(data.methodology_note.length).toBeGreaterThan(20);
  });

  it('requires funding sources and valid kinds/families', () => {
    const data = loadIndependanceDataset();
    for (const m of data.media) {
      expect(m.funding.length).toBeGreaterThan(0);
      expect(['documented', 'partial']).toContain(m.verification);
      expect(m.independence_summary.trim().length).toBeGreaterThan(20);
      for (const f of m.funding) {
        expect(VALID_FUNDING_KINDS.has(f.kind)).toBe(true);
        expect(VALID_FAMILIES.has(String(f.political_hue.family))).toBe(true);
        expect(f.sources.length).toBeGreaterThan(0);
        for (const s of f.sources) {
          expect(s.url).toMatch(/^https?:\/\//);
          expect(s.label.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('resolves family colors', () => {
    expect(resolveHueColor({ family: 'droite', label: 'x' })).toBe(
      FAMILY_COLORS.droite,
    );
    expect(
      resolveHueColor({ family: 'centre', label: 'x', color: '#abcdef' }),
    ).toBe('#abcdef');
  });

  it('enriches view with resolved hue colors', () => {
    const view = getIndependanceView();
    expect(view.media.length).toBe(12);
    const firstFlux = view.media[0].funding[0];
    expect(firstFlux.political_hue.color).toMatch(/^#/);
  });

  it('counts funding by kind and sorts by name', () => {
    const data = loadIndependanceDataset();
    const counts = countFundingByKind(data.media);
    expect(counts.subvention_etat).toBeGreaterThan(0);
    expect(counts.audiovisuel_public).toBeGreaterThan(0);
    expect(counts.capital_prive).toBeGreaterThan(0);
    const sorted = sortMediaByName(data.media);
    expect(sorted.length).toBe(12);
    expect(
      sorted[0].name.localeCompare(sorted[1].name, 'fr', { sensitivity: 'base' }),
    ).toBeLessThanOrEqual(0);
  });
});
