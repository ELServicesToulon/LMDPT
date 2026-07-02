import type { ProgramCandidateFile, ProgramMeasure, ProgramThemeId } from './program-types';
import { getThemeLabel } from './programs';

export interface CompareRow {
  theme: ProgramThemeId;
  themeLabel: string;
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

/** Lignes comparatives par thème — une ligne par mesure du premier candidat sélectionné ayant ce thème. */
export function buildCompareRows(
  candidates: ProgramCandidateFile[],
  themeFilter?: ProgramThemeId,
): CompareRow[] {
  const slugs = candidates.map((c) => c.candidate.slug);
  const rows: CompareRow[] = [];
  const seen = new Set<string>();

  for (const file of candidates) {
    for (const m of file.measures) {
      if (themeFilter && m.theme !== themeFilter) continue;
      const key = `${m.theme}::${m.label}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const byCandidate: Record<string, string | null> = {};
      const chiffrages: number[] = [];
      const sources: string[] = [];

      for (const slug of slugs) {
        const cf = candidates.find((c) => c.candidate.slug === slug);
        const match = cf?.measures.find(
          (x) => x.theme === m.theme && x.label === m.label,
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
    return a.measureLabel.localeCompare(b.measureLabel, 'fr');
  });
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
