/**
 * Règles de conservation LMDPT — fonctions pures + exécution optionnelle.
 * Aucune routine n’est branchée (pas de cron, pas de timer, pas d’appel au démarrage).
 */
import { join } from 'node:path';
import { loadJson, saveJsonAtomic } from './auth/store.mjs';
import { withDataLockSync } from './data-lock.mjs';

/** Propositions rejetées / masquées : 12 mois après traitement. */
export const TIPS_REJECTED_MONTHS = 12;
/** E-mail facultatif des propositions : 12 mois après createdAt. */
export const TIPS_EMAIL_MONTHS = 12;
/** Comptes : 3 ans sans connexion. */
export const ACCOUNTS_INACTIVE_YEARS = 3;
/** Commentaires : 3 ans après publication (à défaut création). */
export const COMMENTS_RETENTION_YEARS = 3;

const EMPTY_TIPS = { version: 1, tips: [] };
const EMPTY_COMMENTS = { version: 1, comments: [] };
const EMPTY_USERS = { version: 1, users: [] };
const EMPTY_SESSIONS = { version: 1, sessions: [] };
const EMPTY_MAGIC = { version: 1, tokens: [] };

export const DELETED_ACCOUNT_DISPLAY_NAME = 'Compte supprimé';

const AUTHOR_LINK_KEYS = ['authorKeyHash', 'email', 'contactEmail', 'authorEmail', 'userEmail'];

const PURGEABLE_TIP_STATUS = new Set(['rejected', 'hidden']);

