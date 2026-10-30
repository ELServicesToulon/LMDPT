/**
 * Script purge + unités systemd — mkdtemp, jamais comments-api/data.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { acquireDataLock, releaseDataLock } from '../lib/data-lock.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, 'retention-purge.mjs');
const SERVICE = join(__dirname, '..', 'deploy', 'systemd', 'lmdpt-comments-purge.service');
const TIMER = join(__dirname, '..', 'deploy', 'systemd', 'lmdpt-comments-purge.timer');

function runScript(dataDir, extraEnv = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SCRIPT, '--apply'], {
      env: {
        ...process.env,
        LMDPT_COMMENTS_DATA: dataDir,
        LMDPT_PURGE_LOCK_TIMEOUT_MS: '250',
        LMDPT_PURGE_LOCK_INTERVAL_MS: '40',
        ...extraEnv,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (c) => {
      stdout += c;
    });
    child.stderr.on('data', (c) => {
      stderr += c;
    });
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

describe('retention-purge.mjs --apply', () => {
  it('sort 75 si le verrou est tenu (timeout court)', async () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'lmdpt-purge-lock-'));
    try {
      writeFileSync(join(dataDir, 'tips.json'), '{"version":1,"tips":[]}\n');
      writeFileSync(join(dataDir, 'comments.json'), '{"version":1,"comments":[]}\n');
      writeFileSync(join(dataDir, 'users.json'), '{"version":1,"users":[]}\n');
      writeFileSync(join(dataDir, 'sessions.json'), '{"version":1,"sessions":[]}\n');
      const held = acquireDataLock(dataDir, { owner: 'other' });
      assert.ok(held);
      const result = await runScript(dataDir);
      assert.equal(result.code, 75);
      assert.match(result.stderr, /Verrou/);
      releaseDataLock(held);
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});

describe('unités systemd purge', () => {
  it('service oneshot --apply, sans [Install] ; timer Persistent', () => {
    const service = readFileSync(SERVICE, 'utf8');
    const timer = readFileSync(TIMER, 'utf8');
    assert.match(service, /Type=oneshot/);
    assert.match(service, /retention-purge\.mjs --apply/);
    assert.match(service, /ProtectSystem=strict/);
    assert.equal(/\n\[Install\]/.test(service), false);
    assert.match(timer, /Persistent=true/);
    assert.match(timer, /WantedBy=timers\.target/);
    assert.match(timer, /OnCalendar=\*-\*-\* 04:20:00 Europe\/Paris/);
  });
});
