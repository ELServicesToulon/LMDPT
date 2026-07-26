import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export function randomId(prefix = '') {
  const id = randomBytes(16).toString('hex');
  return prefix ? `${prefix}_${id}` : id;
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function sha256(input) {
  return createHash('sha256').update(String(input)).digest('hex');
}

export function hmacSign(secret, payload) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Cookie value: sessionId.signature */
export function signSessionCookie(sessionId, secret) {
  const sig = hmacSign(secret, sessionId);
  return `${sessionId}.${sig}`;
}

export function verifySessionCookie(value, secret) {
  if (!value || !secret) return null;
  const i = value.lastIndexOf('.');
  if (i <= 0) return null;
  const sessionId = value.slice(0, i);
  const sig = value.slice(i + 1);
  const expected = hmacSign(secret, sessionId);
  if (!safeEqual(sig, expected)) return null;
  return sessionId;
}
