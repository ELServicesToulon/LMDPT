/** Jeux data.gouv.fr utiles au premier tour — requêtes catalogue + IDs stables si connus. */
export const ELECTION_CATALOG_QUERIES = [
  'élection présidentielle',
  'candidats élection',
  'résultats élection',
  'élections législatives',
  'répertoire électoral',
] as const;

export type ElectionCatalogQuery = (typeof ELECTION_CATALOG_QUERIES)[number];

export function catalogCacheKey(query: string): string {
  return `catalog-${query
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;
}
