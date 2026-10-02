/** État ouvert/fermé du parcours citoyen. `null` = pas de choix enregistré. */

export const PARCOURS_STORAGE_KEY = 'lmdpt-parcours-expanded';

/** Sous cette largeur, le parcours est replié tant que le lecteur n’a rien choisi. */
export const PARCOURS_COLLAPSE_BELOW_PX = 768;

export function resolveParcoursOpen(stored: string | null, isWide: boolean): boolean {
  if (stored === '1') return true;
  if (stored === '0') return false;
  return isWide;
}
