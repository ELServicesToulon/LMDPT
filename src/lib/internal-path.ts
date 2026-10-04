const FILE_SEGMENT = /\.[a-z0-9]{1,8}$/i;

/**
 * Lien interne de page : barre oblique finale, pour éviter le 301 vers la forme répertoire.
 * Laisse intacts l’accueil, les fichiers, /api/ et les URL externes.
 */
export function withTrailingSlash(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/api/')) return href;
  const hashAt = href.indexOf('#');
  const queryAt = href.indexOf('?');
  let cut = href.length;
  if (hashAt >= 0) cut = Math.min(cut, hashAt);
  if (queryAt >= 0) cut = Math.min(cut, queryAt);
  const path = href.slice(0, cut);
  const rest = href.slice(cut);
  if (path === '/' || path.endsWith('/')) return href;
  const last = path.slice(path.lastIndexOf('/') + 1);
  if (FILE_SEGMENT.test(last)) return href;
  return `${path}/${rest}`;
}
