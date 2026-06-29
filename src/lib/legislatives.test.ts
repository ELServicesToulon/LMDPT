import { describe, expect, it } from 'vitest';
import { countLeadersByNuance, getCirconscriptionResults } from './circonscriptions';
import { getElection } from './elections';

describe('legislatives 2024', () => {
  it('loads national dataset with RN leading', () => {
    const data = getElection('2024-legislatives');
    expect(data).toBeDefined();
    expect(data?.national.candidats[0]?.nom).toContain('Rassemblement National');
    expect(data?.national.abstention_pct).toBeCloseTo(33.29, 1);
  });

  it('loads 577 circonscriptions', () => {
    const circo = getCirconscriptionResults('2024-legislatives');
    expect(circo?.circonscriptions).toHaveLength(577);
    expect(circo?.source).toContain('data.gouv.fr');
  });

  it('counts RN leaders in most circonscriptions', () => {
    const circo = getCirconscriptionResults('2024-legislatives');
    const leaders = countLeadersByNuance(circo!);
    expect(leaders[0]?.code).toBe('RN');
    expect(leaders[0]?.count).toBeGreaterThan(200);
  });
});