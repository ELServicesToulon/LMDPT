/**
 * Flux OAuth2 / OIDC pour Google, X (PKCE), Apple.
 */
import { createSign, createHash, randomBytes } from 'node:crypto';
import { providerConfig, callbackUrl } from './config.mjs';
import { createOAuthState, consumeOAuthState } from './oauth-state.mjs';
import { upsertFromProvider } from './users.mjs';

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function pkcePair() {
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  return { verifier, challenge };
}

export function buildAuthorizeRedirect(dataDir, providerId, { next = '/' } = {}) {
  const cfg = providerConfig()[providerId];
  if (!cfg?.enabled) {
    const err = new Error(`Provider ${providerId} non configuré`);
    err.status = 503;
    throw err;
  }

  if (providerId === 'x') {
    const { verifier, challenge } = pkcePair();
    const st = createOAuthState(dataDir, { provider: 'x', next, codeVerifier: verifier });
    const u = new URL(cfg.authUrl);
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('client_id', cfg.clientId);
    u.searchParams.set('redirect_uri', callbackUrl('x'));
    u.searchParams.set('scope', cfg.scopes);
    u.searchParams.set('state', st.state);
    u.searchParams.set('code_challenge', challenge);
    u.searchParams.set('code_challenge_method', 'S256');
    return u.toString();
  }

  if (providerId === 'google') {
    const st = createOAuthState(dataDir, { provider: 'google', next });
    const u = new URL(cfg.authUrl);
    u.searchParams.set('response_type', 'code');
    u.searchParams.set('client_id', cfg.clientId);
    u.searchParams.set('redirect_uri', callbackUrl('google'));
    u.searchParams.set('scope', cfg.scopes);
    u.searchParams.set('state', st.state);
    u.searchParams.set('access_type', 'online');
    u.searchParams.set('prompt', 'select_account');
    return u.toString();
  }

  if (providerId === 'apple') {
    const st = createOAuthState(dataDir, { provider: 'apple', next });
    const u = new URL(cfg.authUrl);
    u.searchParams.set('response_type', 'code id_token');
    u.searchParams.set('response_mode', 'form_post');
    u.searchParams.set('client_id', cfg.clientId);
    u.searchParams.set('redirect_uri', callbackUrl('apple'));
    u.searchParams.set('scope', cfg.scopes);
    u.searchParams.set('state', st.state);
    return u.toString();
  }

  const err = new Error(`Provider inconnu: ${providerId}`);
  err.status = 400;
  throw err;
}

async function exchangeGoogle(code) {
  const cfg = providerConfig().google;
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: callbackUrl('google'),
    grant_type: 'authorization_code',
  });
  const tokRes = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const tok = await tokRes.json();
  if (!tokRes.ok) throw new Error(tok.error || `Google token HTTP ${tokRes.status}`);
  const uiRes = await fetch(cfg.userInfoUrl, {
    headers: { Authorization: `Bearer ${tok.access_token}` },
  });
  const ui = await uiRes.json();
  if (!uiRes.ok) throw new Error(ui.error || `Google userinfo HTTP ${uiRes.status}`);
  return {
    provider: 'google',
    providerUserId: ui.sub,
    email: ui.email || null,
    emailVerified: Boolean(ui.email_verified),
    displayName: ui.name || ui.given_name || null,
  };
}

async function exchangeX(code, codeVerifier) {
  const cfg = providerConfig().x;
  const basic = Buffer.from(`${cfg.clientId}:${cfg.clientSecret}`).toString('base64');
  const body = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: cfg.clientId,
    redirect_uri: callbackUrl('x'),
    code_verifier: codeVerifier || '',
  });
  const tokRes = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body,
  });
  const tok = await tokRes.json();
  if (!tokRes.ok) throw new Error(tok.error_description || tok.error || `X token HTTP ${tokRes.status}`);
  const uiRes = await fetch(`${cfg.userInfoUrl}?user.fields=id,name,username`, {
    headers: { Authorization: `Bearer ${tok.access_token}` },
  });
  const ui = await uiRes.json();
  if (!uiRes.ok) throw new Error(ui.detail || `X users/me HTTP ${uiRes.status}`);
  const d = ui.data || {};
  return {
    provider: 'x',
    providerUserId: d.id,
    email: null,
    emailVerified: false,
    displayName: d.name || d.username || null,
  };
}

