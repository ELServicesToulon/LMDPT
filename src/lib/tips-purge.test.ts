import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import { spawn, type ChildProcess } from 'node:child_process';
import { readFileSync as readSource } from 'node:fs';
import {
  anonymizePublishedTip,
  deleteTipById,
  purgeProcessedTips,
  tipHasIdentifyingData,
  writeJsonAtomic,
} from '../../comments-api/lib/tips-purge.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const MOD_PAGE = readSource(join(ROOT, 'src/pages/moderation/index.astro'), 'utf8');
const TEST_TOKEN = 'lmdpt-test-modo-purge-ok-4c91';

const PUBLISHED_BODY = 'Texte fictif publié qui doit rester visible après anonymisation.';

function sampleTips() {
  return {
    version: 1,
    tips: [
      {
        id: 'tip-rejected-1',
        type: 'suggestion',
        title: 'Proposition refusee de test',
        body: 'Texte fictif d une contribution refusee pour les tests unitaires.',
        displayName: 'Lecteur Test',
        contactEmail: 'refusee@example.test',
        authorKeyHash: 'abc123deadbeef',
        status: 'rejected',
        createdAt: '2026-01-01T00:00:00.000Z',
        publishedAt: null,
        moderation: { history: [] },
      },
      {
        id: 'tip-published-1',
        type: 'alerte',
        title: 'Proposition publiee de test',
        body: PUBLISHED_BODY,
        sourceUrl: 'https://example.test/source',
        displayName: 'Lectrice Test',
        contactEmail: 'validee@example.test',
        authorKeyHash: 'fff111aaa222',
        ip: '192.0.2.1',
        userAgent: 'UnitTest/1.0',
        status: 'published',
        createdAt: '2026-01-01T00:00:00.000Z',
        publishedAt: '2026-01-03T00:00:00.000Z',
        moderation: { history: [] },
      },
      {
        id: 'tip-pending-1',
        type: 'suggestion',
        title: 'Proposition en attente de test',
        body: 'Texte fictif encore en attente, a laisser intact.',
        displayName: 'En Attente',
        contactEmail: 'attente@example.test',
        authorKeyHash: 'pend000aaaa1111',
        status: 'pending',
        createdAt: '2026-01-04T00:00:00.000Z',
        publishedAt: null,
        moderation: { history: [] },
      },
    ],
  };
}

