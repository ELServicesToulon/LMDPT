#!/usr/bin/env node
/**
 * Purge de conservation LMDPT. Dry-run par défaut (compteurs seulement).
 * --apply pour écrire. Aucune routine n’est activée.
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runRetention } from '../lib/retention.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function commentsDataDir() {
  return process.env.LMDPT_COMMENTS_DATA || join(__dirname, '..', 'data');
}

export function main(argv = process.argv.slice(2)) {
  const apply = argv.includes('--apply');
  const dataDir = commentsDataDir();
  const counts = runRetention({ dataDir, now: new Date(), apply });
  console.log(apply ? 'Purge appliquée.' : 'Dry-run — aucune écriture.');
  console.log(`Propositions supprimées : ${counts.tipsDeleted}`);
  console.log(`E-mails de propositions effacés : ${counts.tipEmailsCleared}`);
  console.log(`Commentaires supprimés : ${counts.commentsDeleted}`);
  console.log(`Commentaires dissociés (userId) : ${counts.commentsUnlinked}`);
  console.log(`Comptes supprimés : ${counts.accountsDeleted}`);
  console.log(`Sessions supprimées : ${counts.sessionsDeleted}`);
  if (!apply) {
    console.log('Relancer avec --apply pour écrire.');
  }
  return counts;
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(resolve(entry)).href;
}

if (isDirectRun()) {
  main();
}
