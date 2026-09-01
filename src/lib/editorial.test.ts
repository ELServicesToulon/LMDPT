import { describe, expect, it } from 'vitest';
import { ANALYSIS_CATALOG } from './analyses';
import { DEBATE_CATALOG } from './debates';
import {
  MISSING_COVER_SRC,
  assertUniqueEditorialCovers,
  auditEditorialCovers,
  compareEditorialRecency,
  getUneDuJour,
  isForbiddenUneCover,
  listEditorialPosts,
  resolveCover,
  type EditorialPost,
} from './editorial';

describe('editorial covers', () => {
  it('every analysis and debate has a dedicated cover file', () => {
    expect(ANALYSIS_CATALOG.every((a) => a.cover?.src)).toBe(true);
    expect(DEBATE_CATALOG.every((d) => d.cover?.src)).toBe(true);
    expect(() => assertUniqueEditorialCovers()).not.toThrow();
    expect(auditEditorialCovers()).toEqual([]);
  });

  it('no two posts share the same une image', () => {
    const posts = listEditorialPosts();
    const srcs = posts.map((p) => p.cover?.src).filter(Boolean) as string[];
    expect(new Set(srcs).size).toBe(srcs.length);
    expect(srcs.length).toBe(posts.length);
  });

  it('rejects cairo / daily scoop paths as une covers', () => {
    expect(isForbiddenUneCover('/illustrations/2027/hero-daily-live.jpg')).toBe(true);
    expect(isForbiddenUneCover('/illustrations/2027/hero-daily-2026-07-26.jpg')).toBe(true);
    expect(isForbiddenUneCover('/illustrations/unes/analyses/temps-parole-equite.jpg')).toBe(false);
  });

  it('homepage une is the most recently published post', () => {
    const une = getUneDuJour();
    expect(une).not.toBeNull();
    const latest = [...listEditorialPosts()].sort(compareEditorialRecency)[0];
    expect(une?.kind).toBe(latest?.kind);
    expect(une?.slug).toBe(latest?.slug);
    expect(une?.href).toBe(latest?.href);
    expect(une?.date).toBe('2026-07-26');
    expect(une?.slug).toBe('temps-parole-equite');
  });

  it('publishing a newer post changes the une automatically', () => {
    const current = listEditorialPosts();
    const fresh: EditorialPost = {
      kind: 'analyse',
      slug: 'nouvelle-analyse-test',
      title: 'Nouvelle analyse',
      description: 'Texte de test',
      date: '2026-09-01',
      href: '/analyses/nouvelle-analyse-test',
      cover: {
        src: '/illustrations/unes/analyses/nouvelle-analyse-test.jpg',
        alt: 'Croquis de test',
      },
    };
    const une = getUneDuJour([...current, fresh]);
    expect(une?.slug).toBe('nouvelle-analyse-test');
    expect(une?.cover?.src).toBe(fresh.cover?.src);
    expect(une?.cover?.src).not.toBe(getUneDuJour(current)?.cover?.src);
  });

  it('missing cover uses the labeled placeholder, never another post art', () => {
    const other = listEditorialPosts()[0];
    const resolved = resolveCover(null);
    expect(resolved.missing).toBe(true);
    expect(resolved.src).toBe(MISSING_COVER_SRC);
    expect(resolved.src).not.toBe(other?.cover?.src);
    expect(resolved.alt.toLowerCase()).toContain('manquante');

    const empty = resolveCover({ src: '  ', alt: '' });
    expect(empty.src).toBe(MISSING_COVER_SRC);
    expect(empty.missing).toBe(true);
  });

  it('audit fails loudly on duplicate or missing field', () => {
    const posts = listEditorialPosts();
    const clone: EditorialPost = {
      ...posts[0],
      slug: 'clone-dupe',
      href: '/analyses/clone-dupe',
    };
    const dupes = auditEditorialCovers([...posts, clone]);
    expect(dupes.some((e) => e.code === 'duplicate')).toBe(true);

    const missing = auditEditorialCovers([
      { ...posts[0], slug: 'sans-cover', href: '/analyses/sans-cover', cover: null },
    ]);
    expect(missing.some((e) => e.code === 'missing-field')).toBe(true);
  });
});