describe('purgeProcessedTips', () => {
  it('supprime les rejected, anonymise les published et laisse les pending', () => {
    const db = sampleTips();
    const publishedBody = db.tips[1].body;
    const result = purgeProcessedTips(db, {
      at: '2026-02-01T12:00:00.000Z',
      by: 'modo-1',
      role: 'modo',
    });
    expect(result).toEqual({ deletedRejected: 1, anonymizedPublished: 1 });
    expect(db.tips.map((t: { id: string }) => t.id)).toEqual(['tip-published-1', 'tip-pending-1']);

    const published = db.tips.find((t: { id: string }) => t.id === 'tip-published-1');
    expect(published.body).toBe(publishedBody);
    expect(published.title).toBe('Proposition publiee de test');
    expect(published.displayName).toBe('Lectrice Test');
    expect(published.sourceUrl).toBe('https://example.test/source');
    expect(published.status).toBe('published');
    expect(published.contactEmail).toBeUndefined();
    expect(published.authorKeyHash).toBeUndefined();
    expect(published.ip).toBeUndefined();
    expect(published.userAgent).toBeUndefined();
    expect(tipHasIdentifyingData(published)).toBe(false);
    expect(published.moderation.history).toContainEqual({
      at: '2026-02-01T12:00:00.000Z',
      by: 'modo-1',
      role: 'modo',
      action: 'purge',
    });

    const pending = db.tips.find((t: { id: string }) => t.id === 'tip-pending-1');
    expect(pending).toEqual(sampleTips().tips[2]);

    expect(db.purgeHistory).toEqual([
      {
        at: '2026-02-01T12:00:00.000Z',
        by: 'modo-1',
        role: 'modo',
        action: 'tips-purge',
        deletedRejected: 1,
        anonymizedPublished: 1,
      },
    ]);
  });

  it('est idempotente : un second appel ne change rien', () => {
    const db = sampleTips();
    purgeProcessedTips(db, { at: '2026-02-01T12:00:00.000Z', by: 'modo-1', role: 'modo' });
    const snapshot = structuredClone(db);
    const second = purgeProcessedTips(db, {
      at: '2026-02-01T13:00:00.000Z',
      by: 'modo-1',
      role: 'modo',
    });
    expect(second).toEqual({ deletedRejected: 0, anonymizedPublished: 0 });
    expect(db).toEqual(snapshot);
  });

  it('écrit le JSON de façon atomique (fichier temporaire puis rename)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'lmdpt-purge-atomic-'));
    const target = join(dir, 'tips.json');
    writeJsonAtomic(target, { ok: true, n: 2 });
    expect(JSON.parse(readFileSync(target, 'utf8'))).toEqual({ ok: true, n: 2 });
    const leftovers = ['tips.json.tmp', 'tips.json.tmp-1'];
    expect(leftovers.every((name) => !existsSync(join(dir, name)))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('anonymizePublishedTip', () => {
  it('ne touche pas un tip déjà sans donnée d’identification', () => {
    const tip = { id: 'x', status: 'published', body: 'ok', displayName: 'A' };
    const { changed, tip: next } = anonymizePublishedTip(tip);
    expect(changed).toBe(false);
    expect(next).toEqual(tip);
  });
});

describe('deleteTipById', () => {
  it('supprime une contribution pending, published ou rejected', () => {
    for (const id of ['tip-pending-1', 'tip-published-1', 'tip-rejected-1']) {
      const db = sampleTips();
      const before = db.tips.length;
      const result = deleteTipById(db, id, {
        at: '2026-03-01T10:00:00.000Z',
        by: 'modo-1',
        role: 'modo',
      });
      expect(result).toEqual({ found: true, deleted: true });
      expect(db.tips).toHaveLength(before - 1);
      expect(db.tips.some((t: { id: string }) => t.id === id)).toBe(false);
      expect(db.deleteHistory).toEqual([
        {
          at: '2026-03-01T10:00:00.000Z',
          by: 'modo-1',
          role: 'modo',
          action: 'tips-delete',
          tipId: id,
        },
      ]);
      const blob = JSON.stringify(db.deleteHistory);
      expect(blob).not.toMatch(/@example\.test/);
      expect(blob).not.toMatch(/contactEmail|authorKeyHash/);
    }
  });

  it('signale un tip absent sans modifier le fichier', () => {
    const db = sampleTips();
    const snapshot = structuredClone(db);
    expect(deleteTipById(db, 'inconnu', { at: '2026-03-01T10:00:00.000Z', by: 'modo-1', role: 'modo' })).toEqual({
      found: false,
      deleted: false,
    });
    expect(db).toEqual(snapshot);
  });
});

describe('page /moderation/', () => {
  it('propose le bouton de purge avec confirmation et affichage des compteurs', () => {
    expect(MOD_PAGE).toContain('Purger les contributions traitées');
    expect(MOD_PAGE).toContain("window.confirm(");
    expect(MOD_PAGE).toContain('/mod/tips-purge');
    expect(MOD_PAGE).toContain('deletedRejected');
    expect(MOD_PAGE).toContain('anonymizedPublished');
    expect(MOD_PAGE).toContain('mod-purge-result');
  });

  it('propose un bouton Supprimer par contribution, file et listes publiées/refusées, avec confirmation', () => {
    expect(MOD_PAGE).toContain('>Supprimer</button>');
    expect(MOD_PAGE).toContain('/mod/tips-delete');
    expect(MOD_PAGE).toContain('data-tip-delete');
    expect(MOD_PAGE).toContain('mod-tips-published');
    expect(MOD_PAGE).toContain('mod-tips-rejected');
    expect(MOD_PAGE).toContain('Supprimer cette contribution en entier');
  });
});

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      server.close((err) => (err ? reject(err) : resolve(port)));
    });
    server.on('error', reject);
  });
}

async function startCommentsApi() {
  const dataDir = mkdtempSync(join(tmpdir(), 'lmdpt-purge-http-'));
  writeFileSync(join(dataDir, 'comments.json'), JSON.stringify({ version: 1, comments: [] }, null, 2));
  writeFileSync(join(dataDir, 'tips.json'), JSON.stringify(sampleTips(), null, 2));
  writeFileSync(
    join(dataDir, 'moderators.json'),
    JSON.stringify({ version: 1, accounts: [] }, null, 2),
  );
  const port = await freePort();
  const child: ChildProcess = spawn('node', [join(ROOT, 'comments-api/server.mjs')], {
    cwd: join(ROOT, 'comments-api'),
    env: {
      ...process.env,
      LMDPT_COMMENTS_DATA: dataDir,
      LMDPT_COMMENTS_PORT: String(port),
      LMDPT_COMMENTS_HOST: '127.0.0.1',
      LMDPT_COMMENTS_HEURISTIC_ONLY: '1',
      LMDPT_AUTH_ENABLED: '0',
      LMDPT_AUTH_REQUIRED: '0',
      LMDPT_MOD_TOKEN_MODO: TEST_TOKEN,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const logs: string[] = [];
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`comments-api n’a pas démarré: ${logs.join('')}`));
    }, 8000);
    const onData = (buf: Buffer) => {
      const text = buf.toString('utf8');
      logs.push(text);
      if (text.includes('listening on')) {
        clearTimeout(timer);
        resolve();
      }
    };
    child.stdout?.on('data', onData);
    child.stderr?.on('data', onData);
    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`comments-api exit ${code}: ${logs.join('')}`));
    });
  });
  return { child, port, dataDir };
}

