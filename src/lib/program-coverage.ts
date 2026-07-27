/**
 * Couverture thématique programmes + liens données ouvertes (P10-4).
 * Granularité : thème × candidat + sous-thèmes + datasets data.gouv du 1er tour.
 */
import type { ProgramCandidateFile, ProgramMeasure, ProgramThemeId } from './program-types';
import { PROGRAM_THEMES, getThemeLabel, listCandidates } from './programs';
import { ELECTION_CATALOG_QUERIES } from './datasets-map';
import { getCandidateFamily } from './program-families';

/** Sous-thème par défaut si la mesure n'en a pas (granularité comparateur). */
export const DEFAULT_SUBTHEME_BY_THEME: Record<ProgramThemeId, string> = {
  fiscalite: 'TVA & impôts',
  retraites: 'Âge légal',
  europe: 'Souveraineté',
  climat: 'Transition',
  sante: 'Accès aux soins',
  education: 'École',
  securite: 'Ordre public',
  immigration: 'Priorité nationale',
  institutions: 'Gouvernance',
  pouvoir_achat: 'Salaires',
  entreprises: 'Emploi & industrie',
  logement: 'Accès au logement',
  defense: 'Capacités',
  justice: 'Procédure',
  numerique: 'Services publics',
};

export function defaultSubthemeForTheme(theme: ProgramThemeId): string {
  return DEFAULT_SUBTHEME_BY_THEME[theme] ?? 'Général';
}

export function ensureMeasureSubtheme(m: ProgramMeasure): ProgramMeasure {
  if (m.subtheme?.trim()) return m;
  return { ...m, subtheme: defaultSubthemeForTheme(m.theme) };
}

export function normalizeFileSubthemes(file: ProgramCandidateFile): ProgramCandidateFile {
  return {
    ...file,
    measures: file.measures.map(ensureMeasureSubtheme),
  };
}

export interface ThemeCoverageCell {
  count: number;
  hasChiffrage: boolean;
  subthemes: string[];
}

export interface CandidateCoverageRow {
  slug: string;
  name: string;
  familyLabel: string;
  measureCount: number;
  themesCovered: number;
  subthemeCoverage: number;
  chiffrageCount: number;
  programStatus: string;
  byTheme: Record<ProgramThemeId, ThemeCoverageCell>;
}

export interface ThemeCoverageMatrix {
  scrutinId: string;
  themes: Array<{ id: ProgramThemeId; label: string }>;
  rows: CandidateCoverageRow[];
  /** % cellules (candidat×thème) avec ≥1 mesure */
  fillRate: number;
  totalMeasures: number;
  measuresWithSubtheme: number;
  subthemeRate: number;
}

export function buildThemeCoverageMatrix(
  candidates: ProgramCandidateFile[],
  scrutinId = 'presidentielle-2027',
): ThemeCoverageMatrix {
  const themes = PROGRAM_THEMES.map((t) => ({ id: t.id as ProgramThemeId, label: t.label }));
  let totalMeasures = 0;
  let measuresWithSubtheme = 0;
  let filledCells = 0;
  const totalCells = candidates.length * themes.length;

  const rows: CandidateCoverageRow[] = candidates.map((file) => {
    const byTheme = {} as Record<ProgramThemeId, ThemeCoverageCell>;
    for (const t of themes) {
      byTheme[t.id] = { count: 0, hasChiffrage: false, subthemes: [] };
    }
    const subSet = new Set<string>();
    for (const m of file.measures) {
      totalMeasures += 1;
      if (m.subtheme?.trim()) {
        measuresWithSubtheme += 1;
        subSet.add(m.subtheme.trim());
      }
      const cell = byTheme[m.theme];
      if (!cell) continue;
      cell.count += 1;
      if (m.chiffrage_mdeur != null) cell.hasChiffrage = true;
      if (m.subtheme?.trim() && !cell.subthemes.includes(m.subtheme.trim())) {
        cell.subthemes.push(m.subtheme.trim());
      }
    }
    for (const t of themes) {
      if (byTheme[t.id].count > 0) filledCells += 1;
    }
    const family = getCandidateFamily(file.candidate.slug);
    return {
      slug: file.candidate.slug,
      name: file.candidate.name,
      familyLabel: family.shortLabel,
      measureCount: file.measures.length,
      themesCovered: themes.filter((t) => byTheme[t.id].count > 0).length,
      subthemeCoverage: subSet.size,
      chiffrageCount: file.chiffrages.length,
      programStatus: file.program.status ?? 'partial',
      byTheme,
    };
  });

  return {
    scrutinId,
    themes,
    rows: rows.sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    fillRate: totalCells > 0 ? filledCells / totalCells : 0,
    totalMeasures,
    measuresWithSubtheme,
    subthemeRate: totalMeasures > 0 ? measuresWithSubtheme / totalMeasures : 0,
  };
}

