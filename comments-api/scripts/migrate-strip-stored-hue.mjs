#!/usr/bin/env node
/**
 * Retire la teinte stockée (commentaires + comptes). Dry-run par défaut.
 * N’écrit que si --apply ; sauvegarde horodatée mode 600 avant écriture.
 */
import { chmodSync, copyFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { saveJsonAtomic } from '../lib/auth/store.mjs';
import {
  isLockedError,
  releaseDataLock,
  waitForDataLock,
  withDataLockSync,
} from '../lib/data-lock.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const EMPTY_COMMENTS = { version: 1, comments: [] };
const EMPTY_USERS = { version: 1, users: [] };

/**
 * @param {object} db comments.json
 * @param {object} usersDb users.json
 * @returns {{ comments: object, users: object, counts: object }}
 */
export function stripStoredHue(db, usersDb) {
  const commentsIn = Array.isArray(db?.comments) ? db.comments : [];
  const usersIn = Array.isArray(usersDb?.users) ? usersDb.users : [];

  let commentsStripped = 0;
  let recolorSlugsStripped = 0;
  let preferredHueStripped = 0;

  const comments = commentsIn.map((c) => {
    const next = { ...c };
    if (Object.prototype.hasOwnProperty.call(next, 'politicalHue')) {
      delete next.politicalHue;
      commentsStripped += 1;
    }
    const hist = next.moderation?.history;
    if (Array.isArray(hist)) {
      const history = hist.map((h) => {
        if (h && h.action === 'recolor' && Object.prototype.hasOwnProperty.call(h, 'slug')) {
          recolorSlugsStripped += 1;
          const { slug: _slug, ...rest } = h;
          return rest;
        }
        return h;
      });
      next.moderation = { ...next.moderation, history };
    }
    return next;
  });

  const users = usersIn.map((u) => {
    if (u && Object.prototype.hasOwnProperty.call(u, 'preferredHueSlug')) {
      preferredHueStripped += 1;
      const { preferredHueSlug: _hue, ...rest } = u;
      return rest;
    }
    return u;
  });

  return {
    comments: { ...(db || EMPTY_COMMENTS), comments },
    users: { ...(usersDb || EMPTY_USERS), users },
    counts: {
      commentsStripped,
      recolorSlugsStripped,
      preferredHueStripped,
    },
  };
}

function loadJsonOrThrow(path, fallback) {
  if (!existsSync(path)) return { data: structuredClone(fallback), exists: false };
  return { data: JSON.parse(readFileSync(path, 'utf8')), exists: true };
}

function bakStamp(now) {
  return now.toISOString().replace(/[:.]/g, '-');
}

function backupFile(src, dest) {
  copyFileSync(src, dest);
  chmodSync(dest, 0o600);
}

export function commentsDataDir() {
  return process.env.LMDPT_COMMENTS_DATA || join(__dirname, '..', 'data');
}

/**
 * @param {{ dataDir: string, apply?: boolean, now?: Date }} opts
 * @returns {object} compteurs
 */
export function runMigrateStripStoredHue({ dataDir, apply = false, now = new Date() }) {
  if (!dataDir) throw new Error('dataDir requis');
  const work = () => {
    const commentsPath = join(dataDir, 'comments.json');
    const usersPath = join(dataDir, 'users.json');
    const commentsLoaded = loadJsonOrThrow(commentsPath, EMPTY_COMMENTS);
    const usersLoaded = loadJsonOrThrow(usersPath, EMPTY_USERS);
    const result = stripStoredHue(commentsLoaded.data, usersLoaded.data);

    if (apply === true) {
      const stamp = bakStamp(now);
      if (commentsLoaded.exists) {
        backupFile(commentsPath, join(dataDir, `comments.json.bak-${stamp}`));
        saveJsonAtomic(commentsPath, result.comments);
      }
      if (usersLoaded.exists) {
        backupFile(usersPath, join(dataDir, `users.json.bak-${stamp}`));
        saveJsonAtomic(usersPath, result.users);
      }
    }

    return result.counts;
  };

  if (apply === true) {
    return withDataLockSync(dataDir, 'migrate-strip-hue', work);
  }
  return work();
}

function lockTimeoutMs() {
  const n = Number(process.env.LMDPT_PURGE_LOCK_TIMEOUT_MS);
  return Number.isFinite(n) && n >= 0 ? n : 60_000;
}

function lockIntervalMs() {
  const n = Number(process.env.LMDPT_PURGE_LOCK_INTERVAL_MS);
  return Number.isFinite(n) && n > 0 ? n : 200;
}

const LOCKED_EXIT = 75;

function printCounts(apply, counts) {
  console.log(apply ? 'Migration appliquée.' : 'Dry-run — aucune écriture.');
  console.log(`Commentaires avec teinte stockée : ${counts.commentsStripped}`);
  console.log(`Entrées recolor (slug) : ${counts.recolorSlugsStripped}`);
  console.log(`Comptes avec teinte préférée : ${counts.preferredHueStripped}`);
  if (!apply) {
    console.log('Relancer avec --apply pour écrire (sauvegarde .bak- horodatée, mode 600).');
  }
}

export async function main(argv = process.argv.slice(2)) {
  const apply = argv.includes('--apply');
  const dataDir = commentsDataDir();
  if (!apply) {
    const counts = runMigrateStripStoredHue({ dataDir, apply: false, now: new Date() });
    printCounts(false, counts);
    return counts;
  }

  const handle = await waitForDataLock(dataDir, {
    owner: 'migrate-strip-hue',
    timeoutMs: lockTimeoutMs(),
    intervalMs: lockIntervalMs(),
  });
  if (!handle) {
    console.error('Verrou d’écriture occupé — réessayez plus tard.');
    process.exitCode = LOCKED_EXIT;
    return null;
  }
  try {
    const counts = runMigrateStripStoredHue({ dataDir, apply: true, now: new Date() });
    printCounts(true, counts);
    return counts;
  } catch (e) {
    if (isLockedError(e)) {
      console.error('Verrou d’écriture occupé — réessayez plus tard.');
      process.exitCode = LOCKED_EXIT;
      return null;
    }
    throw e;
  } finally {
    releaseDataLock(handle);
  }
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(resolve(entry)).href;
}

if (isDirectRun()) {
  main()
    .then(() => {
      if (process.exitCode === LOCKED_EXIT) process.exit(LOCKED_EXIT);
    })
    .catch((e) => {
      if (isLockedError(e)) {
        console.error('Verrou d’écriture occupé — réessayez plus tard.');
        process.exit(LOCKED_EXIT);
      }
      console.error(e);
      process.exit(1);
    });
}
