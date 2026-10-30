/**
 * Stockage JSON atomique pour users / sessions / magic tokens.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { withDataLockSync } from '../data-lock.mjs';

export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

export function loadJson(path, fallback) {
  if (!existsSync(path)) return structuredClone(fallback);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return structuredClone(fallback);
  }
}

export function saveJsonAtomic(path, data) {
  ensureDir(dirname(path));
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
  renameSync(tmp, path);
}

/**
 * Lecture-modification-écriture sous le verrou partagé du répertoire parent.
 * @param {string} path
 * @param {object} fallback
 * @param {(db: object) => *} fn
 * @param {string} [owner]
 */
export function updateJsonLocked(path, fallback, fn, owner = 'api') {
  return withDataLockSync(dirname(path), owner, () => {
    const db = loadJson(path, fallback);
    const result = fn(db);
    saveJsonAtomic(path, db);
    return result;
  });
}

export function usersPath(dataDir) {
  return join(dataDir, 'users.json');
}

export function sessionsPath(dataDir) {
  return join(dataDir, 'sessions.json');
}

export function magicPath(dataDir) {
  return join(dataDir, 'magic-tokens.json');
}

export function oauthStatePath(dataDir) {
  return join(dataDir, 'oauth-states.json');
}
