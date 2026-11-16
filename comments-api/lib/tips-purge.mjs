/**
 * Purge RGPD des contributions lecteurs (tips.json).
 * Une contribution refusée est supprimée en entier.
 * Une contribution publiée garde le texte et les champs publics ;
 * les données d’identification de l’auteur sont effacées.
 * Les contributions en attente restent intactes.
 * La suppression unitaire (droit d’effacement) retire un tip entier, quel que soit son statut.
 */
import { writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';

/** Champs d’identification éventuellement présents sur un tip (sanitizeTipInput + objet stocké). */
export const TIP_IDENTIFYING_FIELDS = Object.freeze([
  'contactEmail',
  'authorKeyHash',
  'email',
  'name',
  'ip',
  'ipAddress',
  'remoteAddress',
  'userAgent',
  'user-agent',
  'ua',
]);

function hasIdentifyingValue(value) {
  if (value == null) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
}

export function tipHasIdentifyingData(tip) {
  if (!tip || typeof tip !== 'object') return false;
  return TIP_IDENTIFYING_FIELDS.some((field) => hasIdentifyingValue(tip[field]));
}

export function anonymizePublishedTip(tip) {
  const next = { ...tip };
  let changed = false;
  for (const field of TIP_IDENTIFYING_FIELDS) {
    if (hasIdentifyingValue(next[field])) {
      delete next[field];
      changed = true;
    }
  }
  return { tip: next, changed };
}

/**
 * Purge idempotente. Mutate `db.tips` et journalise un compteur sans donnée perso d’auteur.
 * @returns {{ deletedRejected: number, anonymizedPublished: number }}
 */
export function purgeProcessedTips(db, { at, by, role } = {}) {
  if (!db || !Array.isArray(db.tips)) {
    return { deletedRejected: 0, anonymizedPublished: 0 };
  }
  const stamp = at || new Date().toISOString();
  let deletedRejected = 0;
  let anonymizedPublished = 0;
  const tips = [];
  for (const tip of db.tips) {
    if (tip.status === 'rejected') {
      deletedRejected += 1;
      continue;
    }
    if (tip.status === 'published') {
      const { tip: cleaned, changed } = anonymizePublishedTip(tip);
      if (changed) {
        anonymizedPublished += 1;
        const history = Array.isArray(cleaned.moderation?.history)
          ? cleaned.moderation.history
          : [];
        cleaned.moderation = {
          ...(cleaned.moderation || {}),
          history: [
            ...history,
            { at: stamp, by: by || null, role: role || null, action: 'purge' },
          ],
        };
        tips.push(cleaned);
      } else {
        tips.push(tip);
      }
      continue;
    }
    tips.push(tip);
  }
  db.tips = tips;
  if (deletedRejected || anonymizedPublished) {
    db.purgeHistory = Array.isArray(db.purgeHistory) ? db.purgeHistory : [];
    db.purgeHistory.push({
      at: stamp,
      by: by || null,
      role: role || null,
      action: 'tips-purge',
      deletedRejected,
      anonymizedPublished,
    });
  }
  return { deletedRejected, anonymizedPublished };
}

/**
 * Suppression unitaire d’un tip, quel que soit son statut.
 * Journal : id + date + modérateur, sans donnée perso d’auteur.
 * @returns {{ found: boolean, deleted: boolean }}
 */
export function deleteTipById(db, tipId, { at, by, role } = {}) {
  const id = String(tipId || '').trim();
  if (!id || !db || !Array.isArray(db.tips)) {
    return { found: false, deleted: false };
  }
  const idx = db.tips.findIndex((tip) => tip && tip.id === id);
  if (idx === -1) {
    return { found: false, deleted: false };
  }
  db.tips.splice(idx, 1);
  db.deleteHistory = Array.isArray(db.deleteHistory) ? db.deleteHistory : [];
  db.deleteHistory.push({
    at: at || new Date().toISOString(),
    by: by || null,
    role: role || null,
    action: 'tips-delete',
    tipId: id,
  });
  return { found: true, deleted: true };
}

export function writeJsonAtomic(filePath, data) {
  const tmpPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(tmpPath, JSON.stringify(data, null, 2));
    renameSync(tmpPath, filePath);
  } catch (err) {
    try {
      unlinkSync(tmpPath);
    } catch {
      /* ignore */
    }
    throw err;
  }
}
