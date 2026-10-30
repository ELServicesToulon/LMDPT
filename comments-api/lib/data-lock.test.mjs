/**
 * Verrou d’écriture — données fictives, mkdtemp, jamais comments-api/data.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  acquireDataLock,
  dataLockPath,
  LOCKED_CODE,
  releaseDataLock,
  waitForDataLock,
  withDataLockSync,
} from './data-lock.mjs';

function tmpDir() {
  return mkdtempSync(join(tmpdir(), 'lmdpt-lock-'));
}

function deadPid() {
  const r = spawnSync(process.execPath, ['-e', 'process.exit(0)']);
  assert.ok(r.pid > 0);
  return r.pid;
}

describe('acquireDataLock / releaseDataLock', () => {
  it('exclusivité entre owners et libération', () => {
    const dataDir = tmpDir();
    try {
      const a = acquireDataLock(dataDir, { owner: 'api' });
      assert.ok(a);
      assert.equal(a.pid, process.pid);
      assert.equal(a.owner, 'api');
      assert.equal(acquireDataLock(dataDir, { owner: 'retention-purge' }), null);
      releaseDataLock(a);
      assert.equal(existsSync(dataLockPath(dataDir)), false);
      const b = acquireDataLock(dataDir, { owner: 'retention-purge' });
      assert.ok(b);
      releaseDataLock(b);
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it('verrou périmé par âge : remplacé', () => {
    const dataDir = tmpDir();
    try {
      const lockPath = dataLockPath(dataDir);
      writeFileSync(
        lockPath,
        JSON.stringify({
          pid: process.pid,
          owner: 'old',
          at: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
        }) + '\n',
      );
      const h = acquireDataLock(dataDir, { owner: 'api', staleMs: 10 * 60 * 1000 });
      assert.ok(h);
      const stored = JSON.parse(readFileSync(lockPath, 'utf8'));
      assert.equal(stored.owner, 'api');
      releaseDataLock(h);
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it('pid mort : remplacé même si récent', () => {
    const dataDir = tmpDir();
    try {
      const lockPath = dataLockPath(dataDir);
      writeFileSync(
        lockPath,
        JSON.stringify({
          pid: deadPid(),
          owner: 'ghost',
          at: new Date().toISOString(),
        }) + '\n',
      );
      const h = acquireDataLock(dataDir, { owner: 'api' });
      assert.ok(h);
      assert.equal(h.owner, 'api');
      releaseDataLock(h);
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it('release n’efface pas le verrou d’un autre', () => {
    const dataDir = tmpDir();
    try {
      const h = acquireDataLock(dataDir, { owner: 'api' });
      assert.ok(h);
      const other = {
        pid: h.pid,
        owner: 'autre',
        at: new Date().toISOString(),
      };
      writeFileSync(h.path, JSON.stringify(other) + '\n');
      releaseDataLock(h);
      assert.equal(existsSync(h.path), true);
      const stored = JSON.parse(readFileSync(h.path, 'utf8'));
      assert.equal(stored.owner, 'autre');
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});

describe('withDataLockSync / waitForDataLock', () => {
  it('withDataLockSync lève LOCKED si occupé', () => {
    const dataDir = tmpDir();
    try {
      const h = acquireDataLock(dataDir, { owner: 'other' });
      assert.throws(
        () => withDataLockSync(dataDir, 'api', () => 'nope'),
        (err) => err.code === LOCKED_CODE,
      );
      releaseDataLock(h);
      assert.equal(withDataLockSync(dataDir, 'api', () => 42), 42);
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it('waitForDataLock rend null si timeout', async () => {
    const dataDir = tmpDir();
    try {
      const h = acquireDataLock(dataDir, { owner: 'other' });
      const got = await waitForDataLock(dataDir, {
        owner: 'api',
        timeoutMs: 80,
        intervalMs: 20,
      });
      assert.equal(got, null);
      releaseDataLock(h);
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});
