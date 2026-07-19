import type { ProgramCandidateFile, ProgramMeasure, ProgramThemeId } from './program-types';
import { getThemeLabel } from './programs';

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
  recettesCandidat: number | null;
  recettesIm: number | null;
  recettesLmdpt: number | null;
  depensesCandidat: number | null;
  depensesIm: number | null;
  depensesLmdpt: number | null;
  soldeIm: number | null;
  soldeLmdpt: number | null;
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
  return candidates.map((file) => ({
    slug: file.candidate.slug,
    name: file.candidate.name,
    recettesCandidat: chiffrageByType(file, 'recettes', 'candidat'),
    recettesIm: chiffrageByType(file, 'recettes', 'institut_montaigne'),
    recettesLmdpt: chiffrageByType(file, 'recettes', 'lmdpt'),
    depensesCandidat: chiffrageByType(file, 'depenses', 'candidat'),
    depensesIm: chiffrageByType(file, 'depenses', 'institut_montaigne'),
    depensesLmdpt: chiffrageByType(file, 'depenses', 'lmdpt'),
    soldeIm: chiffrageByType(file, 'solde', 'institut_montaigne'),
    soldeLmdpt: chiffrageByType(file, 'solde', 'lmdpt'),
  }));
}

export function formatMdeur(n: number | null): string {
  if (n == null) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Md€`;
}
