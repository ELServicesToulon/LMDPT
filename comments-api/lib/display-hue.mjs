/**
 * Teinte politique d’affichage — calculée sur le texte seul, sans état.
 * Jamais rattachée au compte, au pseudonyme ni à l’empreinte d’auteur.
 */
import {
  classifyPoliticalHueHeuristic,
  hueBySlug,
} from '../../src/lib/comment-politics.ts';

/**
 * @param {string} text
 * @returns {{ slug: string, label: string, color: string }}
 */
export function displayHueForText(text) {
  const classified = classifyPoliticalHueHeuristic(String(text || ''));
  const hue = hueBySlug(classified.slug);
  return {
    slug: hue.slug,
    label: hue.label,
    color: hue.color,
  };
}
