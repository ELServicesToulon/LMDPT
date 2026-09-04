/**
 * Liens de partage lecteur — X / Facebook / LinkedIn / copie / Web Share.
 * Texte prérempli : titre + URL, neutre, sans hashtags ni slogans.
 */

export const X_VIA_HANDLE = 'LMDuPremierTour';
export const X_INTENT_BASE = 'https://x.com/intent/tweet';
export const FACEBOOK_SHARE_BASE = 'https://www.facebook.com/sharer/sharer.php';
export const LINKEDIN_SHARE_BASE = 'https://www.linkedin.com/sharing/share-offsite/';

/** Marge sous 280 : URL t.co (~23) + « via @handle ». */
export const X_TEXT_MAX = 200;

const FORBIDDEN_SHARE = /#|favori|votez pour|barrons/i;

export type ShareNetwork = 'x' | 'facebook' | 'linkedin';

export interface ShareInput {
  title: string;
  url: string;
  /** Handle sans @. Chaîne vide = pas de via. Défaut : LMDuPremierTour. */
  via?: string;
}

export interface ShareLinks {
  text: string;
  url: string;
  x: string;
  facebook: string;
  linkedin: string;
}

export function shareNetworkLabel(network: ShareNetwork): string {
  switch (network) {
    case 'x':
      return 'X';
    case 'facebook':
      return 'Facebook';
    case 'linkedin':
      return 'LinkedIn';
    default: {
      const _exhaustive: never = network;
      return _exhaustive;
    }
  }
}

export function shareNetworkAriaLabel(network: ShareNetwork): string {
  switch (network) {
    case 'x':
      return 'Partager sur X';
    case 'facebook':
      return 'Partager sur Facebook';
    case 'linkedin':
      return 'Partager sur LinkedIn';
    default: {
      const _exhaustive: never = network;
      return _exhaustive;
    }
  }
}

/** Titre seul, espaces normalisés — pas de hashtag ajouté. */
export function buildShareText(title: string): string {
  return title.replace(/\s+/g, ' ').trim();
}

export function truncateShareTitle(title: string, max = X_TEXT_MAX): string {
  const text = buildShareText(title);
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function shareTextRespectsCharte(text: string): boolean {
  return text.length > 0 && !FORBIDDEN_SHARE.test(text);
}

export function buildXIntentUrl(input: ShareInput): string {
  const params = new URLSearchParams();
  params.set('text', truncateShareTitle(input.title));
  params.set('url', input.url);
  const via = input.via === '' ? '' : (input.via ?? X_VIA_HANDLE);
  if (via) params.set('via', via.replace(/^@/, ''));
  return `${X_INTENT_BASE}?${params.toString()}`;
}

export function buildFacebookShareUrl(url: string): string {
  const params = new URLSearchParams();
  params.set('u', url);
  return `${FACEBOOK_SHARE_BASE}?${params.toString()}`;
}

export function buildLinkedInShareUrl(url: string): string {
  const params = new URLSearchParams();
  params.set('url', url);
  return `${LINKEDIN_SHARE_BASE}?${params.toString()}`;
}

export function buildShareLinks(input: ShareInput): ShareLinks {
  const text = buildShareText(input.title);
  return {
    text,
    url: input.url,
    x: buildXIntentUrl(input),
    facebook: buildFacebookShareUrl(input.url),
    linkedin: buildLinkedInShareUrl(input.url),
  };
}

/** Hubs listes : pas de barre auto (les cartes mènent déjà vers l’article). */
export function isEditorialHubPath(pathname: string): boolean {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return clean === '/analyses' || clean === '/debats';
}

export function shouldShowArticleShareBar(
  pathname: string,
  hasEditorialPost: boolean,
): boolean {
  if (isEditorialHubPath(pathname)) return false;
  if (hasEditorialPost) return true;
  const clean = pathname.replace(/\/+$/, '') || '/';
  return clean.startsWith('/analyses/') || clean.startsWith('/debats/');
}
