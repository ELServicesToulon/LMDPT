/**
 * Résout @ks5b/auth-idp depuis le canon ops OU le submodule ks5b.
 * Canon : /home/debian/iarbre/le-media-du-premier-tour → 5×.. = /home/debian + ks5b/packages
 * Submodule : /home/debian/ks5b/iarbre/… → 5×.. = /home/debian/ks5b + packages
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CANDIDATES = [
  join(HERE, '../../../../../ks5b/packages/auth-idp/src/index.mjs'),
  join(HERE, '../../../../../packages/auth-idp/src/index.mjs'),
  '/home/debian/ks5b/packages/auth-idp/src/index.mjs',
];

const hit = CANDIDATES.find((p) => existsSync(p));
if (!hit) {
  throw new Error(`@ks5b/auth-idp introuvable. Candidats: ${CANDIDATES.join(' | ')}`);
}

export const idpPath = hit;
export const idp = await import(pathToFileURL(hit).href);
