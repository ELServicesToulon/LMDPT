/**
 * Visibilité du module « Commentaires citoyens ».
 * Règle : uniquement sur un article (dossier d’analyse) ou un fil de débat.
 * Masqué sur les accueil de rubrique, les listes et les index.
 * La prop `comments` du layout permet un forçage explicite.
 */

export function normalizeCitizenCommentPath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

/** Fil de débat : /debats/:slug — pas l’index /debats/. */
export function isDebateThreadPath(pathname: string): boolean {
  return /^\/debats\/[^/]+$/.test(normalizeCitizenCommentPath(pathname));
}

/** Accueil, index et listes sous /analyses/ — pas un article unique. */
export function isAnalysisListingPath(pathname: string): boolean {
  const clean = normalizeCitizenCommentPath(pathname);
  if (clean === '/analyses') return true;
  if (clean === '/analyses/programmes' || clean === '/analyses/programmes/axes') return true;
  // Index d’un scrutin : /analyses/programmes/:scrutin (la fiche est /…/:scrutin/:slug)
  if (/^\/analyses\/programmes\/[^/]+$/.test(clean)) return true;
  return false;
}

export function isAnalysisArticlePath(pathname: string): boolean {
  const clean = normalizeCitizenCommentPath(pathname);
  return clean.startsWith('/analyses/') && !isAnalysisListingPath(clean);
}

export function shouldShowCitizenComments(input: {
  pathname: string;
  comments?: boolean;
}): boolean {
  if (input.comments === true) return true;
  if (input.comments === false) return false;
  return isDebateThreadPath(input.pathname) || isAnalysisArticlePath(input.pathname);
}
