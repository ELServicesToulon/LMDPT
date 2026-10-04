/**
 * Jetons de modération — jamais de valeur par défaut connue.
 * Source : variables d'environnement, sinon comptes du fichier data/moderators.json.
 * Les jetons historiques publiés dans le dépôt sont refusés, même s'ils traînent dans un fichier.
 */

/** Anciens jetons seed publiés dans le dépôt. Refusés, jamais réémis. */
export const REJECTED_DEFAULT_TOKENS = new Set([
  'lmdpt-redaction-change-me',
  'lmdpt-modo-senior-change-me',
  'lmdpt-modo-change-me',
]);

export const MOD_TOKEN_ENV = [
  { env: 'LMDPT_MOD_TOKEN_REDACTION', id: 'redaction-1', display: 'Rédaction LMDPT', role: 'redaction' },
  { env: 'LMDPT_MOD_TOKEN_MODO_SENIOR', id: 'modo-senior-1', display: 'Modo senior', role: 'modo-senior' },
  { env: 'LMDPT_MOD_TOKEN_MODO', id: 'modo-1', display: 'Modérateur', role: 'modo' },
];

const PLACEHOLDER_MARK = /change[-_]?me|remplacer|placeholder|exemple|example/i;

export function isUsableModToken(token) {
  const value = String(token || '').trim();
  if (!value) return false;
  if (REJECTED_DEFAULT_TOKENS.has(value)) return false;
  if (PLACEHOLDER_MARK.test(value)) return false;
  return true;
}

export function accountsFromEnv(env = process.env) {
  const accounts = [];
  for (const spec of MOD_TOKEN_ENV) {
    const token = String(env?.[spec.env] || '').trim();
    if (!isUsableModToken(token)) continue;
    accounts.push({
      id: spec.id,
      display: spec.display,
      role: spec.role,
      token,
    });
  }
  return accounts;
}

export function accountsFromFile(fileAccounts) {
  if (!Array.isArray(fileAccounts)) return [];
  return fileAccounts
    .filter((account) => account && isUsableModToken(account.token))
    .map((account) => ({
      id: account.id,
      display: account.display,
      role: account.role,
      token: String(account.token).trim(),
    }));
}

/**
 * Les variables d'environnement priment dès qu'au moins un jeton utilisable y est défini.
 * Sinon, les comptes du fichier (hors jetons refusés).
 */
export function resolveModeratorAccounts({ env = process.env, fileAccounts = null } = {}) {
  const fromEnv = accountsFromEnv(env);
  if (fromEnv.length > 0) return fromEnv;
  return accountsFromFile(fileAccounts);
}

export function moderationConfigured(accounts) {
  return Array.isArray(accounts) && accounts.some((account) => isUsableModToken(account?.token));
}

export function findModeratorAccount(accounts, token) {
  if (!moderationConfigured(accounts)) return null;
  const value = String(token || '').trim();
  if (!isUsableModToken(value)) return null;
  return accounts.find((account) => account.token === value) || null;
}

export function moderationStartupWarning() {
  return (
    '[lmdpt-comments] AVERTISSEMENT: aucun jeton de modération configuré ' +
    '(fichier data/moderators.json ou variables LMDPT_MOD_TOKEN_REDACTION, ' +
    'LMDPT_MOD_TOKEN_MODO_SENIOR, LMDPT_MOD_TOKEN_MODO). ' +
    'Les actions de modération et d’édition sont refusées. ' +
    'Ne pas déployer en production sans jetons propres. ' +
    'Les anciens jetons par défaut sont refusés.'
  );
}
