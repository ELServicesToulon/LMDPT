import { loadJson, saveJsonAtomic, oauthStatePath } from './store.mjs';
import { randomToken } from './crypto.mjs';

const EMPTY = { version: 1, states: [] };
const TTL_MS = 15 * 60 * 1000;

export function createOAuthState(dataDir, { provider, next = '/', codeVerifier = null } = {}) {
  const db = loadJson(oauthStatePath(dataDir), EMPTY);
  const now = Date.now();
  db.states = (db.states || []).filter((s) => s.expiresAt > now);
  const state = {
    state: randomToken(24),
    provider,
    next: sanitizeNext(next),
    codeVerifier,
    expiresAt: now + TTL_MS,
  };
  db.states.push(state);
  saveJsonAtomic(oauthStatePath(dataDir), db);
  return state;
}

export function consumeOAuthState(dataDir, stateValue) {
  if (!stateValue) return null;
  const db = loadJson(oauthStatePath(dataDir), EMPTY);
  const now = Date.now();
  const idx = (db.states || []).findIndex((s) => s.state === stateValue && s.expiresAt > now);
  if (idx < 0) return null;
  const [item] = db.states.splice(idx, 1);
  saveJsonAtomic(oauthStatePath(dataDir), db);
  return item;
}

export function sanitizeNext(next) {
  const n = String(next || '/').trim() || '/';
  if (!n.startsWith('/') || n.startsWith('//') || n.includes('://')) return '/';
  return n.slice(0, 500);
}