/** Client secret Apple = JWT ES256 (5–15 min) */
function appleClientSecret() {
  const cfg = providerConfig().apple;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'ES256', kid: cfg.keyId }));
  const payload = b64url(
    JSON.stringify({
      iss: cfg.teamId,
      iat: now,
      exp: now + 60 * 10,
      aud: 'https://appleid.apple.com',
      sub: cfg.clientId,
    }),
  );
  const data = `${header}.${payload}`;
  const sign = createSign('SHA256');
  sign.update(data);
  sign.end();
  const sig = sign.sign(cfg.privateKey);
  // Apple expects ECDSA sig in IEEE P1363 / raw; Node sign gives DER — convert if needed.
  // For many Node versions, convert DER to raw JOSE:
  const rawSig = derToJose(sig, 32);
  return `${data}.${b64url(rawSig)}`;
}

function derToJose(der, size) {
  // Minimal DER SEQUENCE (r,s) → r||s fixed size
  let offset = 2;
  if (der[1] & 0x80) offset += der[1] & 0x7f;
  if (der[offset] !== 0x02) throw new Error('Apple JWT: bad DER');
  const rLen = der[offset + 1];
  let r = der.subarray(offset + 2, offset + 2 + rLen);
  offset = offset + 2 + rLen;
  if (der[offset] !== 0x02) throw new Error('Apple JWT: bad DER s');
  const sLen = der[offset + 1];
  let s = der.subarray(offset + 2, offset + 2 + sLen);
  if (r[0] === 0x00) r = r.subarray(1);
  if (s[0] === 0x00) s = s.subarray(1);
  const out = Buffer.alloc(size * 2);
  r.copy(out, size - r.length);
  s.copy(out, size * 2 - s.length);
  return out;
}

function decodeJwtPayload(jwt) {
  const part = String(jwt || '').split('.')[1];
  if (!part) return {};
  const json = Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

async function exchangeApple(code, idToken) {
  const cfg = providerConfig().apple;
  const clientSecret = appleClientSecret();
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: clientSecret,
    redirect_uri: callbackUrl('apple'),
    grant_type: 'authorization_code',
  });
  const tokRes = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const tok = await tokRes.json();
  if (!tokRes.ok) throw new Error(tok.error || `Apple token HTTP ${tokRes.status}`);
  const claims = decodeJwtPayload(tok.id_token || idToken);
  return {
    provider: 'apple',
    providerUserId: claims.sub,
    email: claims.email || null,
    emailVerified: Boolean(claims.email_verified === 'true' || claims.email_verified === true),
    displayName: null,
  };
}

/**
 * Callback unifié → user record
 */
export async function handleOAuthCallback(dataDir, providerId, { code, state, idToken }) {
  const st = consumeOAuthState(dataDir, state);
  if (!st || st.provider !== providerId) {
    const err = new Error('State OAuth invalide ou expiré');
    err.status = 400;
    throw err;
  }
  if (!code && providerId !== 'apple') {
    const err = new Error('code manquant');
    err.status = 400;
    throw err;
  }

  let identity;
  if (providerId === 'google') identity = await exchangeGoogle(code);
  else if (providerId === 'x') identity = await exchangeX(code, st.codeVerifier);
  else if (providerId === 'apple') identity = await exchangeApple(code, idToken);
  else {
    const err = new Error('Provider inconnu');
    err.status = 400;
    throw err;
  }

  if (!identity.providerUserId) {
    const err = new Error('Identité IdP incomplète');
    err.status = 502;
    throw err;
  }

  const user = upsertFromProvider(dataDir, identity);
  return { user, next: st.next || '/' };
}
