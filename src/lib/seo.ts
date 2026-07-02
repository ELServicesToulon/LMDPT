/** Métadonnées Open Graph / Twitter pour partages sociaux. */

const DEFAULT_DESCRIPTION =
  'Média civique — pluralité du premier tour, données open data officielles, Democracy Over Elimination.';

const DEFAULT_OG_IMAGE = '/brand/og-default.png';

export function pageMeta(input: {
  title: string;
  description?: string;
  ogImage?: string;
  siteUrl: string;
  pathname: string;
}) {
  const description = input.description?.trim() || DEFAULT_DESCRIPTION;
  const ogImagePath = input.ogImage || DEFAULT_OG_IMAGE;
  const site = new URL(input.siteUrl);
  const canonical = new URL(input.pathname, site);
  const ogImage = new URL(ogImagePath, site);
  const fullTitle = `${input.title} — Le Média du Premier Tour`;

  return {
    description,
    canonical: canonical.href,
    ogImage: ogImage.href,
    fullTitle,
  };
}

export { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE };
