#!/usr/bin/env node
/**
 * Purge de conservation LMDPT. Dry-run par défaut (compteurs seulement).
 * --apply pour écrire. Aucune routine n’est activée.
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runRetention } from '../lib/retention.mjs';
import {
  isLockedError,
  releaseDataLock,
  waitForDataLock,
} from '../lib/data-lock.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCKED_EXIT = 75;

export function commentsDataDir() {
  return process.env.LMDPT_COMMENTS_DATA || join(__dirname, '..', 'data');
}

function lockTimeoutMs() {
  const n = Number(process.env.LMDPT_PURGE_LOCK_TIMEOUT_MS);
  return Number.isFinite(n) && n >= 0 ? n : 60_000;
}

function lockIntervalMs() {
  const n = Number(process.env.LMDPT_PURGE_LOCK_INTERVAL_MS);
  return Number.isFinite(n) && n > 0 ? n : 200;
}

function printCounts(apply, counts) {
  console.log(apply ? 'Purge appliquée.' : 'Dry-run — aucune écriture.');
  console.log(`Propositions supprimées : ${counts.tipsDeleted}`);
  console.log(`E-mails de propositions effacés : ${counts.tipEmailsCleared}`);
  console.log(`Commentaires supprimés : ${counts.commentsDeleted}`);
  console.log(`Commentaires dissociés (userId) : ${counts.commentsUnlinked}`);
  console.log(`Comptes supprimés : ${counts.accountsDeleted}`);
  console.log(`Sessions supprimées : ${counts.sessionsDeleted}`);
  console.log(`Liens magiques supprimés : ${counts.magicDeleted}`);
  if (!apply) {
    console.log('Relancer avec --apply pour écrire.');
  }
}

export async function main(argv = process.argv.slice(2)) {
  const apply = argv.includes('--apply');
  const dataDir = commentsDataDir();
  if (!apply) {
    const counts = runRetention({ dataDir, now: new Date(), apply: false });
    printCounts(false, counts);
    return counts;
  }

  const handle = await waitForDataLock(dataDir, {
    owner: 'retention-purge',
    timeoutMs: lockTimeoutMs(),
    intervalMs: lockIntervalMs(),
  });
  if (!handle) {
    console.error('Verrou d’écriture occupé — réessayez plus tard.');
    process.exitCode = LOCKED_EXIT;
    return null;
  }
  try {
    const counts = runRetention({ dataDir, now: new Date(), apply: true });
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
