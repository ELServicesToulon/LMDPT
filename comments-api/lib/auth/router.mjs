/**
 * Routeur /api/auth/* — à appeler depuis comments-api/server.mjs
 */
import {
  authEnabled,
  listProvidersPublic,
  publicUrl,
  providerConfig,
} from './config.mjs';
import {
  createSession,
  sessionIdFromRequest,
  getSession,
  touchSession,
  revokeSession,
  buildSetCookie,
  buildClearCookie,
  sessionSecret,
} from './session.mjs';
import { getUserById, publicUser, upsertFromProvider, updateDisplayName } from './users.mjs';
import { buildAuthorizeRedirect, handleOAuthCallback } from './oauth-providers.mjs';
import {
  createMagicToken,
  consumeMagicToken,
  sendMagicEmail,
  rateLimit,
} from './email-magic.mjs';
import { sanitizeNext } from './oauth-state.mjs';

function redirect(res, location, { setCookie } = {}) {
  const headers = {
    Location: location,
    'Cache-Control': 'no-store',
  };
  if (setCookie) headers['Set-Cookie'] = setCookie;
  res.writeHead(302, headers);
  res.end();
}

function clientIp(req) {
  return (
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * @returns {Promise<boolean>} true si la requête a été traitée
 */
export async function handleAuthRoutes(req, res, {
  dataDir,
  path,
  method,
  readBody,
  json,
  parseForm,
}) {
  if (!path.startsWith('/api/auth')) return false;

  // Feature flag : endpoints visibles mais login bloqué sauf me/providers
  const enabled = authEnabled();

  if (method === 'GET' && (path === '/api/auth/providers' || path === '/api/auth/health')) {
    json(res, 200, {
      ok: true,
      authEnabled: enabled,
      publicUrl: publicUrl(),
      sessionSecretConfigured: Boolean(sessionSecret()),
      providers: listProvidersPublic(),
    });
    return true;
  }

  if (method === 'GET' && path === '/api/auth/me') {
    const sid = sessionIdFromRequest(req);
    if (!sid) {
      json(res, 200, { authenticated: false, user: null });
      return true;
    }
    const sess = touchSession(dataDir, sid);
    if (!sess) {
      json(res, 200, { authenticated: false, user: null }, { setCookie: buildClearCookie() });
      return true;
    }
    const user = getUserById(dataDir, sess.userId);
    json(res, 200, {
      authenticated: Boolean(user),
      user: publicUser(user),
    });
    return true;
  }

  if (method === 'POST' && path === '/api/auth/logout') {
    const sid = sessionIdFromRequest(req);
    if (sid) revokeSession(dataDir, sid);
    json(res, 200, { ok: true }, { setCookie: buildClearCookie() });
    return true;
  }

  if (method === 'POST' && path === '/api/auth/profile') {
    const sid = sessionIdFromRequest(req);
    const sess = sid ? getSession(dataDir, sid) : null;
    if (!sess) {
      json(res, 401, { error: 'Connexion requise' });
      return true;
    }
    const body = await readBody(req);
    const user = updateDisplayName(dataDir, sess.userId, body.displayName);
    json(res, 200, { ok: true, user: publicUser(user) });
    return true;
  }

  // --- starts require authEnabled + secret ---
  if (!enabled) {
    json(res, 503, {
      error: 'Auth LMDPT désactivée (LMDPT_AUTH_ENABLED≠1)',
      providers: listProvidersPublic(),
    });
    return true;
  }
  if (!sessionSecret()) {
    json(res, 503, { error: 'LMDPT_SESSION_SECRET manquant côté serveur' });
    return true;
  }

  // OAuth start
  const startMatch = path.match(/^\/api\/auth\/start\/(google|x|apple)$/);
  if (method === 'GET' && startMatch) {
    const provider = startMatch[1];
    const url = new URL(req.url || '/', 'http://local');
    const next = sanitizeNext(url.searchParams.get('next') || '/');
    try {
      const loc = buildAuthorizeRedirect(dataDir, provider, { next });
      redirect(res, loc);
    } catch (e) {
      json(res, e.status || 500, { error: e.message || String(e) });
    }
    return true;
  }

  // OAuth callback GET (Google, X)
  const cbMatch = path.match(/^\/api\/auth\/callback\/(google|x|apple)$/);
  if (cbMatch) {
    const provider = cbMatch[1];
    let code;
    let state;
    let idToken;
    if (method === 'POST') {
      const raw = await readBody(req, { raw: true });
      const form = parseForm ? parseForm(raw) : Object.fromEntries(new URLSearchParams(raw));
      code = form.code;
      state = form.state;
      idToken = form.id_token;
    } else if (method === 'GET') {
      const url = new URL(req.url || '/', 'http://local');
      code = url.searchParams.get('code');
      state = url.searchParams.get('state');
      idToken = url.searchParams.get('id_token');
    } else {
      json(res, 405, { error: 'Method not allowed' });
      return true;
    }
    try {
      const { user, next } = await handleOAuthCallback(dataDir, provider, {
        code,
        state,
        idToken,
      });
      const sess = createSession(dataDir, user.id);
      redirect(res, next || '/', { setCookie: buildSetCookie(sess.id) });
    } catch (e) {
      console.error('[lmdpt-auth] callback', provider, e.message || e);
      redirect(res, `/connexion?error=${encodeURIComponent(e.message || 'oauth_failed')}`);
    }
    return true;
  }

  // Email magic start
  if (method === 'POST' && path === '/api/auth/email/start') {
    const cfg = providerConfig().email;
    if (!cfg.enabled) {
      json(res, 503, { error: 'Connexion email non disponible' });
      return true;
    }
    const body = await readBody(req);
    const email = String(body.email || '').trim().toLowerCase();
    const ip = clientIp(req);
    if (!rateLimit(`email:ip:${ip}`, { max: 8 }) || !rateLimit(`email:addr:${email}`, { max: 3 })) {
      json(res, 429, { error: 'Trop de demandes — réessayez plus tard.' });
      return true;
    }
    try {
      const magic = createMagicToken(dataDir, email);
      const next = sanitizeNext(body.next || '/');
      // encode next in token store would be better; append to verify URL
      const verifyUrl = `${magic.verifyUrl}&next=${encodeURIComponent(next)}`;
      await sendMagicEmail({ to: magic.email, verifyUrl });
      json(res, 200, {
        ok: true,
        message: 'Si l’adresse est valide, un lien de connexion a été envoyé (valable 15 min).',
        // dev only
        ...(cfg.devSink && process.env.LMDPT_AUTH_EMAIL_DEV === '1'
          ? { devVerifyUrl: verifyUrl }
          : {}),
      });
    } catch (e) {
      json(res, e.status || 500, { error: e.message || String(e) });
    }
    return true;
  }

  // Email verify
  if (method === 'GET' && path === '/api/auth/email/verify') {
    const url = new URL(req.url || '/', 'http://local');
    const token = url.searchParams.get('token');
    const next = sanitizeNext(url.searchParams.get('next') || '/');
    const item = consumeMagicToken(dataDir, token);
    if (!item) {
      redirect(res, '/connexion?error=lien_expire');
      return true;
    }
    const user = upsertFromProvider(dataDir, {
      provider: 'email',
      providerUserId: item.email,
      email: item.email,
      emailVerified: true,
      displayName: item.email.split('@')[0].slice(0, 40),
    });
    const sess = createSession(dataDir, user.id);
    redirect(res, next, { setCookie: buildSetCookie(sess.id) });
    return true;
  }

  json(res, 404, { error: 'Route auth inconnue' });
  return true;
}

/** Résout user session pour requireAuth sur publish */
export function resolveSessionUser(req, dataDir) {
  const sid = sessionIdFromRequest(req);
  if (!sid) return null;
  const sess = touchSession(dataDir, sid);
  if (!sess) return null;
  return getUserById(dataDir, sess.userId);
}
