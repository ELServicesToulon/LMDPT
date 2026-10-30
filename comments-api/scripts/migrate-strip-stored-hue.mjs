#!/usr/bin/env node
/**
 * Retire la teinte stockée (commentaires + comptes). Dry-run par défaut.
 * N’écrit que si --apply ; sauvegarde horodatée mode 600 avant écriture.
 */
import { chmodSync, copyFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { saveJsonAtomic } from '../lib/auth/store.mjs';

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
}

export function main(argv = process.argv.slice(2)) {
  const apply = argv.includes('--apply');
  const dataDir = commentsDataDir();
  const counts = runMigrateStripStoredHue({ dataDir, apply, now: new Date() });
  console.log(apply ? 'Migration appliquée.' : 'Dry-run — aucune écriture.');
  console.log(`Commentaires avec teinte stockée : ${counts.commentsStripped}`);
  console.log(`Entrées recolor (slug) : ${counts.recolorSlugsStripped}`);
  console.log(`Comptes avec teinte préférée : ${counts.preferredHueStripped}`);
  if (!apply) {
    console.log('Relancer avec --apply pour écrire (sauvegarde .bak- horodatée, mode 600).');
  }
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(resolve(entry)).href;
}

if (isDirectRun()) {
  main();
}
