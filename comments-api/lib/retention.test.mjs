/**
 * Tests conservation — données fictives, mkdtemp, jamais comments-api/data.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ACCOUNTS_INACTIVE_YEARS,
  COMMENTS_RETENTION_YEARS,
  TIPS_EMAIL_MONTHS,
  TIPS_REJECTED_MONTHS,
  DELETED_ACCOUNT_DISPLAY_NAME,
  anonymizeCommentsForUser,
  computeRetention,
  lastTreatmentAt,
  runRetention,
} from './retention.mjs';
import { acquireDataLock, LOCKED_CODE, releaseDataLock } from './data-lock.mjs';

const NOW = new Date('2026-10-30T12:00:00.000Z');

function writeJson(dir, name, data) {
  writeFileSync(join(dir, name), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function readJson(dir, name) {
  return JSON.parse(readFileSync(join(dir, name), 'utf8'));
}

describe('constantes', () => {
  it('exporte les durées demandées', () => {
    assert.equal(TIPS_REJECTED_MONTHS, 12);
    assert.equal(TIPS_EMAIL_MONTHS, 12);
    assert.equal(ACCOUNTS_INACTIVE_YEARS, 3);
    assert.equal(COMMENTS_RETENTION_YEARS, 3);
  });
});

describe('lastTreatmentAt', () => {
  it('prend la dernière entrée d’historique, à défaut createdAt', () => {
    assert.equal(
      lastTreatmentAt({
        createdAt: '2024-01-01T00:00:00.000Z',
        moderation: {
          history: [
            { at: '2024-06-01T00:00:00.000Z', action: 'reject' },
            { at: '2025-10-30T12:00:00.000Z', action: 'hide' },
          ],
        },
      }).toISOString(),
      '2025-10-30T12:00:00.000Z',
    );
    assert.equal(
      lastTreatmentAt({ createdAt: '2025-01-02T00:00:00.000Z', moderation: { history: [] } }).toISOString(),
      '2025-01-02T00:00:00.000Z',
    );
  });
});

describe('computeRetention — seuils juste avant / juste après', () => {
  it('ne mute pas les objets d’entrée', () => {
    const tipsDb = {
      version: 1,
      tips: [
        {
          id: 't-keep',
          status: 'rejected',
          createdAt: '2024-01-01T00:00:00.000Z',
          contactEmail: 'a@example.test',
          moderation: { history: [{ at: '2025-10-30T12:00:00.001Z', action: 'reject' }] },
        },
      ],
    };
    const snapshot = structuredClone(tipsDb);
    computeRetention({ tipsDb }, NOW);
    assert.deepEqual(tipsDb, snapshot);
  });

  it('proposition rejetée : gardée 1 ms avant 12 mois, supprimée 1 ms après', () => {
    const before = computeRetention(
      {
        tipsDb: {
          tips: [
            {
              id: 'tip-before',
              status: 'rejected',
              createdAt: '2024-01-01T00:00:00.000Z',
              moderation: { history: [{ at: '2025-10-30T12:00:00.001Z', action: 'reject' }] },
            },
          ],
        },
      },
      NOW,
    );
    assert.equal(before.counts.tipsDeleted, 0);
    assert.equal(before.tipsDb.tips.length, 1);

    const after = computeRetention(
      {
        tipsDb: {
          tips: [
            {
              id: 'tip-after',
              status: 'rejected',
              createdAt: '2024-01-01T00:00:00.000Z',
              moderation: { history: [{ at: '2025-10-30T11:59:59.999Z', action: 'reject' }] },
            },
          ],
        },
      },
      NOW,
    );
    assert.equal(after.counts.tipsDeleted, 1);
    assert.equal(after.tipsDb.tips.length, 0);
  });

  it('proposition hidden : même règle que rejected ; published et pending gardées', () => {
    const result = computeRetention(
      {
        tipsDb: {
          tips: [
            {
              id: 'hidden-old',
              status: 'hidden',
              createdAt: '2024-01-01T00:00:00.000Z',
              moderation: { history: [{ at: '2025-01-01T00:00:00.000Z', action: 'hide' }] },
            },
            {
              id: 'published-old',
              status: 'published',
              createdAt: '2020-01-01T00:00:00.000Z',
              publishedAt: '2020-01-02T00:00:00.000Z',
              contactEmail: null,
            },
            {
              id: 'pending-old',
              status: 'pending',
              createdAt: '2020-01-01T00:00:00.000Z',
            },
          ],
        },
      },
      NOW,
    );
    assert.equal(result.counts.tipsDeleted, 1);
    assert.deepEqual(
      result.tipsDb.tips.map((t) => t.id).sort(),
      ['pending-old', 'published-old'],
    );
  });

  it('e-mail facultatif : effacé 12 mois après createdAt, 1 ms avant conservé', () => {
    const result = computeRetention(
      {
        tipsDb: {
          tips: [
            {
              id: 'mail-after',
              status: 'published',
              createdAt: '2025-10-30T11:59:59.999Z',
              contactEmail: 'old@example.test',
            },
            {
              id: 'mail-before',
              status: 'pending',
              createdAt: '2025-10-30T12:00:00.001Z',
              contactEmail: 'new@example.test',
            },
          ],
        },
      },
      NOW,
    );
    assert.equal(result.counts.tipEmailsCleared, 1);
    const byId = Object.fromEntries(result.tipsDb.tips.map((t) => [t.id, t]));
    assert.equal(byId['mail-after'].contactEmail, null);
    assert.equal(byId['mail-before'].contactEmail, 'new@example.test');
  });

  it('commentaire : gardé 1 ms avant 3 ans, supprimé 1 ms après, quel que soit le statut', () => {
    const result = computeRetention(
      {
        commentsDb: {
          comments: [
            {
              id: 'c-before',
              status: 'published',
              publishedAt: '2023-10-30T12:00:00.001Z',
              createdAt: '2020-01-01T00:00:00.000Z',
            },
            {
              id: 'c-after',
              status: 'pending',
              createdAt: '2023-10-30T11:59:59.999Z',
            },
            {
              id: 'c-hidden-old',
              status: 'hidden',
              publishedAt: '2022-01-01T00:00:00.000Z',
              createdAt: '2022-01-01T00:00:00.000Z',
            },
          ],
        },
      },
      NOW,
    );
    assert.equal(result.counts.commentsDeleted, 2);
    assert.deepEqual(
      result.commentsDb.comments.map((c) => c.id),
      ['c-before'],
    );
  });

  it('compte inactif 3 ans : commentaires anonymisés, sessions et liens magiques supprimés', () => {
    const result = computeRetention(
      {
        usersDb: {
          users: [
            {
              id: 'usr_old',
              email: 'old@example.test',
              lastLoginAt: '2023-10-30T11:59:59.999Z',
              createdAt: '2020-01-01T00:00:00.000Z',
            },
            {
              id: 'usr_fresh',
              email: 'fresh@example.test',
              lastLoginAt: '2023-10-30T12:00:00.001Z',
              createdAt: '2020-01-01T00:00:00.000Z',
            },
            {
              id: 'usr_created_old',
              createdAt: '2022-01-01T00:00:00.000Z',
            },
          ],
        },
        sessionsDb: {
          sessions: [
            { id: 'ses_old', userId: 'usr_old' },
            { id: 'ses_fresh', userId: 'usr_fresh' },
            { id: 'ses_other', userId: 'usr_created_old' },
          ],
        },
        magicDb: {
          tokens: [
            { hash: 'tok_old', email: 'old@example.test' },
            { hash: 'tok_fresh', email: 'fresh@example.test' },
          ],
        },
        commentsDb: {
          comments: [
            {
              id: 'c-kept',
              userId: 'usr_old',
              displayName: 'Alice Fictive',
              authorKeyHash: 'hashauteurfictif0001',
              raw: 'texte brut fictif',
              body: 'Message conservé fictif.',
              publishedAt: '2026-01-01T00:00:00.000Z',
              createdAt: '2026-01-01T00:00:00.000Z',
              moderation: {
                history: [{ at: '2026-01-02T00:00:00.000Z', by: 'mod_senior_1', action: 'approve' }],
              },
            },
            {
              id: 'c-fresh-user',
              userId: 'usr_fresh',
              displayName: 'Bob Fictif',
              authorKeyHash: 'hashauteurfictif0002',
              publishedAt: '2026-01-01T00:00:00.000Z',
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
      },
      NOW,
    );
    assert.equal(result.counts.accountsDeleted, 2);
    assert.equal(result.counts.sessionsDeleted, 2);
    assert.equal(result.counts.commentsUnlinked, 1);
    assert.equal(result.counts.magicDeleted, 1);
    assert.deepEqual(
      result.usersDb.users.map((u) => u.id),
      ['usr_fresh'],
    );
    assert.deepEqual(
      result.sessionsDb.sessions.map((s) => s.id),
      ['ses_fresh'],
    );
    assert.deepEqual(
      result.magicDb.tokens.map((t) => t.hash),
      ['tok_fresh'],
    );
    const kept = result.commentsDb.comments.find((c) => c.id === 'c-kept');
    assert.equal(kept.userId, null);
    assert.equal(kept.displayName, DELETED_ACCOUNT_DISPLAY_NAME);
    assert.equal(kept.authorKeyHash ?? null, null);
    assert.equal(kept.raw, 'texte brut fictif');
    assert.equal(kept.moderation.history[0].by, 'mod_senior_1');
    const fresh = result.commentsDb.comments.find((c) => c.id === 'c-fresh-user');
    assert.equal(fresh.userId, 'usr_fresh');
    assert.equal(fresh.displayName, 'Bob Fictif');
    assert.equal(fresh.authorKeyHash, 'hashauteurfictif0002');
  });
});

describe('anonymizeCommentsForUser', () => {
  it('neutralise userId, displayName et authorKeyHash ; laisse les autres comptes', () => {
    const comments = [
      {
        id: 'c-a',
        userId: 'usr_gone',
        displayName: 'Alice Fictive',
        authorKeyHash: 'hashauteurfictif0001',
        email: 'alice@example.test',
        moderation: { history: [{ by: 'mod_1', action: 'approve' }] },
      },
      {
        id: 'c-b',
        userId: 'usr_other',
        displayName: 'Bob Fictif',
        authorKeyHash: 'hashauteurfictif0002',
      },
    ];
    const n = anonymizeCommentsForUser(comments, 'usr_gone');
    assert.equal(n, 1);
    assert.equal(comments[0].userId, null);
    assert.equal(comments[0].displayName, 'Compte supprimé');
    assert.equal(comments[0].authorKeyHash ?? null, null);
    assert.equal(comments[0].email, null);
    assert.equal(comments[0].moderation.history[0].by, 'mod_1');
    assert.equal(comments[1].userId, 'usr_other');
    assert.equal(comments[1].displayName, 'Bob Fictif');
    assert.equal(comments[1].authorKeyHash, 'hashauteurfictif0002');
  });
});

describe('runRetention — dry-run vs apply (mkdtemp)', () => {
  it('dry-run n’écrit rien ; apply écrit les compteurs', () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'lmdpt-ret-'));
    try {
      const seed = {
        tips: {
          version: 1,
          tips: [
            {
              id: 'tip-old',
              status: 'rejected',
              createdAt: '2024-01-01T00:00:00.000Z',
              contactEmail: 'gone@example.test',
              moderation: { history: [{ at: '2025-01-01T00:00:00.000Z', action: 'reject' }] },
            },
            {
              id: 'tip-pub',
              status: 'published',
              createdAt: '2025-01-01T00:00:00.000Z',
              contactEmail: 'keep-page@example.test',
            },
          ],
        },
        comments: {
          version: 1,
          comments: [
            {
              id: 'c-old',
              userId: 'usr_old',
              status: 'published',
              publishedAt: '2022-01-01T00:00:00.000Z',
              createdAt: '2022-01-01T00:00:00.000Z',
            },
            {
              id: 'c-new',
              userId: 'usr_old',
              displayName: 'Alice Fictive',
              authorKeyHash: 'hashauteurfictif0001',
              status: 'published',
              publishedAt: '2026-01-01T00:00:00.000Z',
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          ],
        },
        users: {
          version: 1,
          users: [
            {
              id: 'usr_old',
              email: 'old@example.test',
              createdAt: '2020-01-01T00:00:00.000Z',
              lastLoginAt: '2022-01-01T00:00:00.000Z',
            },
          ],
        },
        sessions: {
          version: 1,
          sessions: [{ id: 'ses_old', userId: 'usr_old' }],
        },
        magic: {
          version: 1,
          tokens: [{ hash: 'tok_old', email: 'old@example.test' }],
        },
      };
      writeJson(dataDir, 'tips.json', seed.tips);
      writeJson(dataDir, 'comments.json', seed.comments);
      writeJson(dataDir, 'users.json', seed.users);
      writeJson(dataDir, 'sessions.json', seed.sessions);
      writeJson(dataDir, 'magic-tokens.json', seed.magic);

      const beforeTips = readFileSync(join(dataDir, 'tips.json'), 'utf8');
      const beforeComments = readFileSync(join(dataDir, 'comments.json'), 'utf8');
      const beforeUsers = readFileSync(join(dataDir, 'users.json'), 'utf8');
      const beforeSessions = readFileSync(join(dataDir, 'sessions.json'), 'utf8');
      const beforeMagic = readFileSync(join(dataDir, 'magic-tokens.json'), 'utf8');

      const dry = runRetention({ dataDir, now: NOW, apply: false });
      assert.equal(dry.tipsDeleted, 1);
      assert.equal(dry.commentsDeleted, 1);
      assert.equal(dry.accountsDeleted, 1);
      assert.equal(dry.sessionsDeleted, 1);
      assert.equal(readFileSync(join(dataDir, 'tips.json'), 'utf8'), beforeTips);
      assert.equal(readFileSync(join(dataDir, 'comments.json'), 'utf8'), beforeComments);
      assert.equal(readFileSync(join(dataDir, 'users.json'), 'utf8'), beforeUsers);
      assert.equal(readFileSync(join(dataDir, 'sessions.json'), 'utf8'), beforeSessions);
      assert.equal(readFileSync(join(dataDir, 'magic-tokens.json'), 'utf8'), beforeMagic);

      const applied = runRetention({ dataDir, now: NOW, apply: true });
      assert.deepEqual(applied, dry);
      const tips = readJson(dataDir, 'tips.json');
      const comments = readJson(dataDir, 'comments.json');
      const users = readJson(dataDir, 'users.json');
      const sessions = readJson(dataDir, 'sessions.json');
      assert.equal(tips.tips.length, 1);
      assert.equal(tips.tips[0].id, 'tip-pub');
      assert.equal(tips.tips[0].contactEmail, null);
      assert.equal(comments.comments.length, 1);
      assert.equal(comments.comments[0].id, 'c-new');
      assert.equal(comments.comments[0].userId, null);
      assert.equal(comments.comments[0].displayName, 'Compte supprimé');
      assert.equal(comments.comments[0].authorKeyHash ?? null, null);
      assert.equal(users.users.length, 0);
      assert.equal(sessions.sessions.length, 0);
      const magic = readJson(dataDir, 'magic-tokens.json');
      assert.equal(magic.tokens.length, 0);
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  it('apply refuse si le verrou est tenu ; fonctionne sinon', () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'lmdpt-ret-lock-'));
    try {
      writeJson(dataDir, 'tips.json', { version: 1, tips: [] });
      writeJson(dataDir, 'comments.json', { version: 1, comments: [] });
      writeJson(dataDir, 'users.json', { version: 1, users: [] });
      writeJson(dataDir, 'sessions.json', { version: 1, sessions: [] });

      const held = acquireDataLock(dataDir, { owner: 'other' });
      assert.ok(held);
      const before = readFileSync(join(dataDir, 'tips.json'), 'utf8');
      assert.throws(
        () => runRetention({ dataDir, now: NOW, apply: true }),
        (err) => err.code === LOCKED_CODE,
      );
      assert.equal(readFileSync(join(dataDir, 'tips.json'), 'utf8'), before);
      const dryWhileLocked = runRetention({ dataDir, now: NOW, apply: false });
      assert.equal(typeof dryWhileLocked.tipsDeleted, 'number');

      releaseDataLock(held);
      const applied = runRetention({ dataDir, now: NOW, apply: true });
      assert.equal(applied.tipsDeleted, 0);
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});
