/**
 * Teinte politique d’affichage — calculée sur le texte seul, sans état.
 * Jamais rattachée au compte, au pseudonyme ni à l’empreinte d’auteur.
 * Label = courant générique (pas de nom de personne / parti).
 */
import {
  classifyPoliticalHueHeuristic,
  hueBySlug,
} from '../../src/lib/comment-politics.ts';
import {
  COMMENT_DISPLAY_RATIONALE,
  displayCurrentForSlug,
} from '../../src/lib/comment-display-hue.ts';

export { COMMENT_DISPLAY_FALLBACK, COMMENT_DISPLAY_RATIONALE, displayCurrentForSlug } from '../../src/lib/comment-display-hue.ts';

/**
 * @param {string} text
 * @returns {{ slug: string, label: string, color: string }}
 */
export function displayHueForText(text) {
  const classified = classifyPoliticalHueHeuristic(String(text || ''));
  const hue = hueBySlug(classified.slug);
  return {
    slug: hue.slug,
    label: displayCurrentForSlug(hue.slug),
    color: hue.color,
  };
}

/** Justification d’affichage : phrase fixe, sans nom de personne. */
export function displayRationale() {
  return COMMENT_DISPLAY_RATIONALE;
}
