/**
 * Liens privés de l’espace rédaction (`/redaction/` et `/redaction/god/`).
 *
 * Lus au build Astro. Les dossiers Drive ne sont pas dans le dépôt : la page
 * est statique et servie sans authentification (noindex seulement).
 *
 * ManuskBot, sur KS-5, dans `Mediconvoi/backend/.env`, puis
 * `npm run deploy-lmdpt-ovh` :
 *   PUBLIC_LMDPT_REDACTION_DRIVE_URL=https://drive.google.com/drive/folders/…
 *   PUBLIC_LMDPT_PIGISTES_DRIVE_URL=https://drive.google.com/drive/folders/…
 *
 * Voir docs/REDACTION.md.
 */

export const REDACTION_DRIVE_ENV = 'PUBLIC_LMDPT_REDACTION_DRIVE_URL';
export const PIGISTES_DRIVE_ENV = 'PUBLIC_LMDPT_PIGISTES_DRIVE_URL';

const DRIVE_FOLDER = /^\/drive\/folders\/([a-zA-Z0-9_-]+)\/?$/;

function readEnv(name: string): string | null {
  const v = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.[name]
    ?? (typeof process !== 'undefined' ? process.env[name] : undefined);
  const t = typeof v === 'string' ? v.trim() : '';
  return t || null;
}

/**
 * URL canonique d’un dossier Drive, ou chaîne vide.
 * N’accepte que `https://drive.google.com/drive/folders/<id>`.
 */
export function resolveDriveFolderUrl(raw: string | null | undefined): string {
  const t = (raw ?? '').trim();
  if (!t) return '';
  let url: URL;
  try {
    url = new URL(t);
  } catch {
    return '';
  }
  if (url.protocol !== 'https:') return '';
  if (url.username || url.password) return '';
  if (url.hostname !== 'drive.google.com') return '';
  const match = url.pathname.match(DRIVE_FOLDER);
  if (!match) return '';
  return `https://drive.google.com/drive/folders/${match[1]}`;
}

/** Espace de travail rédaction. Vide si la variable de build est absente ou invalide. */
export function getRedactionDriveUrl(): string {
  return resolveDriveFolderUrl(readEnv(REDACTION_DRIVE_ENV));
}

/** Boîte pigistes. Vide si la variable de build est absente ou invalide. */
export function getPigistesDriveUrl(): string {
  return resolveDriveFolderUrl(readEnv(PIGISTES_DRIVE_ENV));
}
