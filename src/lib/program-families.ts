/**
 * Familles politiques pour granularité comparateur programmes (P8-5).
 * Taxonomie pédagogique — pas de ranking ni de prédiction.
 */
import type { ProgramCandidateFile } from './program-types';

export type PoliticalFamilyId =
  | 'gauche-radicale'
  | 'social-democrate'
  | 'centre'
  | 'droite'
  | 'droite-nationale'
  | 'autre';

export interface PoliticalFamilyMeta {
  id: PoliticalFamilyId;
  label: string;
  shortLabel: string;
  /** Ordre d'affichage (gauche → droite pédagogique) */
  order: number;
  description: string;
}

export const POLITICAL_FAMILIES: PoliticalFamilyMeta[] = [
  {
    id: 'gauche-radicale',
    label: 'Gauche radicale (LFI & alliés)',
    shortLabel: 'Gauche radicale',
    order: 1,
    description: 'LFI, gauche dégagiste — rupture institutionnelle et sociale.',
  },
  {
    id: 'social-democrate',
    label: 'Social-démocrate (PS & alliés)',
    shortLabel: 'Social-démocrate',
    order: 2,
    description: 'Parti socialiste, primaires de gauche modérée.',
  },
  {
    id: 'centre',
    label: 'Centre (Renaissance / Horizons)',
    shortLabel: 'Centre',
    order: 3,
    description: 'Bloc central — Renaissance, Horizons, héritiers macroniens.',
  },
  {
    id: 'droite',
    label: 'Droite (LR / libérale)',
    shortLabel: 'Droite',
    order: 4,
    description: 'Les Républicains, Nouvelle Énergie et droite libérale.',
  },
  {
    id: 'droite-nationale',
    label: 'Droite nationale (RN)',
    shortLabel: 'Droite nationale',
    order: 5,
    description: 'Rassemblement national — continuité programme 2022.',
  },
  {
    id: 'autre',
    label: 'Autre / non classé',
    shortLabel: 'Autre',
    order: 9,
    description: 'Candidatures hors familles ci-dessus ou données insuffisantes.',
  },
];

/** Mapping slug candidat → famille (scrutins 2017 / 2022 / 2027). */
export const CANDIDATE_FAMILY: Record<string, PoliticalFamilyId> = {
  // 2027
  melenchon: 'gauche-radicale',
  ruffin: 'gauche-radicale',
  'parti-socialiste': 'social-democrate',
  'philippe-brun': 'social-democrate',
  attal: 'centre',
  barrot: 'centre',
  philippe: 'centre',
  retailleau: 'droite',
  lisnard: 'droite',
  'le-pen': 'droite-nationale',
  bardella: 'droite-nationale',
  // 2022
  macron: 'centre',
  pecresse: 'droite',
  zemmour: 'droite-nationale',
  // 2017
  fillon: 'droite',
  hamon: 'social-democrate',
};

export function getFamilyMeta(id: PoliticalFamilyId | string): PoliticalFamilyMeta {
  return (
    POLITICAL_FAMILIES.find((f) => f.id === id) ??
    POLITICAL_FAMILIES.find((f) => f.id === 'autre')!
  );
}

export function getCandidateFamilyId(slug: string): PoliticalFamilyId {
  return CANDIDATE_FAMILY[slug] ?? 'autre';
}

export function getCandidateFamily(slug: string): PoliticalFamilyMeta {
  return getFamilyMeta(getCandidateFamilyId(slug));
}

export function listFamiliesForCandidates(
  candidates: ProgramCandidateFile[],
): PoliticalFamilyMeta[] {
  const present = new Set(candidates.map((c) => getCandidateFamilyId(c.candidate.slug)));
  return POLITICAL_FAMILIES.filter((f) => present.has(f.id)).sort((a, b) => a.order - b.order);
}

export function filterCandidatesByFamily(
  candidates: ProgramCandidateFile[],
  familyId: PoliticalFamilyId | string | null | undefined,
): ProgramCandidateFile[] {
  if (!familyId) return candidates;
  return candidates.filter((c) => getCandidateFamilyId(c.candidate.slug) === familyId);
}

export interface FamilyGroup {
  family: PoliticalFamilyMeta;
  candidates: ProgramCandidateFile[];
}

/** Groupes par famille, ordre pédagogique gauche → droite. */
export function groupCandidatesByFamily(candidates: ProgramCandidateFile[]): FamilyGroup[] {
  const map = new Map<PoliticalFamilyId, ProgramCandidateFile[]>();
  for (const c of candidates) {
    const id = getCandidateFamilyId(c.candidate.slug);
    const list = map.get(id) ?? [];
    list.push(c);
    map.set(id, list);
  }
  return [...map.entries()]
    .map(([id, files]) => ({
      family: getFamilyMeta(id),
      candidates: [...files].sort((a, b) =>
        a.candidate.name.localeCompare(b.candidate.name, 'fr'),
      ),
    }))
    .sort((a, b) => a.family.order - b.family.order);
}

/**
 * Sélection par défaut multi-familles : un candidat par famille présente
 * (max 4, ordre pédagogique) pour un comparateur équilibré.
 */
export function defaultCrossFamilySlugs(
  candidates: ProgramCandidateFile[],
  max = 4,
): string[] {
  const groups = groupCandidatesByFamily(candidates);
  const slugs: string[] = [];
  for (const g of groups) {
    if (slugs.length >= max) break;
    if (g.family.id === 'autre' && groups.length > 1) continue;
    // Préférer le fichier le plus riche (mesures + chiffrages)
    const ranked = [...g.candidates].sort((a, b) => {
      const sa = a.measures.length + a.chiffrages.length * 2;
      const sb = b.measures.length + b.chiffrages.length * 2;
      return sb - sa;
    });
    slugs.push(ranked[0].candidate.slug);
  }
  if (slugs.length < 2) {
    return candidates.slice(0, Math.min(max, candidates.length)).map((c) => c.candidate.slug);
  }
  return slugs;
}
