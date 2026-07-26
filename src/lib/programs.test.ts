import { describe, expect, it } from 'vitest';
import {
  buildChiffrageSummary,
  buildCompareRows,
  buildFamilyChiffrageSummary,
  formatMdeur,
  listSubthemes,
} from './program-compare';
import { lintAllProgramFiles, lintChiffrage } from './program-chiffrage';
import {
  defaultCrossFamilySlugs,
  filterCandidatesByFamily,
  getCandidateFamilyId,
  groupCandidatesByFamily,
  listFamiliesForCandidates,
} from './program-families';
import {
  buildProgramIntegrationReport,
  buildThemeCoverageMatrix,
  programRelatedDataGouvLinks,
} from './program-coverage';
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
    expect(bardella!.measures.length).toBeGreaterThanOrEqual(7);
    expect(bardella!.chiffrages.some((c) => c.type === 'solde' && c.auteur === 'lmdpt')).toBe(
      true,
    );
    const barrot = getCandidateProgram('presidentielle-2027', 'barrot');
    expect(barrot?.measures).toHaveLength(2);
    const lePen = getCandidateProgram('presidentielle-2027', 'le-pen');
    expect(lePen?.measures.some((m) => m.id.includes('eligibilite'))).toBe(true);
    expect(lePen!.measures.length).toBeGreaterThanOrEqual(8);
    expect(lePen!.chiffrages.some((c) => c.auteur === 'lmdpt')).toBe(true);
    const philippe = getCandidateProgram('presidentielle-2027', 'philippe');
    expect(philippe!.measures.length).toBeGreaterThanOrEqual(6);
    const retailleau = getCandidateProgram('presidentielle-2027', 'retailleau');
    expect(retailleau!.measures.some((m) => m.theme === 'immigration')).toBe(true);
    const mel = getCandidateProgram('presidentielle-2027', 'melenchon');
    expect(mel!.measures.length).toBeGreaterThanOrEqual(8);
    expect(mel!.chiffrages.some((c) => c.type === 'solde' && c.auteur === 'lmdpt')).toBe(true);
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

  it('lists subthemes and filters compare rows (P17-1)', () => {
    const bardella = getCandidateProgram('presidentielle-2027', 'bardella')!;
    const mel = getCandidateProgram('presidentielle-2027', 'melenchon')!;
    expect(bardella.measures.some((m) => m.subtheme)).toBe(true);
    const subs = listSubthemes([bardella, mel], 'immigration');
    expect(subs.length).toBeGreaterThan(0);
    const filtered = buildCompareRows([bardella, mel], 'immigration', subs[0]);
    expect(filtered.every((r) => r.subtheme === subs[0])).toBe(true);
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
    expect(summary.every((r) => r.familyId && r.familyLabel)).toBe(true);
  });

  it('builds theme coverage matrix and P10-4 integration gate', () => {
    const files = listCandidates('presidentielle-2027');
    const matrix = buildThemeCoverageMatrix(files, 'presidentielle-2027');
    expect(matrix.rows).toHaveLength(11);
    expect(matrix.subthemeRate).toBe(1);
    expect(matrix.totalMeasures).toBeGreaterThanOrEqual(70);
    expect(matrix.fillRate).toBeGreaterThan(0.1);
    const report = buildProgramIntegrationReport('presidentielle-2027');
    expect(report.allMeasuresHaveSubtheme).toBe(true);
    expect(report.candidateCount).toBe(11);
    expect(report.dataGouvLinks).toBeGreaterThanOrEqual(4);
    expect(report.gateOk).toBe(true);
    expect(programRelatedDataGouvLinks().some((l) => l.href === '/sources')).toBe(true);
    const brun = getCandidateProgram('presidentielle-2027', 'philippe-brun');
    expect(brun!.measures.length).toBeGreaterThanOrEqual(6);
    expect(brun!.measures.every((m) => m.subtheme?.trim())).toBe(true);
  });

  it('builds family chiffrage summary for 2027 (P8-5)', () => {
    const files = listCandidates('presidentielle-2027');
    const familySummary = buildFamilyChiffrageSummary(files);
    expect(familySummary.length).toBeGreaterThanOrEqual(4);
    const rn = familySummary.find((r) => r.familyId === 'droite-nationale');
    expect(rn).toBeDefined();
    expect(rn!.candidateCount).toBeGreaterThanOrEqual(2);
    expect(rn!.soldeLmdptAvg).toBe(-72);
    const gauche = familySummary.find((r) => r.familyId === 'gauche-radicale');
    expect(gauche?.withChiffrage).toBeGreaterThanOrEqual(1);
  });

  it('formats Md€', () => {
    expect(formatMdeur(-44.5)).toContain('Md€');
    expect(formatMdeur(null)).toBe('—');
  });
});

describe('program-families (P8-5)', () => {
  it('maps 2027 candidates to political families', () => {
    expect(getCandidateFamilyId('bardella')).toBe('droite-nationale');
    expect(getCandidateFamilyId('le-pen')).toBe('droite-nationale');
    expect(getCandidateFamilyId('melenchon')).toBe('gauche-radicale');
    expect(getCandidateFamilyId('attal')).toBe('centre');
    expect(getCandidateFamilyId('retailleau')).toBe('droite');
    expect(getCandidateFamilyId('parti-socialiste')).toBe('social-democrate');
  });

  it('filters and groups by family', () => {
    const all = listCandidates('presidentielle-2027');
    const rn = filterCandidatesByFamily(all, 'droite-nationale');
    expect(rn.every((c) => getCandidateFamilyId(c.candidate.slug) === 'droite-nationale')).toBe(
      true,
    );
    expect(rn.length).toBe(2);
    const groups = groupCandidatesByFamily(all);
    expect(groups.map((g) => g.family.id)).toContain('centre');
    expect(listFamiliesForCandidates(all).length).toBeGreaterThanOrEqual(4);
  });

  it('defaults cross-family selection for balanced comparator', () => {
    const slugs = defaultCrossFamilySlugs(listCandidates('presidentielle-2027'), 4);
    expect(slugs.length).toBeGreaterThanOrEqual(3);
    const families = new Set(slugs.map((s) => getCandidateFamilyId(s)));
    expect(families.size).toBeGreaterThanOrEqual(3);
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
