/**
 * Configuration providers auth LMDPT.
 * Un provider n'est « enabled » que si ses secrets sont présents.
 */

export function publicUrl() {
  return (process.env.LMDPT_PUBLIC_URL || 'https://lmdpt.iarbre.org').replace(/\/$/, '');
}

export function authEnabled() {
  return process.env.LMDPT_AUTH_ENABLED === '1' || process.env.LMDPT_AUTH_ENABLED === 'true';
}

export function authRequired() {
  // Publish exige session si true (défaut true quand auth enabled)
  if (process.env.LMDPT_AUTH_REQUIRED === '0' || process.env.LMDPT_AUTH_REQUIRED === 'false') {
    return false;
  }
  if (process.env.LMDPT_AUTH_REQUIRED === '1' || process.env.LMDPT_AUTH_REQUIRED === 'true') {
    return true;
  }
  return authEnabled();
}

export function callbackUrl(provider) {
  return `${publicUrl()}/api/auth/callback/${provider}`;
}

export function providerConfig() {
  const google = {
    id: 'google',
    label: 'Google',
    enabled: Boolean(
      process.env.LMDPT_GOOGLE_CLIENT_ID && process.env.LMDPT_GOOGLE_CLIENT_SECRET,
    ),
    clientId: process.env.LMDPT_GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.LMDPT_GOOGLE_CLIENT_SECRET || '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scopes: 'openid email profile',
  };

  const x = {
    id: 'x',
    label: 'X',
    enabled: Boolean(
      process.env.LMDPT_X_OAUTH_CLIENT_ID && process.env.LMDPT_X_OAUTH_CLIENT_SECRET,
    ),
    clientId: process.env.LMDPT_X_OAUTH_CLIENT_ID || '',
    clientSecret: process.env.LMDPT_X_OAUTH_CLIENT_SECRET || '',
    authUrl: 'https://x.com/i/oauth2/authorize',
    tokenUrl: 'https://api.x.com/2/oauth2/token',
    userInfoUrl: 'https://api.x.com/2/users/me',
    scopes: 'users.read tweet.read offline.access',
  };

  const apple = {
    id: 'apple',
    label: 'Apple',
    enabled: Boolean(
      process.env.LMDPT_APPLE_CLIENT_ID &&
        process.env.LMDPT_APPLE_TEAM_ID &&
        process.env.LMDPT_APPLE_KEY_ID &&
        process.env.LMDPT_APPLE_PRIVATE_KEY,
    ),
    clientId: process.env.LMDPT_APPLE_CLIENT_ID || '',
    teamId: process.env.LMDPT_APPLE_TEAM_ID || '',
    keyId: process.env.LMDPT_APPLE_KEY_ID || '',
    privateKey: (process.env.LMDPT_APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    authUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
    scopes: 'name email',
  };

  const email = {
    id: 'email',
    label: 'Email',
    enabled:
      process.env.LMDPT_AUTH_EMAIL !== '0' &&
      (Boolean(process.env.LMDPT_SMTP_URL || process.env.LMDPT_SMTP_HOST) ||
        process.env.LMDPT_AUTH_EMAIL_DEV === '1' ||
        process.env.NODE_ENV !== 'production'),
    // en dev sans SMTP : tokens loggés (file-sink)
    devSink: process.env.LMDPT_AUTH_EMAIL_DEV === '1' || !process.env.LMDPT_SMTP_HOST,
  };

  return { google, x, apple, email };
}

export function listProvidersPublic() {
  const cfg = providerConfig();
  return Object.values(cfg).map((p) => ({
    id: p.id,
    label: p.label,
    enabled: Boolean(p.enabled),
  }));
}
