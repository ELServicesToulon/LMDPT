import journal from '../data/data-journal.json';

export interface DataJournalEntry {
  date: string;
  label: string;
  source: string;
  license: string;
  script?: string | null;
  licenseNote?: string;
  /** Page(s) du site alimentée(s) par ce jeu */
  pages?: string[];
  /** Fiche data.gouv.fr ou URL officielle */
  datasetUrl?: string;
}

const ENTRIES = journal as DataJournalEntry[];

/** Journal trié du plus récent au plus ancien (affichage /sources#mises-a-jour). */
export function getSortedJournal(): DataJournalEntry[] {
  return [...ENTRIES].sort((a, b) => b.date.localeCompare(a.date) || b.label.localeCompare(a.label));
}

export function getJournalLastUpdate(): string | undefined {
  return getSortedJournal()[0]?.date;
}

/** Chaque atlas publié doit avoir au moins une entrée journal pointant vers sa page. */
export const ATLAS_PAGES = [
  '/atlas/2027-presidentielle',
  '/atlas/2024-legislatives',
  '/atlas/2022-presidentielle',
  '/atlas/2017-presidentielle',
] as const;

export function journalCoversAtlasPage(path: string): boolean {
  return ENTRIES.some((entry) => entry.pages?.includes(path));
}