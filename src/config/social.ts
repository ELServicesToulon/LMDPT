/** Liens réseaux sociaux LMDPT — affichés si `url` non vide. */
import { getYoutubeChannelUrl, getYoutubeLiveUrl } from './youtube';

export const SOCIAL_LINKS = [
  {
    id: 'x',
    label: 'X (Twitter)',
    handle: '@LMDuPremierTour',
    url: 'https://x.com/LMDuPremierTour',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    handle: '@LMDuPremierTour',
    url: getYoutubeChannelUrl(),
  },
] as const;

export function getPublicSocialLinks() {
  return SOCIAL_LINKS.filter((link) => link.url.length > 0);
}

export function getYoutubeSocialLink() {
  return SOCIAL_LINKS.find((link) => link.id === 'youtube');
}

export { getYoutubeLiveUrl };
