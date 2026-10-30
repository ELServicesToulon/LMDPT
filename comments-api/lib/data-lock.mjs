/**
 * Verrou d’écriture partagé API / purge — fichier ${dataDir}/.write.lock
 * Exclusif (wx). Un seul détenteur à la fois ; réentrant pour le même owner du process.
 */
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

export const LOCK_FILE_NAME = '.write.lock';
export const LOCKED_CODE = 'LOCKED';
export const LOCKED_MESSAGE =
  'Maintenance des données en cours, réessayez dans un instant.';
export const DEFAULT_STALE_MS = 10 * 60 * 1000;
export const DEFAULT_WAIT_TIMEOUT_MS = 60 * 1000;
export const DEFAULT_WAIT_INTERVAL_MS = 200;

/** @type {Map<string, { count: number, owner: string, handle: object }>} */
const held = new Map();

export function dataLockPath(dataDir) {
  return join(dataDir, LOCK_FILE_NAME);
}

export function lockedError(message = LOCKED_MESSAGE) {
  const err = new Error(message);
  err.code = LOCKED_CODE;
  err.status = 503;
  return err;
}

export function isLockedError(err) {
  return Boolean(err) && err.code === LOCKED_CODE;
}

function readLockInfo(lockPath) {
  try {
    const raw = readFileSync(lockPath, 'utf8');
    const info = JSON.parse(raw);
    if (!info || typeof info !== 'object') return null;
    return info;
  } catch {
    return null;
  }
}

function isPidAlive(pid) {
  const n = Number(pid);
  if (!Number.isInteger(n) || n <= 0) return false;
  try {
    process.kill(n, 0);
    return true;
  } catch (e) {
    if (e && e.code === 'ESRCH') return false;
    return true;
  }
}

function isStale(info, staleMs) {
  if (!info) return true;
  const atMs = Date.parse(info.at);
  if (!Number.isFinite(atMs) || Date.now() - atMs > staleMs) return true;
  if (!isPidAlive(info.pid)) return true;
  return false;
}

function writeLockFile(lockPath, payload) {
  const fd = openSync(lockPath, 'wx');
  try {
    writeFileSync(fd, JSON.stringify(payload) + '\n');
  } finally {
    closeSync(fd);
  }
}

function remember(lockPath, owner, handle) {
  held.set(lockPath, { count: 1, owner, handle });
  return handle;
}

/**
 * @param {string} dataDir
 * @param {{ owner?: string, staleMs?: number }} [opts]
 * @returns {object | null} handle ou null si occupé
 */
export function acquireDataLock(dataDir, { owner = 'api', staleMs = DEFAULT_STALE_MS } = {}) {
  if (!dataDir) throw new Error('dataDir requis');
  mkdirSync(dataDir, { recursive: true });
  const lockPath = dataLockPath(dataDir);
  const rec = held.get(lockPath);
  if (rec) {
    if (rec.owner !== owner) return null;
    rec.count += 1;
    return rec.handle;
  }

  const payload = {
    pid: process.pid,
    owner,
    at: new Date().toISOString(),
  };

  try {
    writeLockFile(lockPath, payload);
    return remember(lockPath, owner, { path: lockPath, ...payload });
  } catch (e) {
    if (e.code !== 'EEXIST') throw e;
  }

  const info = readLockInfo(lockPath);
  if (info && info.pid === process.pid && info.owner === owner) {
    const handle = { path: lockPath, pid: info.pid, owner: info.owner, at: info.at };
    const existing = held.get(lockPath);
    if (existing) {
      existing.count += 1;
      return existing.handle;
    }
    return remember(lockPath, owner, handle);
  }
  if (!isStale(info, staleMs)) return null;

  try {
    unlinkSync(lockPath);
  } catch {
    return null;
  }
  try {
    writeLockFile(lockPath, payload);
    return remember(lockPath, owner, { path: lockPath, ...payload });
  } catch (e2) {
    if (e2.code === 'EEXIST') return null;
    throw e2;
  }
}

/**
 * Ne supprime le fichier que si le contenu appartient encore à ce handle.
 * @param {object | null | undefined} handle
 */
export function releaseDataLock(handle) {
  if (!handle || !handle.path) return;
  const rec = held.get(handle.path);
  if (rec) {
    rec.count -= 1;
    if (rec.count > 0) return;
    held.delete(handle.path);
  }
  let current;
  try {
    current = JSON.parse(readFileSync(handle.path, 'utf8'));
  } catch {
    return;
  }
  if (
    current.pid !== handle.pid ||
    current.owner !== handle.owner ||
    current.at !== handle.at
  ) {
    return;
  }
  try {
    unlinkSync(handle.path);
  } catch {
    /* déjà retiré */
  }
}

/**
 * @param {string} dataDir
 * @param {string} owner
 * @param {() => *} fn
 */
export function withDataLockSync(dataDir, owner, fn) {
  const handle = acquireDataLock(dataDir, { owner });
  if (!handle) throw lockedError();
  try {
    return fn();
  } finally {
    releaseDataLock(handle);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {string} dataDir
 * @param {{ owner?: string, timeoutMs?: number, intervalMs?: number, staleMs?: number }} [opts]
 * @returns {Promise<object | null>}
 */
export async function waitForDataLock(
  dataDir,
  {
    owner = 'api',
    timeoutMs = DEFAULT_WAIT_TIMEOUT_MS,
    intervalMs = DEFAULT_WAIT_INTERVAL_MS,
    staleMs = DEFAULT_STALE_MS,
  } = {},
) {
  const deadline = Date.now() + Math.max(0, Number(timeoutMs) || 0);
  const step = Math.max(10, Number(intervalMs) || DEFAULT_WAIT_INTERVAL_MS);
  while (true) {
    const handle = acquireDataLock(dataDir, { owner, staleMs });
    if (handle) return handle;
    if (Date.now() >= deadline) return null;
    await sleep(step);
  }
}

export function lockFileExists(dataDir) {
  return existsSync(dataLockPath(dataDir));
}
