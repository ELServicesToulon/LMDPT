/**
 * Serveur commentaires — verrou 503 + fil public sans champs internes.
 * Données fictives, mkdtemp, jamais comments-api/data.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { acquireDataLock, LOCKED_MESSAGE, releaseDataLock } from './data-lock.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER = join(__dirname, '..', 'server.mjs');

function freePort() {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address();
      s.close((err) => (err ? reject(err) : resolve(port)));
    });
    s.on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitHealth(base, timeoutMs = 10000) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${base}/health`);
      if (res.ok) return;
      lastErr = new Error(`health ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    await sleep(40);
  }
  throw lastErr || new Error('health timeout');
}

describe('server.mjs verrou et fil public', { timeout: 20000 }, () => {
  it('POST tips 503 + Retry-After sous verrou, puis plus 503 ; GET thread sans champs internes', async () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'lmdpt-srv-lock-'));
    const port = await freePort();
    const base = `http://127.0.0.1:${port}`;
    writeFileSync(
      join(dataDir, 'comments.json'),
      JSON.stringify(
        {
          version: 1,
          comments: [
            {
              id: 'c-secret',
              threadId: 'x',
              displayName: 'Alice',
              userId: 'usr_secret_fictif',
              authorKeyHash: 'hashauteurfictif0001',
              raw: 'texte brut secret fictif',
              body: 'Texte publié fictif pour le test de fil public.',
              status: 'published',
              publishedAt: '2026-10-01T00:00:00.000Z',
              createdAt: '2026-10-01T00:00:00.000Z',
              moderation: { history: [] },
            },
            {
              id: 'c-hue',
              threadId: 'x',
              displayName: 'Bob Fictif',
              userId: 'usr_hue_fictif',
              authorKeyHash: 'hashauteurfictif0002',
              raw: 'Mélenchon propose le SMIC à 1600',
              body: 'Mélenchon propose le SMIC à 1600',
              status: 'published',
              publishedAt: '2026-10-02T00:00:00.000Z',
              createdAt: '2026-10-02T00:00:00.000Z',
              moderation: { history: [] },
            },
          ],
        },
        null,
        2,
      ) + '\n',
    );
    writeFileSync(join(dataDir, 'tips.json'), '{"version":1,"tips":[]}\n');

    const child = spawn(process.execPath, [SERVER], {
      env: {
        ...process.env,
        LMDPT_COMMENTS_DATA: dataDir,
        LMDPT_COMMENTS_PORT: String(port),
        LMDPT_COMMENTS_HOST: '127.0.0.1',
        LMDPT_COMMENTS_HEURISTIC_ONLY: '1',
        LMDPT_AUTH_ENABLED: '0',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (c) => {
      stderr += c;
    });

    const held = acquireDataLock(dataDir, { owner: 'other' });
    try {
      await waitHealth(base);

      const locked = await fetch(`${base}/api/comments/tips/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggestion',
          title: 'Titre fictif',
          body: 'Texte de proposition fictif assez long pour la validation.',
          displayName: 'Testeur',
        }),
      });
      assert.equal(locked.status, 503);
      assert.equal(locked.headers.get('retry-after'), '30');
      const lockedBody = await locked.json();
      assert.equal(lockedBody.error, LOCKED_MESSAGE);

      releaseDataLock(held);

      const opened = await fetch(`${base}/api/comments/tips/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggestion',
          title: 'Titre fictif',
          body: 'Texte de proposition fictif assez long pour la validation.',
          displayName: 'Testeur',
        }),
      });
      assert.notEqual(opened.status, 503);
      assert.equal(opened.status, 201);

      const threadRes = await fetch(`${base}/api/comments/thread/x`);
      assert.equal(threadRes.status, 200);
      const rawText = await threadRes.text();
      assert.equal(rawText.includes('usr_secret_fictif'), false);
      assert.equal(rawText.includes('hashauteurfictif0001'), false);
      assert.equal(rawText.includes('texte brut secret fictif'), false);
      const thread = JSON.parse(rawText);
      assert.equal(thread.comments.length, 2);
      assert.equal('userId' in thread.comments[0], false);
      assert.equal('authorKeyHash' in thread.comments[0], false);
      assert.equal('raw' in thread.comments[0], false);
      assert.equal(thread.comments[0].body, 'Texte publié fictif pour le test de fil public.');
      const hueComment = thread.comments.find((c) => c.id === 'c-hue');
      assert.equal(hueComment.politicalHue.slug, 'melenchon');
      assert.equal(hueComment.politicalHue.label, 'Gauche radicale');
      assert.equal('rationale' in hueComment.politicalHue, false);
      assert.equal(rawText.includes('Mélenchon / LFI'), false);
      assert.equal(rawText.includes('Attal / Renaissance'), false);

      const huesRes = await fetch(`${base}/api/comments/hues`);
      assert.equal(huesRes.status, 200);
      const huesBody = await huesRes.json();
      const attal = huesBody.hues.find((h) => h.slug === 'attal');
      assert.equal(attal.label, 'Centre libéral');
      for (const h of huesBody.hues) {
        assert.equal(String(h.label).includes('Attal'), false);
        assert.equal(String(h.label).includes('Mélenchon'), false);
      }

      const previewRes = await fetch(`${base}/api/comments/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: 'Gabriel Attal réforme l’école publique fictive.' }),
      });
      assert.equal(previewRes.status, 200);
      const preview = await previewRes.json();
      assert.equal(preview.politicalHue.slug, 'attal');
      assert.equal(preview.politicalHue.label, 'Centre libéral');
      assert.equal(String(preview.politicalHue.rationale || '').includes('Attal'), false);
      assert.equal(String(preview.politicalHue.rationale || '').includes('Gabriel'), false);
    } catch (e) {
      e.message = `${e.message}\nstderr: ${stderr}`;
      throw e;
    } finally {
      try {
        releaseDataLock(held);
      } catch {
        /* déjà relâché */
      }
      child.kill('SIGTERM');
      await new Promise((resolve) => {
        const t = setTimeout(() => {
          child.kill('SIGKILL');
          resolve();
        }, 2000);
        child.on('exit', () => {
          clearTimeout(t);
          resolve();
        });
      });
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});
