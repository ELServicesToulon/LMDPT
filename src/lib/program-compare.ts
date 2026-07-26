import type { ProgramCandidateFile, ProgramMeasure, ProgramThemeId } from './program-types';
import { getThemeLabel } from './programs';
import {
  getCandidateFamily,
  getCandidateFamilyId,
  groupCandidatesByFamily,
  type PoliticalFamilyId,
} from './program-families';

export interface CompareRow {
  theme: ProgramThemeId;
  themeLabel: string;
  subtheme?: string;
  measureKey: string;
  measureLabel: string;
  byCandidate: Record<string, string | null>;
  chiffrageSpreadMdeur: number | null;
  sources: string[];
}

export interface ChiffrageSummaryRow {
  slug: string;
  name: string;
  familyId: PoliticalFamilyId;
  familyLabel: string;
  recettesCandidat: number | null;
  recettesIm: number | null;
  recettesLmdpt: number | null;
  depensesCandidat: number | null;
  depensesIm: number | null;
  depensesLmdpt: number | null;
  soldeIm: number | null;
  soldeLmdpt: number | null;
}

/** Agrégat chiffrage par famille politique (P8-5). */
export interface FamilyChiffrageRow {
  familyId: PoliticalFamilyId;
  familyLabel: string;
  candidateCount: number;
  candidateNames: string[];
  /** Moyenne des soldes LMDPT disponibles dans la famille */
  soldeLmdptAvg: number | null;
  soldeLmdptMin: number | null;
  soldeLmdptMax: number | null;
  /** Moyenne soldes IM si présents */
  soldeImAvg: number | null;
  /** Nombre de candidats avec au moins un chiffrage */
  withChiffrage: number;
  measureCount: number;
  themesCovered: number;
}

function measureCell(m: ProgramMeasure | undefined): string | null {
  if (!m) return null;
  const parts = [m.label];
  if (m.chiffrage_mdeur != null) {
    parts.push(`(${m.chiffrage_mdeur} Md€)`);
  }
  return parts.join(' ');
}

function findMeasureByTheme(
  file: ProgramCandidateFile,
  theme: ProgramThemeId,
  measureKey: string,
): ProgramMeasure | undefined {
  return file.measures.find((m) => m.theme === theme && m.id.includes(measureKey));
}

