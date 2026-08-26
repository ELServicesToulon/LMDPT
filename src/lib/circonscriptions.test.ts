import { describe, expect, it } from 'vitest';
import {
  compareFirstRoundPlurality,
  getCircoMapReadiness,
  getCirconscriptionGeoIndex,
  getCirconscriptionResults,
  listCircosByDepartment,
  mapDepartmentResultsToCircos,
  topNShareExprimes,
} from './circonscriptions';
import { getDepartmentResults } from './departments';
import { getElection } from './elections';

describe('circonscriptions geo index (P8-4)', () => {
  it('loads 577 geographic circonscriptions from 2024 base', () => {
    const geo = getCirconscriptionGeoIndex();
    expect(geo.count).toBe(577);
    expect(geo.circonscriptions).toHaveLength(577);
    expect(geo.source_election).toBe('2024-legislatives');
    const ain = listCircosByDepartment('01');
    expect(ain.length).toBe(5);
    expect(ain[0]?.code).toMatch(/^01/);
  });

  it('exposes official 2024 circo results via registry', () => {
    const circo = getCirconscriptionResults('2024-legislatives');
    expect(circo?.circonscriptions).toHaveLength(577);
  });

  it('exposes official 2024 T2 seat results via registry', () => {
    const circo = getCirconscriptionResults('2024-legislatives-t2');
    expect(circo?.circonscriptions).toHaveLength(577);
    expect(getCircoMapReadiness('2024-legislatives-t2').has_official_circo).toBe(true);
  });

  it('reports 2027 readiness without official circo yet', () => {
    const r = getCircoMapReadiness('2027-presidentielle');
    expect(r.geo_count).toBe(577);
    expect(r.has_official_circo).toBe(false);
    expect(r.note).toMatch(/2027|index géo|577/i);
  });
});

describe('dept → circo mapping', () => {
  it('maps 2017 presidential departments onto 577 circos (inherit-leader)', () => {
    const dept = getDepartmentResults('2017-presidentielle');
    expect(dept).toBeDefined();
    const mapped = mapDepartmentResultsToCircos(dept!, {
      election: 'test-2017-mapped',
      date: '2017-04-23',
      source: 'test',
      source_label: 'test',
      mode: 'inherit-leader',
    });
    expect(mapped.circonscriptions).toHaveLength(577);
    const ain = mapped.circonscriptions.filter((c) => c.departement === '01');
    expect(ain.length).toBe(5);
    // All Ain circos share the same departmental leader (pedagogical)
    const leaders = new Set(ain.map((c) => c.leader_nuance_code));
    expect(leaders.size).toBe(1);
    expect(ain[0]!.leader_pct).toBeGreaterThan(0);
    // Inscrits approx. partition of department
    const sumInscrits = ain.reduce((a, c) => a + c.inscrits, 0);
    const deptAin = dept!.departements.find((d) => d.code === '01');
    expect(sumInscrits).toBeGreaterThan((deptAin!.inscrits * 0.95) | 0);
    expect(sumInscrits).toBeLessThanOrEqual(deptAin!.inscrits + 5);
  });
});

describe('first-round plurality comparatives', () => {
  it('computes top3 share for 2017 / 2022 / 2027 national', () => {
    const e17 = getElection('2017-presidentielle')!;
    const e22 = getElection('2022-presidentielle')!;
    const e27 = getElection('2027-presidentielle')!;
    expect(topNShareExprimes(e17, 3)).toBeCloseTo(65.32, 0);
    expect(topNShareExprimes(e22, 3)).toBeCloseTo(72.95, 0);
    expect(topNShareExprimes(e27, 3)).toBeGreaterThan(50);

    const rows = compareFirstRoundPlurality([
      { slug: '2017-presidentielle', label: '2017', dataset: e17 },
      { slug: '2022-presidentielle', label: '2022', dataset: e22 },
      { slug: '2027-presidentielle', label: '2027 (proj.)', dataset: e27 },
    ]);
    expect(rows).toHaveLength(3);
    expect(rows[0]!.candidats).toBeGreaterThanOrEqual(11);
    // 2022 more concentrated than 2017
    expect(rows[1]!.top3_pct).toBeGreaterThan(rows[0]!.top3_pct);
  });
});
