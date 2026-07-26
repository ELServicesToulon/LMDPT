import { loadJson, saveJsonAtomic, usersPath } from './store.mjs';
import { randomId } from './crypto.mjs';

const EMPTY = { version: 1, users: [] };

export function loadUsers(dataDir) {
  return loadJson(usersPath(dataDir), EMPTY);
}

export function saveUsers(dataDir, db) {
  saveJsonAtomic(usersPath(dataDir), db);
}

/**
 * Trouve ou crée un user à partir d'un login IdP.
 * Merge si email vérifié déjà connu.
 */
export function upsertFromProvider(dataDir, {
  provider,
  providerUserId,
  email = null,
  emailVerified = false,
  displayName = null,
}) {
  if (!provider || !providerUserId) {
    throw new Error('provider + providerUserId requis');
  }
  const db = loadUsers(dataDir);
  const now = new Date().toISOString();
  const emailNorm = email ? String(email).trim().toLowerCase() : null;

  let user =
    db.users.find((u) =>
      (u.providers || []).some(
        (p) => p.provider === provider && p.providerUserId === String(providerUserId),
      ),
    ) || null;

  if (!user && emailNorm && emailVerified) {
    user = db.users.find((u) => u.email === emailNorm && u.emailVerified) || null;
  }

  if (!user) {
    user = {
      id: randomId('usr'),
      providers: [],
      email: emailNorm,
      emailVerified: Boolean(emailVerified && emailNorm),
      displayNameDefault: String(displayName || 'Citoyen·ne').slice(0, 40) || 'Citoyen·ne',
      preferredHueSlug: null,
      role: 'lecteur',
      createdAt: now,
      lastLoginAt: now,
    };
    db.users.push(user);
  }

  const prov = {
    provider,
    providerUserId: String(providerUserId),
    email: emailNorm,
    linkedAt: now,
  };
  const idx = (user.providers || []).findIndex(
    (p) => p.provider === provider && p.providerUserId === String(providerUserId),
  );
  if (idx >= 0) user.providers[idx] = { ...user.providers[idx], ...prov };
  else {
    user.providers = user.providers || [];
    user.providers.push(prov);
  }

  if (emailNorm && emailVerified) {
    user.email = emailNorm;
    user.emailVerified = true;
  }
  if (displayName && !user.displayNameDefault) {
    user.displayNameDefault = String(displayName).slice(0, 40);
  }
  user.lastLoginAt = now;
  saveUsers(dataDir, db);
  return user;
}

export function getUserById(dataDir, id) {
  if (!id) return null;
  const db = loadUsers(dataDir);
  return db.users.find((u) => u.id === id) || null;
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    displayName: user.displayNameDefault || 'Citoyen·ne',
    preferredHueSlug: user.preferredHueSlug || null,
    role: user.role || 'lecteur',
    providers: (user.providers || []).map((p) => p.provider),
    // email volontairement absent du public
  };
}

export function updateDisplayName(dataDir, userId, displayName) {
  const db = loadUsers(dataDir);
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;
  user.displayNameDefault = String(displayName || 'Citoyen·ne').slice(0, 40) || 'Citoyen·ne';
  saveUsers(dataDir, db);
  return user;
}
