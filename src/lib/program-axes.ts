/**
 * Grands axes programmes — propositions par candidat et par thème.
 * Vue pédagogique (pas de ranking ni de prédiction).
 */
import type { ProgramCandidateFile, ProgramMeasure, ProgramThemeId } from './program-types';
import { PROGRAM_THEMES, getThemeLabel, listCandidates } from './programs';
import { getCandidateFamily } from './program-families';
import { ensureMeasureSubtheme } from './program-coverage';

export interface AxisCandidateProposal {
  slug: string;
  name: string;
  affiliation: string;
  familyLabel: string;
  familyId: string;
  measures: ProgramMeasure[];
  /** Première mesure (accroche) */
  headline: string | null;
}

export interface ProgramAxisBoard {
  themeId: ProgramThemeId;
  themeLabel: string;
  measureCount: number;
  candidateCount: number;
  proposals: AxisCandidateProposal[];
  /** Candidats du scrutin sans mesure sur cet axe */
  silentSlugs: string[];
}

export interface ProgramAxesPageData {
  scrutinId: string;
  axes: ProgramAxisBoard[];
  candidates: Array<{ slug: string; name: string; affiliation: string; familyLabel: string }>;
  totalMeasures: number;
  themesCovered: number;
}

/** Construit le tableau des grands axes : pour chaque thème, les propositions par candidat. */
export function buildProgramAxesBoard(
  scrutinId: string,
  candidates?: ProgramCandidateFile[],
): ProgramAxesPageData {
  const files = candidates ?? listCandidates(scrutinId);
  const candidateIndex = files.map((f) => ({
    slug: f.candidate.slug,
    name: f.candidate.name,
    affiliation: f.candidate.affiliation,
    familyLabel: getCandidateFamily(f.candidate.slug).shortLabel,
  }));

  let totalMeasures = 0;
  const axes: ProgramAxisBoard[] = [];

  for (const theme of PROGRAM_THEMES) {
    const themeId = theme.id as ProgramThemeId;
    const proposals: AxisCandidateProposal[] = [];
    const withMeasure = new Set<string>();

    for (const file of files) {
      const measures = file.measures
        .filter((m) => m.theme === themeId)
        .map(ensureMeasureSubtheme)
        .sort((a, b) => {
          // chiffrées d'abord, puis alpha
          const ca = a.chiffrage_mdeur != null ? 0 : 1;
          const cb = b.chiffrage_mdeur != null ? 0 : 1;
          if (ca !== cb) return ca - cb;
          return a.label.localeCompare(b.label, 'fr');
        });
      if (measures.length === 0) continue;
      withMeasure.add(file.candidate.slug);
      totalMeasures += measures.length;
      const fam = getCandidateFamily(file.candidate.slug);
      proposals.push({
        slug: file.candidate.slug,
        name: file.candidate.name,
        affiliation: file.candidate.affiliation,
        familyLabel: fam.shortLabel,
        familyId: fam.id,
        measures,
        headline: measures[0]?.label ?? null,
      });
    }

    // ordre pédagogique familles
    proposals.sort((a, b) => {
      const oa = getCandidateFamily(a.slug).order;
      const ob = getCandidateFamily(b.slug).order;
      if (oa !== ob) return oa - ob;
      return a.name.localeCompare(b.name, 'fr');
    });

    const silentSlugs = files
      .map((f) => f.candidate.slug)
      .filter((s) => !withMeasure.has(s));

    axes.push({
      themeId,
      themeLabel: getThemeLabel(themeId),
      measureCount: proposals.reduce((n, p) => n + p.measures.length, 0),
      candidateCount: proposals.length,
      proposals,
      silentSlugs,
    });
  }

  // axes avec contenu d'abord, puis vides
  axes.sort((a, b) => {
    if (a.measureCount === 0 && b.measureCount > 0) return 1;
    if (b.measureCount === 0 && a.measureCount > 0) return -1;
    return b.measureCount - a.measureCount || a.themeLabel.localeCompare(b.themeLabel, 'fr');
  });

  return {
    scrutinId,
    axes,
    candidates: candidateIndex,
    totalMeasures,
    themesCovered: axes.filter((a) => a.measureCount > 0).length,
  };
}