function stopCommentsApi(child: ChildProcess, dataDir: string) {
  if (child.pid) {
    try {
      process.kill(child.pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  }
  rmSync(dataDir, { recursive: true, force: true });
}

describe('POST /api/comments/mod/tips-purge', () => {
  const running: { child?: ChildProcess; dataDir?: string } = {};

  afterAll(() => {
    if (running.child && running.dataDir) stopCommentsApi(running.child, running.dataDir);
  });

  it('refuse l’accès sans jeton et applique la purge avec un jeton modo', async () => {
    const started = await startCommentsApi();
    running.child = started.child;
    running.dataDir = started.dataDir;
    const base = `http://127.0.0.1:${started.port}`;

    const denied = await fetch(`${base}/api/comments/mod/tips-purge`, { method: 'POST' });
    expect(denied.status).toBe(403);
    const deniedBody = await denied.json();
    expect(deniedBody.error).toBeTruthy();

    const first = await fetch(`${base}/api/comments/mod/tips-purge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Mod-Token': TEST_TOKEN },
    });
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ deletedRejected: 1, anonymizedPublished: 1 });

    const stored = JSON.parse(readFileSync(join(started.dataDir, 'tips.json'), 'utf8'));
    expect(stored.tips.map((t: { id: string }) => t.id)).toEqual([
      'tip-published-1',
      'tip-pending-1',
    ]);
    expect(stored.tips[0].body).toBe(PUBLISHED_BODY);
    expect(stored.tips[0].contactEmail).toBeUndefined();
    expect(stored.tips[1].contactEmail).toBe('attente@example.test');

    const second = await fetch(`${base}/api/comments/mod/tips-purge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Mod-Token': TEST_TOKEN },
    });
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ deletedRejected: 0, anonymizedPublished: 0 });

    stopCommentsApi(started.child, started.dataDir);
    running.child = undefined;
    running.dataDir = undefined;
  }, 15000);
});

describe('POST /api/comments/mod/tips-delete', () => {
  const running: { child?: ChildProcess; dataDir?: string } = {};

  afterAll(() => {
    if (running.child && running.dataDir) stopCommentsApi(running.child, running.dataDir);
  });

  it('refuse sans jeton, supprime pending/published/rejected, puis 404 si absent', async () => {
    const started = await startCommentsApi();
    running.child = started.child;
    running.dataDir = started.dataDir;
    const base = `http://127.0.0.1:${started.port}`;
    const headers = { 'Content-Type': 'application/json', 'X-Mod-Token': TEST_TOKEN };

    const denied = await fetch(`${base}/api/comments/mod/tips-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipId: 'tip-pending-1' }),
    });
    expect(denied.status).toBe(403);
    expect((await denied.json()).error).toBeTruthy();

    for (const tipId of ['tip-pending-1', 'tip-published-1', 'tip-rejected-1']) {
      const res = await fetch(`${base}/api/comments/mod/tips-delete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tipId }),
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true, deleted: true, tipId });
    }

    const stored = JSON.parse(readFileSync(join(started.dataDir, 'tips.json'), 'utf8'));
    expect(stored.tips).toEqual([]);
    expect(stored.deleteHistory).toHaveLength(3);
    for (const entry of stored.deleteHistory) {
      expect(entry).toMatchObject({ action: 'tips-delete', by: 'modo-1', role: 'modo' });
      expect(entry.tipId).toMatch(/^tip-/);
      expect(entry).not.toHaveProperty('contactEmail');
      expect(JSON.stringify(entry)).not.toMatch(/@example\.test/);
    }

    const again = await fetch(`${base}/api/comments/mod/tips-delete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tipId: 'tip-pending-1' }),
    });
    expect(again.status).toBe(404);

    const missing = await fetch(`${base}/api/comments/mod/tips-delete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tipId: 'inconnu' }),
    });
    expect(missing.status).toBe(404);
    expect((await missing.json()).error).toBe('Proposition introuvable');

    const after = JSON.parse(readFileSync(join(started.dataDir, 'tips.json'), 'utf8'));
    expect(after.deleteHistory).toHaveLength(3);

    stopCommentsApi(started.child, started.dataDir);
    running.child = undefined;
    running.dataDir = undefined;
  }, 15000);
});
