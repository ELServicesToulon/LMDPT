/**
 * Tests unitaires auth LMDPT — node --test
 *   node --test comments-api/lib/auth/auth.test.mjs
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  signSessionCookie,
  verifySessionCookie,
  randomId,
  sha256,
} from './crypto.mjs';
import { createSession, getSession, revokeSession, touchSession } from './session.mjs';
import { upsertFromProvider, getUserById, publicUser } from './users.mjs';
import { createMagicToken, consumeMagicToken, rateLimit } from './email-magic.mjs';
import { createOAuthState, consumeOAuthState, sanitizeNext } from './oauth-state.mjs';

let dataDir;

before(() => {
  dataDir = mkdtempSync(join(tmpdir(), 'lmdpt-auth-'));
});

after(() => {
  try {
    rmSync(dataDir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});

describe('crypto', () => {
  it('signs and verifies session cookie', () => {
    const secret = 'test-secret-32-bytes-minimum!!';
    const sid = randomId('ses');
    const cookie = signSessionCookie(sid, secret);
    assert.equal(verifySessionCookie(cookie, secret), sid);
    assert.equal(verifySessionCookie(cookie, 'wrong'), null);
  });
});

describe('users', () => {
  it('upserts provider and merges by verified email', () => {
    const u1 = upsertFromProvider(dataDir, {
      provider: 'google',
      providerUserId: 'g-1',
      email: 'a@example.com',
      emailVerified: true,
      displayName: 'Alice',
    });
    assert.ok(u1.id.startsWith('usr_'));
    const u2 = upsertFromProvider(dataDir, {
      provider: 'email',
      providerUserId: 'a@example.com',
      email: 'a@example.com',
      emailVerified: true,
    });
    assert.equal(u2.id, u1.id);
    assert.ok(u2.providers.some((p) => p.provider === 'google'));
    assert.ok(u2.providers.some((p) => p.provider === 'email'));
    const pub = publicUser(u2);
    assert.equal(pub.email, undefined);
    assert.ok(pub.providers.includes('google'));
  });
});

describe('session', () => {
  it('creates, touches, revokes', () => {
    const user = upsertFromProvider(dataDir, {
      provider: 'x',
      providerUserId: 'x-99',
      displayName: 'Xuser',
    });
    const s = createSession(dataDir, user.id);
    assert.ok(getSession(dataDir, s.id));
    assert.ok(touchSession(dataDir, s.id));
    revokeSession(dataDir, s.id);
    assert.equal(getSession(dataDir, s.id), null);
  });
});

describe('magic email', () => {
  it('create and consume once', () => {
    const m = createMagicToken(dataDir, 'bob@example.com');
    assert.ok(m.verifyUrl.includes('token='));
    const item = consumeMagicToken(dataDir, m.token);
    assert.equal(item.email, 'bob@example.com');
    assert.equal(consumeMagicToken(dataDir, m.token), null);
  });

  it('rate limits', () => {
    const key = `t-${Date.now()}`;
    assert.equal(rateLimit(key, { max: 2, windowMs: 60_000 }), true);
    assert.equal(rateLimit(key, { max: 2, windowMs: 60_000 }), true);
    assert.equal(rateLimit(key, { max: 2, windowMs: 60_000 }), false);
  });
});

describe('oauth state', () => {
  it('sanitizes next and consumes state', () => {
    assert.equal(sanitizeNext('https://evil.com'), '/');
    assert.equal(sanitizeNext('//evil'), '/');
    assert.equal(sanitizeNext('/debats/foo'), '/debats/foo');
    const st = createOAuthState(dataDir, { provider: 'google', next: '/x' });
    const got = consumeOAuthState(dataDir, st.state);
    assert.equal(got.provider, 'google');
    assert.equal(consumeOAuthState(dataDir, st.state), null);
  });
});

describe('sha256', () => {
  it('stable', () => {
    assert.equal(sha256('a').length, 64);
    assert.equal(sha256('a'), sha256('a'));
  });
});
