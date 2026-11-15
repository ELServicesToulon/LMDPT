import { describe, expect, it } from 'vitest';
import data from '../data/observatoire-censure.json';
import {
  FACTUAL_TYPES,
  formatMeasureDate,
  isFactualType,
  latestMeasureDate,
  observatoireEntries,
} from './observatoire-censure';

describe('observatoire-censure dataset', () => {
  const entries = observatoireEntries();

  it('compte 25 fiches (14 médias + 11 comptes)', () => {
    expect(data.media).toHaveLength(14);
    expect(data.influencers).toHaveLength(11);
    expect(entries).toHaveLength(25);
  });

  it('n’expose plus de teinte politique', () => {
    for (const row of [...data.media, ...data.influencers] as Record<string, unknown>[]) {
      expect(row.political_hue_label).toBeUndefined();
      expect(row.political_hue).toBeUndefined();
    }
  });

  it('n’a pas de date d’ajout par fiche', () => {
    for (const row of [...data.media, ...data.influencers] as Record<string, unknown>[]) {
      expect(row.added).toBeUndefined();
      expect(row.added_at).toBeUndefined();
      expect(row.date).toBeUndefined();
    }
  });

  it('restreint les types factuels aux quatre valeurs', () => {
    expect(FACTUAL_TYPES).toEqual([
      'chaîne TV',
      'plateforme',
      'média en ligne',
      'autorité publique',
    ]);
    for (const entry of entries) {
      expect(isFactualType(entry.factual_type)).toBe(true);
    }
  });

  it('n’attribue aucune fiche « autorité publique » ni « plateforme »', () => {
    expect(entries.filter((e) => e.factual_type === 'autorité publique')).toHaveLength(0);
    expect(entries.filter((e) => e.factual_type === 'plateforme')).toHaveLength(0);
  });

  it('ne lie que des URL https de source officielle', () => {
    for (const entry of entries) {
      if (!entry.official_source_url) continue;
      expect(entry.official_source_url.startsWith('https://')).toBe(true);
      expect(entry.official_source_label).toBeTruthy();
    }
  });

  it('calcule la date de mesure la plus récente extraite', () => {
    const latest = latestMeasureDate(entries);
    expect(latest).toBe('2026-02');
    expect(formatMeasureDate(latest)).toBe('février 2026');
    expect(formatMeasureDate('2025-02-19')).toBe('19 février 2025');
    expect(formatMeasureDate(undefined)).toBe('—');
  });
});
