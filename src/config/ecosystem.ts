/** Liens écosystème iArbre — hors contenu éditorial LMDPT. */
export const ECOSYSTEM_LINKS = [
  {
    id: 'pinocmod',
    label: 'PinocMod IA',
    description: 'Assistant recherche civique (beta, sandbox)',
    url: 'https://pinocmod.iarbre.org?utm_source=lmdpt&utm_medium=referral&utm_campaign=footer',
  },
] as const;

export function getPublicEcosystemLinks() {
  return ECOSYSTEM_LINKS.filter((link) => link.url.length > 0);
}
