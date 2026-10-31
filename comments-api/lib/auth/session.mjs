import { loadJson, saveJsonAtomic, updateJsonLocked, sessionsPath } from './store.mjs';
import { randomId, signSessionCookie, verifySessionCookie } from './crypto.mjs';

const EMPTY = { version: 1, sessions: [] };
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function loadSessions(dataDir) {
  return loadJson(sessionsPath(dataDir), EMPTY);
}

export function saveSessions(dataDir, db) {
  saveJsonAtomic(sessionsPath(dataDir), db);
}

export function createSession(dataDir, userId, { ttlMs = DEFAULT_TTL_MS } = {}) {
  return updateJsonLocked(sessionsPath(dataDir), EMPTY, (db) => {
    const now = Date.now();
    const session = {
      id: randomId('ses'),
      userId,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + ttlMs).toISOString(),
      lastSeenAt: new Date(now).toISOString(),
    };
    db.sessions.push(session);
    db.sessions = db.sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
    return session;
  });
}

export function getSession(dataDir, sessionId) {
  if (!sessionId) return null;
  const db = loadSessions(dataDir);
  const s = db.sessions.find((x) => x.id === sessionId);
  if (!s) return null;
  if (new Date(s.expiresAt).getTime() <= Date.now()) {
    return updateJsonLocked(sessionsPath(dataDir), EMPTY, (fresh) => {
      fresh.sessions = fresh.sessions.filter((x) => x.id !== sessionId);
      return null;
    });
  }
  return s;
}

export function touchSession(dataDir, sessionId, { ttlMs = DEFAULT_TTL_MS } = {}) {
  return updateJsonLocked(sessionsPath(dataDir), EMPTY, (db) => {
    const s = db.sessions.find((x) => x.id === sessionId);
    if (!s) return null;
    const now = Date.now();
    if (new Date(s.expiresAt).getTime() <= now) {
      db.sessions = db.sessions.filter((x) => x.id !== sessionId);
      return null;
    }
    s.lastSeenAt = new Date(now).toISOString();
    s.expiresAt = new Date(now + ttlMs).toISOString();
    return s;
  });
}

export function revokeSession(dataDir, sessionId) {
  updateJsonLocked(sessionsPath(dataDir), EMPTY, (db) => {
    db.sessions = db.sessions.filter((x) => x.id !== sessionId);
    return null;
  });
}

export function cookieName() {
  return process.env.LMDPT_SESSION_COOKIE || 'lmdpt_session';
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of String(header).split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function sessionSecret() {
  return (
    process.env.LMDPT_SESSION_SECRET ||
    process.env.LMDPT_AUTH_SESSION_SECRET ||
    ''
  );
}

export function buildSetCookie(sessionId, { maxAgeSec = 30 * 24 * 3600, secure } = {}) {
  const secret = sessionSecret();
  if (!secret) throw new Error('LMDPT_SESSION_SECRET manquant');
  const value = signSessionCookie(sessionId, secret);
  const isSecure =
    secure ??
    (process.env.LMDPT_COOKIE_SECURE === '1' ||
      process.env.NODE_ENV === 'production' ||
      (process.env.LMDPT_PUBLIC_URL || '').startsWith('https://'));
  const parts = [
    `${cookieName()}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ];
  if (isSecure) parts.push('Secure');
  return parts.join('; ');
}

export function buildClearCookie() {
  const isSecure =
    process.env.LMDPT_COOKIE_SECURE === '1' ||
    process.env.NODE_ENV === 'production' ||
    (process.env.LMDPT_PUBLIC_URL || '').startsWith('https://');
  const parts = [
    `${cookieName()}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isSecure) parts.push('Secure');
  return parts.join('; ');
}

export function sessionIdFromRequest(req) {
  const secret = sessionSecret();
  if (!secret) return null;
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[cookieName()];
  return verifySessionCookie(raw, secret);
}