/** Jeux data.gouv liés à la lecture pluralité 1er tour (pas aux programmes eux-mêmes). */
export interface ProgramDataGouvLink {
  label: string;
  href: string;
  note: string;
}

export function programRelatedDataGouvLinks(): ProgramDataGouvLink[] {
  return [
    {
      label: 'Sources LMDPT (manifest data.gouv)',
      href: '/sources',
      note: 'Licences Etalab/ODbL · journal des datasets synchronisés',
    },
    {
      label: 'Atlas présidentielle 2022 (résultats 1er tour)',
      href: '/atlas/2022-presidentielle',
      note: 'Granularité nationale + départements — données ouvertes du ministère de l’Intérieur via data.gouv',
    },
    {
      label: 'Atlas présidentielle 2017',
      href: '/atlas/2017-presidentielle',
      note: 'Même structure — comparatif historique pluralité',
    },
    {
      label: 'Atlas législatives 2024 (577 circo)',
      href: '/atlas/2024-legislatives',
      note: 'Granularité circonscription — résultats officiels 1er tour',
    },
    {
      label: 'Catalogue data.gouv — élections',
      href: 'https://www.data.gouv.fr/fr/datasets/?q=%C3%A9lection+pr%C3%A9sidentielle',
      note: `Requêtes catalogue : ${ELECTION_CATALOG_QUERIES.slice(0, 3).join(' · ')}…`,
    },
  ];
}

export interface ProgramIntegrationReport {
  scrutinId: string;
  candidateCount: number;
  measureCount: number;
  subthemeRate: number;
  fillRate: number;
  allMeasuresHaveSubtheme: boolean;
  minMeasuresPerCandidate: number;
  thinCandidates: string[];
  dataGouvLinks: number;
  gateOk: boolean;
  gateNotes: string[];
}

/**
 * Gate P10-4 (L0 structure) :
 * - 11 fiches 2027
 * - 100 % mesures avec subtheme
 * - matrice couverture calculable
 * - liens data.gouv présents
 * - aucun candidat intégré à 0 mesure
 */
export function buildProgramIntegrationReport(
  scrutinId = 'presidentielle-2027',
): ProgramIntegrationReport {
  const candidates = listCandidates(scrutinId);
  const matrix = buildThemeCoverageMatrix(candidates, scrutinId);
  const counts = candidates.map((c) => c.measures.length);
  const minMeasures = counts.length ? Math.min(...counts) : 0;
  const thin = candidates
    .filter((c) => c.measures.length < 3)
    .map((c) => c.candidate.slug);
  const links = programRelatedDataGouvLinks();
  const notes: string[] = [];
  if (candidates.length < 11) notes.push(`fiches ${candidates.length}/11`);
  if (matrix.subthemeRate < 1) {
    notes.push(`subtheme ${(matrix.subthemeRate * 100).toFixed(0)}%`);
  }
  if (minMeasures < 1) notes.push('candidat sans mesure');
  if (links.length < 4) notes.push('liens data.gouv incomplets');
  const gateOk =
    candidates.length >= 11 &&
    matrix.subthemeRate >= 1 &&
    minMeasures >= 1 &&
    links.length >= 4;

  return {
    scrutinId,
    candidateCount: candidates.length,
    measureCount: matrix.totalMeasures,
    subthemeRate: matrix.subthemeRate,
    fillRate: matrix.fillRate,
    allMeasuresHaveSubtheme: matrix.subthemeRate >= 1,
    minMeasuresPerCandidate: minMeasures,
    thinCandidates: thin,
    dataGouvLinks: links.length,
    gateOk,
    gateNotes: notes,
  };
}

export function formatPct(rate: number): string {
  return `${Math.round(rate * 100)} %`;
}

export { getThemeLabel };
