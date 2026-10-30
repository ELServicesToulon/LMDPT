/**
 * Tests migration teinte stockée — données fictives, mkdtemp.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  runMigrateStripStoredHue,
  stripStoredHue,
} from './migrate-strip-stored-hue.mjs';

describe('stripStoredHue', () => {
  it('retire politicalHue, slug des recolor, preferredHueSlug — sans muter l’entrée', () => {
    const db = {
      version: 1,
      comments: [
        {
          id: 'c1',
          body: 'texte',
          politicalHue: { slug: 'attal', label: 'Attal', color: '#ffeb00' },
          moderation: {
            history: [
              { at: '2026-01-01T00:00:00.000Z', action: 'approve', slug: null },
              { at: '2026-01-02T00:00:00.000Z', action: 'recolor', slug: 'pluraliste' },
            ],
          },
        },
        {
          id: 'c2',
          body: 'sans teinte',
          moderation: { history: [{ at: '2026-01-01T00:00:00.000Z', action: 'hide' }] },
        },
      ],
    };
    const usersDb = {
      version: 1,
      users: [
        { id: 'usr_1', displayNameDefault: 'A', preferredHueSlug: 'attal' },
        { id: 'usr_2', displayNameDefault: 'B' },
      ],
    };
    const snapshotDb = structuredClone(db);
    const snapshotUsers = structuredClone(usersDb);

    const result = stripStoredHue(db, usersDb);

    assert.deepEqual(db, snapshotDb);
    assert.deepEqual(usersDb, snapshotUsers);
    assert.equal(result.counts.commentsStripped, 1);
    assert.equal(result.counts.recolorSlugsStripped, 1);
    assert.equal(result.counts.preferredHueStripped, 1);
    assert.equal('politicalHue' in result.comments.comments[0], false);
    assert.equal('slug' in result.comments.comments[0].moderation.history[1], false);
    assert.equal(result.comments.comments[0].moderation.history[1].action, 'recolor');
    assert.equal(result.comments.comments[0].moderation.history[0].slug, null);
    assert.equal('preferredHueSlug' in result.users.users[0], false);
    assert.equal(result.users.users[1].id, 'usr_2');
  });
});

describe('runMigrateStripStoredHue — dry-run vs apply', () => {
  it('dry-run n’écrit rien ; apply sauvegarde en 600 puis écrit', () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'lmdpt-mig-'));
    try {
      const comments = {
        version: 1,
        comments: [
          {
            id: 'c1',
            body: 'secret-ne-jamais-logger',
            politicalHue: { slug: 'attal' },
            moderation: { history: [{ action: 'recolor', slug: 'pluraliste' }] },
          },
        ],
      };
      const users = {
        version: 1,
        users: [{ id: 'usr_1', preferredHueSlug: 'attal' }],
      };
      const commentsPath = join(dataDir, 'comments.json');
      const usersPath = join(dataDir, 'users.json');
      writeFileSync(commentsPath, JSON.stringify(comments, null, 2) + '\n');
      writeFileSync(usersPath, JSON.stringify(users, null, 2) + '\n');
      chmodSync(commentsPath, 0o644);
      chmodSync(usersPath, 0o644);

      const beforeComments = readFileSync(commentsPath, 'utf8');
      const beforeUsers = readFileSync(usersPath, 'utf8');
      const now = new Date('2026-10-30T12:00:00.000Z');

      const dry = runMigrateStripStoredHue({ dataDir, apply: false, now });
      assert.equal(dry.commentsStripped, 1);
      assert.equal(dry.preferredHueStripped, 1);
      assert.equal(readFileSync(commentsPath, 'utf8'), beforeComments);
      assert.equal(readFileSync(usersPath, 'utf8'), beforeUsers);
      assert.equal(
        readdirSync(dataDir).filter((n) => n.includes('.bak-')).length,
        0,
      );

      const applied = runMigrateStripStoredHue({ dataDir, apply: true, now });
      assert.deepEqual(applied, dry);

      const stamp = now.toISOString().replace(/[:.]/g, '-');
      const commentsBak = join(dataDir, `comments.json.bak-${stamp}`);
      const usersBak = join(dataDir, `users.json.bak-${stamp}`);
      assert.equal(readFileSync(commentsBak, 'utf8'), beforeComments);
      assert.equal(readFileSync(usersBak, 'utf8'), beforeUsers);
      assert.equal(statSync(commentsBak).mode & 0o777, 0o600);
      assert.equal(statSync(usersBak).mode & 0o777, 0o600);

      const afterComments = JSON.parse(readFileSync(commentsPath, 'utf8'));
      const afterUsers = JSON.parse(readFileSync(usersPath, 'utf8'));
      assert.equal('politicalHue' in afterComments.comments[0], false);
      assert.equal('slug' in afterComments.comments[0].moderation.history[0], false);
      assert.equal('preferredHueSlug' in afterUsers.users[0], false);
      assert.equal(afterComments.comments[0].body, 'secret-ne-jamais-logger');
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});
