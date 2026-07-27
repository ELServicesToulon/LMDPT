/**
 * Indépendance des médias LMDPT — types, labels, résolution badges funding.
 * Distinct de l’observatoire de la censure (aides / capital ≠ sanctions).
 */
import { getFamilyMeta, type PoliticalFamilyId } from './program-families';
import raw from '../data/independance-medias.json';

export type MediaType = 'television' | 'radio' | 'presse' | 'agence' | 'autre';

export type FundingKind =
  | 'subvention_etat'
  | 'audiovisuel_public'
  | 'capital_prive'
  | 'autre';

export type VerificationStatus = 'documented' | 'partial';

export interface SourceLink {
  label: string;
  url: string;
}

export interface PoliticalHueRef {
  family: PoliticalFamilyId | string;
  label: string;
  color?: string;
}

export interface FundingStream {
  id: string;
  kind: FundingKind;
  label: string;
  share_note?: string;
  amount_note?: string;
  political_hue: PoliticalHueRef;
  sources: SourceLink[];
}

export interface IndependanceMediaEntry {
  id: string;
  name: string;
  type: MediaType;
  independence_summary: string;
  verification: VerificationStatus;
  funding: FundingStream[];
}

export interface IndependanceMediasDataset {
  schema: string;
  title: string;
  updated: string;
  period: { from: string; label: string };
  disclaimer: string;
  methodology_note: string;
  media: IndependanceMediaEntry[];
}

/**
 * Couleurs pédagogiques par famille — alignées sur FIRST_ROUND_HUES
 * (`comment-politics.ts`) pour cohérence site / observatoire / indépendance.
 * centre = Attal/Renaissance · droite-nationale = Le Pen/RN · autre = pluraliste.
 */
export const FAMILY_COLORS: Record<string, string> = {
  'gauche-radicale': '#cc2443', // melenchon
  'social-democrate': '#ff8080', // parti-socialiste
  centre: '#ffeb00', // attal
  droite: '#0066cc', // retailleau
  'droite-nationale': '#0d378a', // le-pen / RN
  autre: '#5a6570', // pluraliste
};

export const FUNDING_KIND_LABELS: Record<FundingKind, string> = {
  subvention_etat: 'Subvention / aides État',
  audiovisuel_public: 'Audiovisuel public',
  capital_prive: 'Capital privé',
  autre: 'Autre (abonnements, dons, pub…)',
};

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  television: 'Télévision',
  radio: 'Radio',
  presse: 'Presse',
  agence: 'Agence / numérique',
  autre: 'Autre',
};

export const VALID_FUNDING_KINDS = new Set<FundingKind>([
  'subvention_etat',
  'audiovisuel_public',
  'capital_prive',
  'autre',
]);

export const VALID_FAMILIES = new Set<string>([
  'gauche-radicale',
  'social-democrate',
  'centre',
  'droite',
  'droite-nationale',
  'autre',
]);

export function resolveHueColor(hue: PoliticalHueRef): string {
  if (hue.color && /^#[0-9a-fA-F]{3,8}$/.test(hue.color)) return hue.color;
  return FAMILY_COLORS[hue.family] ?? FAMILY_COLORS.autre;
}

export function resolveHueLabel(hue: PoliticalHueRef): string {
  if (hue.label?.trim()) return hue.label;
  return getFamilyMeta(hue.family).shortLabel;
}

export function loadIndependanceDataset(): IndependanceMediasDataset {
  return raw as IndependanceMediasDataset;
}

/** Dataset enrichi : couleurs / labels hue résolus sur chaque flux. */
export function getIndependanceView() {
  const data = loadIndependanceDataset();
  const media = data.media.map((m) => ({
    ...m,
    funding: m.funding.map((f) => ({
      ...f,
      political_hue: {
        ...f.political_hue,
        color: resolveHueColor(f.political_hue),
        label: resolveHueLabel(f.political_hue),
      },
    })),
  }));
  return { ...data, media };
}

export function countFundingByKind(
  media: IndependanceMediaEntry[],
): Record<FundingKind, number> {
  const counts: Record<FundingKind, number> = {
    subvention_etat: 0,
    audiovisuel_public: 0,
    capital_prive: 0,
    autre: 0,
  };
  for (const m of media) {
    for (const f of m.funding) {
      if (VALID_FUNDING_KINDS.has(f.kind)) counts[f.kind] += 1;
    }
  }
  return counts;
}

export function sortMediaByName(
  media: IndependanceMediaEntry[],
): IndependanceMediaEntry[] {
  return [...media].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }),
  );
}
