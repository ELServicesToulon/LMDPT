import { describe, expect, it } from 'vitest';
import { ANALYSIS_CATALOG, getAnalysis } from './analyses';

describe('analyses', () => {
  it('lists presidential and legislatives dossiers', () => {
    expect(ANALYSIS_CATALOG.length).toBeGreaterThanOrEqual(2);
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('presidentielle-distorsion');
  });

  it('resolves analysis by slug', () => {
    expect(getAnalysis('legislatives-2024-desistements')?.href).toBe(
      '/analyses/legislatives-2024-desistements',
    );
  });
});
