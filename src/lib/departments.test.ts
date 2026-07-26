import { describe, expect, it } from 'vitest';
import { getDepartmentMapReadiness, getDepartmentResults } from './departments';

describe('departments', () => {
  it('loads 2022 départemental dataset with many depts', () => {
    const d = getDepartmentResults('2022-presidentielle');
    expect(d).toBeDefined();
    expect(d!.departements.length).toBeGreaterThan(90);
  });

  it('registers 2027 stub pipeline with zero départements', () => {
    const d = getDepartmentResults('2027-presidentielle');
    expect(d).toBeDefined();
    expect(d!.election).toContain('2027');
    expect(d!.departements).toEqual([]);
    expect(d!.source_label.toLowerCase()).toContain('stub');
  });

  it('reports map readiness stub for 2027', () => {
    const r = getDepartmentMapReadiness('2027-presidentielle');
    expect(r.registered).toBe(true);
    expect(r.stub).toBe(true);
    expect(r.map_ready).toBe(false);
    expect(r.dept_count).toBe(0);
  });

  it('reports map ready for 2022', () => {
    const r = getDepartmentMapReadiness('2022-presidentielle');
    expect(r.map_ready).toBe(true);
    expect(r.stub).toBe(false);
  });
});