export function addUtcMonths(date, months) {
  const d = new Date(date.getTime());
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

export function addUtcYears(date, years) {
  const d = new Date(date.getTime());
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d;
}

function parseDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** true si `now` a atteint ou dépassé `from + durée`. */
export function isDue(from, now, { months, years } = {}) {
  const start = parseDate(from);
  const nowDate = parseDate(now);
  if (!start || !nowDate) return false;
  const threshold =
    years != null ? addUtcYears(start, years) : addUtcMonths(start, months ?? 0);
  return nowDate.getTime() >= threshold.getTime();
}

/** Dernière entrée moderation.history.at, à défaut createdAt. */
export function lastTreatmentAt(item) {
  const hist = item?.moderation?.history;
  if (Array.isArray(hist)) {
    for (let i = hist.length - 1; i >= 0; i--) {
      const d = parseDate(hist[i]?.at);
      if (d) return d;
    }
  }
  return parseDate(item?.createdAt);
}

function cloneDb(db, key, fallback) {
  const base = db && typeof db === 'object' ? db : fallback;
  const list = Array.isArray(base[key]) ? base[key].map((item) => ({ ...item })) : [];
  return { ...fallback, ...base, [key]: list };
}

function collectUserEmails(user) {
  const emails = new Set();
  if (user?.email) emails.add(String(user.email).trim().toLowerCase());
  for (const p of user?.providers || []) {
    if (p?.email) emails.add(String(p.email).trim().toLowerCase());
  }
  return emails;
}

/**
 * Neutralise le rattachement auteur d’un commentaire conservé.
 * Ne touche pas à moderation.history (identifiant du modérateur).
 */
export function anonymizeCommentRecord(comment) {
  const next = {
    ...comment,
    userId: null,
    displayName: DELETED_ACCOUNT_DISPLAY_NAME,
    authorKeyHash: null,
  };
  for (const key of AUTHOR_LINK_KEYS) {
    if (key === 'authorKeyHash') continue;
    if (Object.prototype.hasOwnProperty.call(next, key)) next[key] = null;
  }
  return next;
}

/**
 * Anonymise les commentaires d’un compte (mutation in-place du tableau).
 * Réutilisable par la purge et par un chemin manuel s’il existe un jour.
 * @returns {number} commentaires anonymisés
 */
export function anonymizeCommentsForUser(comments, userId) {
  if (!Array.isArray(comments) || !userId) return 0;
  let n = 0;
  for (let i = 0; i < comments.length; i++) {
    const c = comments[i];
    if (c && c.userId === userId) {
      comments[i] = anonymizeCommentRecord(c);
      n += 1;
    }
  }
  return n;
}

/**
 * Calcule la purge sans I/O. Ne mute pas les objets d’entrée.
 * @returns {{ tipsDb, commentsDb, usersDb, sessionsDb, magicDb, counts }}
 */
export function computeRetention({ tipsDb, commentsDb, usersDb, sessionsDb, magicDb } = {}, now) {
  const nowDate = parseDate(now) || new Date();
  const tipsNext = cloneDb(tipsDb, 'tips', EMPTY_TIPS);
  const commentsNext = cloneDb(commentsDb, 'comments', EMPTY_COMMENTS);
  const usersNext = cloneDb(usersDb, 'users', EMPTY_USERS);
  const sessionsNext = cloneDb(sessionsDb, 'sessions', EMPTY_SESSIONS);
  const magicNext = cloneDb(magicDb, 'tokens', EMPTY_MAGIC);

  const commentsKept = [];
  let commentsDeleted = 0;
  for (const c of commentsNext.comments) {
    const ref = c.publishedAt || c.createdAt;
    if (isDue(ref, nowDate, { years: COMMENTS_RETENTION_YEARS })) {
      commentsDeleted += 1;
    } else {
      commentsKept.push(c);
    }
  }

  const deletedUserIds = new Set();
  const deletedEmails = new Set();
  const usersKept = [];
  for (const u of usersNext.users) {
    const ref = u.lastLoginAt || u.createdAt;
    if (u.id && isDue(ref, nowDate, { years: ACCOUNTS_INACTIVE_YEARS })) {
      deletedUserIds.add(u.id);
      for (const email of collectUserEmails(u)) deletedEmails.add(email);
    } else {
      usersKept.push(u);
    }
  }

  let commentsUnlinked = 0;
  for (const userId of deletedUserIds) {
    commentsUnlinked += anonymizeCommentsForUser(commentsKept, userId);
  }

  const sessionsKept = [];
  let sessionsDeleted = 0;
  for (const s of sessionsNext.sessions) {
    if (s.userId && deletedUserIds.has(s.userId)) {
      sessionsDeleted += 1;
    } else {
      sessionsKept.push(s);
    }
  }

  const tokensKept = [];
  let magicDeleted = 0;
  for (const t of magicNext.tokens) {
    const email = t.email ? String(t.email).trim().toLowerCase() : '';
    if (email && deletedEmails.has(email)) {
      magicDeleted += 1;
    } else {
      tokensKept.push(t);
    }
  }

  const tipsKept = [];
  let tipsDeleted = 0;
  for (const t of tipsNext.tips) {
    if (PURGEABLE_TIP_STATUS.has(t.status)) {
      const treated = lastTreatmentAt(t);
      if (treated && isDue(treated, nowDate, { months: TIPS_REJECTED_MONTHS })) {
        tipsDeleted += 1;
        continue;
      }
    }
    tipsKept.push(t);
  }

  let tipEmailsCleared = 0;
  for (const t of tipsKept) {
    if (t.contactEmail && isDue(t.createdAt, nowDate, { months: TIPS_EMAIL_MONTHS })) {
      t.contactEmail = null;
      tipEmailsCleared += 1;
    }
  }

  return {
    tipsDb: { ...tipsNext, tips: tipsKept },
    commentsDb: { ...commentsNext, comments: commentsKept },
    usersDb: { ...usersNext, users: usersKept },
    sessionsDb: { ...sessionsNext, sessions: sessionsKept },
    magicDb: { ...magicNext, tokens: tokensKept },
    counts: {
      tipsDeleted,
      tipEmailsCleared,
      commentsDeleted,
      commentsUnlinked,
      accountsDeleted: deletedUserIds.size,
      sessionsDeleted,
      magicDeleted,
    },
  };
}

/**
 * Charge les JSON, calcule, n’écrit que si apply === true (saveJsonAtomic).
 * @returns {object} compteurs uniquement
 */
export function runRetention({ dataDir, now = new Date(), apply = false }) {
  if (!dataDir) {
    throw new Error('dataDir requis');
  }
  const work = () => {
    const tipsPath = join(dataDir, 'tips.json');
    const commentsPath = join(dataDir, 'comments.json');
    const usersPath = join(dataDir, 'users.json');
    const sessionsPath = join(dataDir, 'sessions.json');
    const magicFile = join(dataDir, 'magic-tokens.json');

    const tipsDb = loadJson(tipsPath, EMPTY_TIPS);
    const commentsDb = loadJson(commentsPath, EMPTY_COMMENTS);
    const usersDb = loadJson(usersPath, EMPTY_USERS);
    const sessionsDb = loadJson(sessionsPath, EMPTY_SESSIONS);
    const magicDb = loadJson(magicFile, EMPTY_MAGIC);

    const result = computeRetention(
      { tipsDb, commentsDb, usersDb, sessionsDb, magicDb },
      now,
    );

    if (apply === true) {
      saveJsonAtomic(tipsPath, result.tipsDb);
      saveJsonAtomic(commentsPath, result.commentsDb);
      saveJsonAtomic(usersPath, result.usersDb);
      saveJsonAtomic(sessionsPath, result.sessionsDb);
      saveJsonAtomic(magicFile, result.magicDb);
    }

    return result.counts;
  };

  if (apply === true) {
    return withDataLockSync(dataDir, 'retention-purge', work);
  }
  return work();
}
