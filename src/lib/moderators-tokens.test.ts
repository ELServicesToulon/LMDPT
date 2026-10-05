import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  REJECTED_DEFAULT_TOKENS,
  findModeratorAccount,
  isUsableModToken,
  moderationConfigured,
  moderationStartupWarning,
  resolveModeratorAccounts,
} from '../../comments-api/lib/moderators.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const REAL = 'a9f3c1e07b24d65891ac0e77f4b2d618';

describe('jetons de modération', () => {
  it('refuse les trois jetons historiques, même présents dans le fichier', () => {
    expect([...REJECTED_DEFAULT_TOKENS]).toEqual([
      'lmdpt-redaction-change-me',
      'lmdpt-modo-senior-change-me',
      'lmdpt-modo-change-me',
    ]);
    const fileAccounts = [...REJECTED_DEFAULT_TOKENS].map((token, i) => ({
      id: `legacy-${i}`,
      role: 'redaction',
      token,
    }));
    const accounts = resolveModeratorAccounts({ env: {}, fileAccounts });
    expect(moderationConfigured(accounts)).toBe(false);
    expect(findModeratorAccount(accounts, 'lmdpt-modo-change-me')).toBeNull();
  });

  it('refuse les placeholders documentés et un jeton vide', () => {
    expect(isUsableModToken('')).toBe(false);
    expect(isUsableModToken('__REMPLACER_JETON_REDACTION__')).toBe(false);
    expect(isUsableModToken('__REMPLACER_JETON_MODO_SENIOR__')).toBe(false);
    expect(isUsableModToken('__REMPLACER_JETON_MODO__')).toBe(false);
    const accounts = resolveModeratorAccounts({
      env: {
        LMDPT_MOD_TOKEN_REDACTION: '__REMPLACER_JETON_REDACTION__',
        LMDPT_MOD_TOKEN_MODO: '__REMPLACER_JETON_MODO__',
      },
      fileAccounts: [],
    });
    expect(accounts).toEqual([]);
  });

  it('accepte un jeton d’environnement et ignore le fichier dans ce cas', () => {
    const accounts = resolveModeratorAccounts({
      env: { LMDPT_MOD_TOKEN_MODO: REAL },
      fileAccounts: [{ id: 'file', role: 'redaction', token: 'fichier-seul-9f3c1e07b24d65891ac0e77' }],
    });
    expect(accounts.map((a) => a.role)).toEqual(['modo']);
    expect(findModeratorAccount(accounts, REAL)?.id).toBe('modo-1');
    expect(findModeratorAccount(accounts, 'fichier-seul-9f3c1e07b24d65891ac0e77')).toBeNull();
  });

  it('utilise le fichier quand aucune variable n’est utilisable', () => {
    const token = 'fichier-seul-9f3c1e07b24d65891ac0e77';
    const accounts = resolveModeratorAccounts({
      env: {},
      fileAccounts: [{ id: 'modo-fichier', display: 'Modo', role: 'modo', token }],
    });
    expect(findModeratorAccount(accounts, token)?.id).toBe('modo-fichier');
    expect(findModeratorAccount(accounts, 'lmdpt-redaction-change-me')).toBeNull();
  });

  it('n’a plus de jeton seed dans server.mjs', () => {
    const source = readFileSync(join(ROOT, 'comments-api/server.mjs'), 'utf8');
    for (const token of REJECTED_DEFAULT_TOKENS) {
      expect(source).not.toContain(token);
    }
  });

  it('formule un avertissement de démarrage sans jeton', () => {
    const message = moderationStartupWarning();
    expect(message).toMatch(/AVERTISSEMENT/);
    expect(message).toMatch(/refus/);
    expect(message).not.toMatch(/lmdpt-modo-change-me/);
  });
});
