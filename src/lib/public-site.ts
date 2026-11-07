/** URL publique canonique par défaut (sans slash final). */
export const DEFAULT_PUBLIC_SITE = 'https://lemediadupremiertour.fr';

export function publicSiteHref(siteFromConfig?: string | URL | null): string {
  if (siteFromConfig) {
    const href = typeof siteFromConfig === 'string' ? siteFromConfig : siteFromConfig.href;
    return href.replace(/\/$/, '');
  }
  const fromEnv = process.env.ASTRO_SITE?.replace(/\/$/, '');
  return fromEnv || DEFAULT_PUBLIC_SITE;
}

/** Canonique absolue des pages stub 301 vers l’index analyses. */
export function analysesRedirectStubCanonical(site?: string | URL | null): string {
  return `${publicSiteHref(site)}/analyses/`;
}

/** Chemins HTML générés par Astro pour les redirections d’analyses retirées. */
export const REDIRECT_STUB_HTML_PATHS = [
  'analyses/livres-candidats/index.html',
  'analyses/quatremer-marianne/index.html',
  'analyses/on-a-vole-la-revolution-puis-la-revolte/index.html',
] as const;
