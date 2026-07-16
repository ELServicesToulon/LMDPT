import { describe, expect, it } from 'vitest';
import {
  buildChiffrageSummary,
  buildCompareRows,
  formatMdeur,
} from './program-compare';
import { lintAllProgramFiles, lintChiffrage } from './program-chiffrage';
import {
  getAllProgramFiles,
  getCandidateProgram,
  getEvolutionMatrix,
  listCandidates,
  listScrutins,
} from './programs';

describe('programs', () => {
  it('lists scrutins including 2017 and 2022', () => {
    const ids = listScrutins().map((s) => s.id);
    expect(ids).toContain('presidentielle-2017');
    expect(ids).toContain('presidentielle-2022');
    expect(ids).toContain('presidentielle-2027');
  });

  it('loads 5 candidates for 2022', () => {
    expect(listCandidates('presidentielle-2022')).toHaveLength(5);
  });

  it('loads 2027 partial programmes', () => {
    expect(listCandidates('presidentielle-2027')).toHaveLength(11);
    const ps = getCandidateProgram('presidentielle-2027', 'parti-socialiste');
    expect(ps?.measures.length).toBeGreaterThanOrEqual(7);
    expect(ps?.chiffrages.some((c) => c.auteur === 'lmdpt')).toBe(true);
    const brun = getCandidateProgram('presidentielle-2027', 'philippe-brun');
    expect(brun?.program.status).toBe('partial');
    const bardella = getCandidateProgram('presidentielle-2027', 'bardella');
    expect(bardella?.evolution_from).toBe('presidentielle-2022');
    const barrot = getCandidateProgram('presidentielle-2027', 'barrot');
    expect(barrot?.measures).toHaveLength(2);
    const lePen = getCandidateProgram('presidentielle-2027', 'le-pen');
    expect(lePen?.measures.some((m) => m.id.includes('eligibilite'))).toBe(true);
  });

  it('evolution matrix includes 2027 melenchon entries', () => {
    const matrix = getEvolutionMatrix();
    const melInst = matrix.links.find(
      (l) => l.family_slug === 'melenchon' && l.theme === 'institutions',
    );
    expect(melInst?.entries.some((e) => e.scrutin === 'presidentielle-2027')).toBe(true);
  });

  it('loads macron 2022 with Institut Montaigne chiffrages', () => {
    const f = getCandidateProgram('presidentielle-2022', 'macron');
    expect(f?.chiffrages.some((c) => c.auteur === 'institut_montaigne')).toBe(true);
    expect(f?.chiffrages.some((c) => c.auteur === 'lmdpt')).toBe(true);
  });
});

describe('program-compare', () => {
  it('builds compare rows for left 2027', () => {
    const ps = getCandidateProgram('presidentielle-2027', 'parti-socialiste')!;
    const mel = getCandidateProgram('presidentielle-2027', 'melenchon')!;
    const rows = buildCompareRows([ps, mel], 'retraites');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('builds compare rows for two candidates', () => {
    const macron = getCandidateProgram('presidentielle-2022', 'macron')!;
    const lePen = getCandidateProgram('presidentielle-2022', 'le-pen')!;
    const rows = buildCompareRows([macron, lePen]);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((r) => r.byCandidate.macron)).toBe(true);
  });

  it('builds chiffrage summary with IM solde', () => {
    const files = listCandidates('presidentielle-2022').slice(0, 3);
    const summary = buildChiffrageSummary(files);
    expect(summary.every((r) => r.soldeIm != null || r.name)).toBe(true);
  });

  it('formats Md€', () => {
    expect(formatMdeur(-44.5)).toContain('Md€');
    expect(formatMdeur(null)).toBe('—');
  });
});

describe('program-chiffrage lint', () => {
  it('passes lint on all program files', () => {
    const issues = lintAllProgramFiles(getAllProgramFiles());
    expect(issues).toEqual([]);
  });

  it('flags lmdpt without method_note', () => {
    const issues = lintChiffrage({
      id: 'x',
      type: 'solde',
      montant_mdeur: -1,
      horizon: '2027',
      auteur: 'lmdpt',
      confidence: 'faible',
    });
    expect(issues.length).toBeGreaterThan(0);
  });
});
