/**
 * Drapeau éditorial pour masquer la simulation 2027 (voix T1 et hémicycle dérivé)
 * sans supprimer les données. Le repasser à true réaffiche le bloc.
 */
export const SHOW_2027_SIMULATION = false;

export const ATLAS_2027_SLUG = '2027-presidentielle';

export const ATLAS_2027_PLACEHOLDER =
  "Présidentielle 2027 : l'hémicycle du 1er tour s'affichera avec les résultats officiels. LMDPT ne publie pas de projection.";

export const ATLAS_2027_VISIBLE_DATE = 'avril 2027';

export function shouldShow2027Simulation(): boolean {
  return SHOW_2027_SIMULATION;
}

export function isAtlas2027Slug(slug: string | undefined | null): boolean {
  return slug === ATLAS_2027_SLUG;
}

/** false uniquement pour 2027-presidentielle tant que le drapeau est éteint. */
export function shouldRender2027Simulation(slug: string | undefined | null): boolean {
  if (!isAtlas2027Slug(slug)) return true;
  return SHOW_2027_SIMULATION;
}

/** Date visible atlas : « avril 2027 » tant que la simulation est masquée. L’ISO catalogue reste intact. */
export function atlasVisibleDateLabel(slug: string | undefined | null, isoDate: string): string {
  if (isAtlas2027Slug(slug) && !SHOW_2027_SIMULATION) {
    return ATLAS_2027_VISIBLE_DATE;
  }
  return new Date(isoDate).toLocaleDateString('fr-FR', { dateStyle: 'long' });
}

/** Remplace « 18 avril 2027 » (toLocaleDateString long) par « avril 2027 » sur les pages atlas. */
export function replaceAtlas2027LongDate(text: string): string {
  if (SHOW_2027_SIMULATION) return text;
  return text.replace(/\d{1,2}\s+avril\s+2027/gi, ATLAS_2027_VISIBLE_DATE);
}
