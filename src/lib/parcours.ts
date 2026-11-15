/** État ouvert/fermé du parcours citoyen. `null` = pas de choix enregistré. */

export const PARCOURS_STORAGE_KEY = 'lmdpt-parcours-expanded';

/** En dessous de cette largeur, les étapes s’empilent (mise en page mobile). */
export const PARCOURS_COLLAPSE_BELOW_PX = 768;

/**
 * Ouvert seulement si le lecteur a enregistré ce choix.
 * Sans préférence, le bandeau est replié — y compris sur ordinateur.
 * `isWide` est conservé pour l’appel existant, mais ne change plus le défaut.
 */
export function resolveParcoursOpen(stored: string | null, _isWide?: boolean): boolean {
  if (stored === '1') return true;
  if (stored === '0') return false;
  return false;
}
