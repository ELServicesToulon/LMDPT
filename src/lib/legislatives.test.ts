import { describe, expect, it } from 'vitest';
import {
  aggregateDepartmentLeadersFromCircos,
  countLeadersByNuance,
  getCirconscriptionResults,
} from './circonscriptions';
import deptPaths from '../data/geo/departments-paths.json';
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

  it('aggregates department map from circonscriptions', () => {
    const circo = getCirconscriptionResults('2024-legislatives');
    const names = new Map(deptPaths.departements.map((d) => [d.code, d.nom]));
    const depts = aggregateDepartmentLeadersFromCircos(circo!, names);
    expect(depts.length).toBeGreaterThan(90);
    const ain = depts.find((d) => d.code === '01');
    expect(ain?.circo_count).toBe(5);
    expect(ain?.breakdown[0]?.count).toBeGreaterThan(0);
  });
});

describe('legislatives 2024 T2 (élus réels)', () => {
  it('loads national T2 dataset with RN leading in votes', () => {
    const data = getElection('2024-legislatives-t2');
    expect(data).toBeDefined();
    expect(data?.tour).toBe(2);
    expect(data?.national.candidats[0]?.nom).toBe('RN');
    expect(data?.national.abstention_pct).toBeCloseTo(33.37, 1);
  });

  it('loads 577 seats: 501 T2 + 76 T1', () => {
    const circo = getCirconscriptionResults('2024-legislatives-t2');
    expect(circo?.circonscriptions).toHaveLength(577);
    expect(circo?.circonscriptions.filter((c) => c.elu_tour === 2)).toHaveLength(501);
    expect(circo?.circonscriptions.filter((c) => c.elu_tour === 1)).toHaveLength(76);
    expect(circo?.source).toContain('data.gouv.fr');
  });

  it('counts UG as the largest seat bloc', () => {
    const circo = getCirconscriptionResults('2024-legislatives-t2');
    const leaders = countLeadersByNuance(circo!);
    expect(leaders[0]?.code).toBe('UG');
    expect(leaders[0]?.count).toBe(178);
    expect(leaders.find((l) => l.code === 'ENS')?.count).toBe(150);
    expect(leaders.find((l) => l.code === 'RN')?.count).toBe(125);
  });
});