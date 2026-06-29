import { describe, expect, it } from 'vitest';
import preparation from '../data/analyses/presidentielle-2027-preparation.json';
import { ANALYSIS_CATALOG, getAnalysis } from './analyses';

describe('analyses', () => {
  it('lists presidential, legislatives and 2027 preparation dossiers', () => {
    expect(ANALYSIS_CATALOG.length).toBeGreaterThanOrEqual(3);
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('presidentielle-distorsion');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('presidentielle-2027-preparation');
  });

  it('resolves analysis by slug', () => {
    expect(getAnalysis('legislatives-2024-desistements')?.href).toBe(
      '/analyses/legislatives-2024-desistements',
    );
    expect(getAnalysis('presidentielle-2027-preparation')?.preparation).toBe(true);
  });

  it('2027 preparation stub lists official sources', () => {
    expect(preparation.status).toBe('preparation');
    expect(preparation.sources.length).toBeGreaterThanOrEqual(5);
    expect(preparation.milestones.length).toBeGreaterThanOrEqual(3);
    expect(preparation.scope.exclu.some((item) => /sondage/i.test(item))).toBe(true);
  });
});