/**
 * Courants génériques pour l’AFFICHAGE DES COMMENTAIRES uniquement.
 * Publications, axes et X gardent les labels FIRST_ROUND_HUES (noms / partis).
 */
export const COMMENT_DISPLAY_FALLBACK = 'Pluraliste / transversal';

/** slug FIRST_ROUND_HUES → courant générique, sans nom de personne ni de parti. */
export const COMMENT_DISPLAY_CURRENT: Record<string, string> = {
  melenchon: 'Gauche radicale',
  ruffin: 'Gauche radicale',
  roussel: 'Gauche communiste',
  'parti-socialiste': 'Gauche sociale-démocrate',
  glucksmann: 'Gauche sociale-démocrate',
  ecolo: 'Écologiste',
  barrot: 'Centre',
  attal: 'Centre libéral',
  philippe: 'Centre droit',
  retailleau: 'Droite conservatrice',
  lisnard: 'Droite libérale',
  'le-pen': 'Droite nationaliste',
  bardella: 'Droite nationaliste',
  zemmour: 'Droite identitaire',
  pluraliste: COMMENT_DISPLAY_FALLBACK,
};

/** Phrase de justification exposée en preview — aucun nom de personne. */
export const COMMENT_DISPLAY_RATIONALE =
  'Tendance estimée à partir du texte du message, sans rattachement à un compte.';

export function displayCurrentForSlug(slug: string | undefined | null): string {
  if (!slug) return COMMENT_DISPLAY_FALLBACK;
  return COMMENT_DISPLAY_CURRENT[slug] ?? COMMENT_DISPLAY_FALLBACK;
}
