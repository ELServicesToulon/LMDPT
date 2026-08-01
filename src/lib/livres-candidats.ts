/**
 * Bibliographie candidats 2027 — typage + garde-fous DOE.
 * Source primaire = éditeur / ISBN ; miroirs libraires sans affiliation.
 */

export type LivreCandidatStatus = 'paru' | 'a_paraitre' | 'annonce' | 'epuise';

export interface LivreMirror {
  label: string;
  url: string;
}

export interface LivreCandidatEntry {
  id: string;
  candidate_slug: string;
  candidate_name: string;
  affiliation?: string | null;
  title: string;
  authors: string[];
  publisher: string;
  isbn13: string;
  asin_kindle?: string | null;
  published_on: string;
  pages?: number | null;
  price_eur?: number | null;
  format_notes?: string | null;
  status: LivreCandidatStatus;
  primary_url: string;
  mirrors?: LivreMirror[];
  blurb_public?: string | null;
  note?: string | null;
}

export interface LivresCandidatsFile {
  schema: string;
  title: string;
  updated: string;
  disclaimer: string;
  legal_note?: string;
  sources: Array<{ label: string; url: string; as_of?: string }>;
  entries: LivreCandidatEntry[];
}

const ISBN13_RE = /^978\d{10}$/;
const ASIN_RE = /^B0[A-Z0-9]{8}$/i;

export function isValidIsbn13(isbn: string): boolean {
  return ISBN13_RE.test(isbn);
}

export function isValidAsin(asin: string | null | undefined): boolean {
  if (!asin) return true;
  return ASIN_RE.test(asin);
}

/** Échec soft : liste de problèmes (tests / ops). */
export function validateLivresCandidats(data: LivresCandidatsFile): string[] {
  const problems: string[] = [];
  if (data.schema !== 'lmdpt-livres-candidats-v1') {
    problems.push(`schema inattendu: ${data.schema}`);
  }
  if (!Array.isArray(data.entries) || data.entries.length === 0) {
    problems.push('entries vide');
  }
  const ids = new Set<string>();
  for (const e of data.entries ?? []) {
    if (!e.id) problems.push('entrée sans id');
    else if (ids.has(e.id)) problems.push(`id dupliqué: ${e.id}`);
    else ids.add(e.id);
    if (!e.candidate_slug) problems.push(`${e.id}: candidate_slug manquant`);
    if (!e.title) problems.push(`${e.id}: title manquant`);
    if (!e.primary_url?.startsWith('http')) problems.push(`${e.id}: primary_url invalide`);
    if (!isValidIsbn13(e.isbn13)) problems.push(`${e.id}: isbn13 invalide ${e.isbn13}`);
    if (!isValidAsin(e.asin_kindle)) problems.push(`${e.id}: asin invalide ${e.asin_kindle}`);
    // Pas de tag Associates dans les URLs miroir
    for (const m of e.mirrors ?? []) {
      if (/[?&]tag=/i.test(m.url) || /[?&]linkCode=/i.test(m.url)) {
        problems.push(`${e.id}: miroir affilié interdit (${m.label})`);
      }
    }
  }
  return problems;
}

export function sortLivresByDateDesc(entries: LivreCandidatEntry[]): LivreCandidatEntry[] {
  return [...entries].sort((a, b) => b.published_on.localeCompare(a.published_on));
}

export const STATUS_LABELS: Record<LivreCandidatStatus, string> = {
  paru: 'Paru',
  a_paraitre: 'À paraître',
  annonce: 'Annoncé',
  epuise: 'Épuisé',
};