/** Lignes comparatives par thème — une ligne par mesure unique (thème + label). */
export function buildCompareRows(
  candidates: ProgramCandidateFile[],
  themeFilter?: ProgramThemeId,
  subthemeFilter?: string,
): CompareRow[] {
  const slugs = candidates.map((c) => c.candidate.slug);
  const rows: CompareRow[] = [];
  const seen = new Set<string>();

  for (const file of candidates) {
    for (const m of file.measures) {
      if (themeFilter && m.theme !== themeFilter) continue;
      if (subthemeFilter && (m.subtheme || '') !== subthemeFilter) continue;
      const key = `${m.theme}::${m.subtheme || ''}::${m.label}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const byCandidate: Record<string, string | null> = {};
      const chiffrages: number[] = [];
      const sources: string[] = [];

      for (const slug of slugs) {
        const cf = candidates.find((c) => c.candidate.slug === slug);
        const match = cf?.measures.find(
          (x) =>
            x.theme === m.theme &&
            x.label === m.label &&
            (x.subtheme || '') === (m.subtheme || ''),
        );
        byCandidate[slug] = measureCell(match);
        if (match?.chiffrage_mdeur != null) chiffrages.push(match.chiffrage_mdeur);
        if (match?.source_label) sources.push(match.source_label);
      }

      let spread: number | null = null;
      if (chiffrages.length >= 2) {
        spread = Math.max(...chiffrages) - Math.min(...chiffrages);
      }

      rows.push({
        theme: m.theme,
        themeLabel: getThemeLabel(m.theme),
        subtheme: m.subtheme,
        measureKey: m.id,
        measureLabel: m.label,
        byCandidate,
        chiffrageSpreadMdeur: spread,
        sources: [...new Set(sources)],
      });
    }
  }

  return rows.sort((a, b) => {
    const t = a.themeLabel.localeCompare(b.themeLabel, 'fr');
    if (t !== 0) return t;
    const s = (a.subtheme || '').localeCompare(b.subtheme || '', 'fr');
    if (s !== 0) return s;
    return a.measureLabel.localeCompare(b.measureLabel, 'fr');
  });
}

/** Sous-thèmes présents dans un ensemble de programmes (pour filtres UI). */
export function listSubthemes(
  candidates: ProgramCandidateFile[],
  themeFilter?: ProgramThemeId,
): string[] {
  const set = new Set<string>();
  for (const f of candidates) {
    for (const m of f.measures) {
      if (themeFilter && m.theme !== themeFilter) continue;
      if (m.subtheme?.trim()) set.add(m.subtheme.trim());
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'fr'));
}

function chiffrageByType(
  file: ProgramCandidateFile,
  type: 'recettes' | 'depenses' | 'solde',
  auteur: string,
): number | null {
  const c = file.chiffrages.find((x) => x.type === type && x.auteur === auteur);
  return c?.montant_mdeur ?? null;
}

export function buildChiffrageSummary(candidates: ProgramCandidateFile[]): ChiffrageSummaryRow[] {
  return candidates.map((file) => {
    const family = getCandidateFamily(file.candidate.slug);
    return {
      slug: file.candidate.slug,
      name: file.candidate.name,
      familyId: family.id,
      familyLabel: family.shortLabel,
      recettesCandidat: chiffrageByType(file, 'recettes', 'candidat'),
      recettesIm: chiffrageByType(file, 'recettes', 'institut_montaigne'),
      recettesLmdpt: chiffrageByType(file, 'recettes', 'lmdpt'),
      depensesCandidat: chiffrageByType(file, 'depenses', 'candidat'),
      depensesIm: chiffrageByType(file, 'depenses', 'institut_montaigne'),
      depensesLmdpt: chiffrageByType(file, 'depenses', 'lmdpt'),
      soldeIm: chiffrageByType(file, 'solde', 'institut_montaigne'),
      soldeLmdpt: chiffrageByType(file, 'solde', 'lmdpt'),
    };
  });
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Agrège les chiffrages par famille politique (granularité P8-5). */
export function buildFamilyChiffrageSummary(
  candidates: ProgramCandidateFile[],
): FamilyChiffrageRow[] {
  return groupCandidatesByFamily(candidates).map(({ family, candidates: files }) => {
    const soldesLmdpt = files
      .map((f) => chiffrageByType(f, 'solde', 'lmdpt'))
      .filter((n): n is number => n != null);
    const soldesIm = files
      .map((f) => chiffrageByType(f, 'solde', 'institut_montaigne'))
      .filter((n): n is number => n != null);
    const themes = new Set<string>();
    let measureCount = 0;
    let withChiffrage = 0;
    for (const f of files) {
      measureCount += f.measures.length;
      if (f.chiffrages.length > 0) withChiffrage += 1;
      for (const m of f.measures) themes.add(m.theme);
    }
    return {
      familyId: family.id,
      familyLabel: family.label,
      candidateCount: files.length,
      candidateNames: files.map((f) => f.candidate.name),
      soldeLmdptAvg: avg(soldesLmdpt),
      soldeLmdptMin: soldesLmdpt.length ? Math.min(...soldesLmdpt) : null,
      soldeLmdptMax: soldesLmdpt.length ? Math.max(...soldesLmdpt) : null,
      soldeImAvg: avg(soldesIm),
      withChiffrage,
      measureCount,
      themesCovered: themes.size,
    };
  });
}

export function formatMdeur(n: number | null): string {
  if (n == null) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Md€`;
}

/** Alias pour ré-export UI (filtre famille). */
export { getCandidateFamilyId, getCandidateFamily };
