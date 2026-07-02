/** Liens réseaux sociaux LMDPT — affichés si `url` non vide. */
export const SOCIAL_LINKS = [
  {
    id: 'x',
    label: 'X (Twitter)',
    handle: '@LMDuPremierTour',
    url: 'https://x.com/LMDuPremierTour',
  },
] as const;

export function getPublicSocialLinks() {
  return SOCIAL_LINKS.filter((link) => link.url.length > 0);
}
