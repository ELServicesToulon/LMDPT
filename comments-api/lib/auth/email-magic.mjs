import { loadJson, saveJsonAtomic, magicPath } from './store.mjs';
import { randomToken, sha256 } from './crypto.mjs';
import { publicUrl } from './config.mjs';

const EMPTY = { version: 1, tokens: [] };
const TTL_MS = 15 * 60 * 1000;

/** Rate limit in-memory (process lifetime) */
const hits = new Map(); // key → { count, resetAt }

export function rateLimit(key, { max = 5, windowMs = 3600_000 } = {}) {
  const now = Date.now();
  let row = hits.get(key);
  if (!row || row.resetAt <= now) {
    row = { count: 0, resetAt: now + windowMs };
    hits.set(key, row);
  }
  row.count += 1;
  return row.count <= max;
}

export function createMagicToken(dataDir, email) {
  const emailNorm = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    const err = new Error('Email invalide.');
    err.status = 400;
    throw err;
  }
  const raw = randomToken(32);
  const db = loadJson(magicPath(dataDir), EMPTY);
  const now = Date.now();
  db.tokens = (db.tokens || []).filter((t) => t.expiresAt > now);
  db.tokens.push({
    hash: sha256(raw),
    email: emailNorm,
    expiresAt: now + TTL_MS,
    createdAt: now,
  });
  saveJsonAtomic(magicPath(dataDir), db);
  const verifyUrl = `${publicUrl()}/api/auth/email/verify?token=${encodeURIComponent(raw)}`;
  return { email: emailNorm, token: raw, verifyUrl, expiresInSec: TTL_MS / 1000 };
}

export function consumeMagicToken(dataDir, rawToken) {
  if (!rawToken) return null;
  const hash = sha256(rawToken);
  const db = loadJson(magicPath(dataDir), EMPTY);
  const now = Date.now();
  const idx = (db.tokens || []).findIndex((t) => t.hash === hash && t.expiresAt > now);
  if (idx < 0) return null;
  const [item] = db.tokens.splice(idx, 1);
  saveJsonAtomic(magicPath(dataDir), db);
  return item;
}

/**
 * Envoi email : SMTP si configuré, sinon log dev (file-sink console).
 */
export async function sendMagicEmail({ to, verifyUrl }) {
  const host = process.env.LMDPT_SMTP_HOST;
  if (!host) {
    console.info('[lmdpt-auth] MAGIC LINK (dev sink)', { to, verifyUrl });
    return { mode: 'dev_sink', to, verifyUrl };
  }
  // SMTP minimal via fetch-compatible nodemailer-less: raw socket avoided —
  // use undici SMTP is heavy; for MVP use HTTP email relay if LMDPT_SMTP_URL is webhook
  if (process.env.LMDPT_SMTP_URL?.startsWith('http')) {
    const res = await fetch(process.env.LMDPT_SMTP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject: 'Connexion LMDPT — lien magique',
        text: `Bonjour,\n\nConnectez-vous au Média du Premier Tour :\n${verifyUrl}\n\nLien valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.\n\n— LMDPT`,
      }),
    });
    if (!res.ok) throw new Error(`SMTP webhook HTTP ${res.status}`);
    return { mode: 'webhook', to };
  }

  // Fallback: log if SMTP host set but no relay implemented yet
  console.warn(
    '[lmdpt-auth] SMTP host set but only HTTP LMDPT_SMTP_URL implemented — logging link',
    { to, verifyUrl },
  );
  return { mode: 'dev_sink', to, verifyUrl };
}
