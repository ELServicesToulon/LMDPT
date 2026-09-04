/** Lien interne uniquement — helper pour une bande texte éventuelle. */

export type ScoopCurated = {
  schema?: string;
  active: boolean;
  badge?: string;
  title: string;
  url: string;
  updated_at?: string;
  curated_by?: string;
  note?: string;
  day_key?: string;
  motif?: string;
};

/** Visible seulement si active + titre + URL interne LMDPT. */
export function scoopIsLive(scoop: ScoopCurated | null | undefined): boolean {
  if (!scoop?.active) return false;
  const title = String(scoop.title ?? '').trim();
  const url = String(scoop.url ?? '').trim();
  if (!title || !url.startsWith('/')) return false;
  if (/^https?:\/\//i.test(url)) return false;
  return true;
}
