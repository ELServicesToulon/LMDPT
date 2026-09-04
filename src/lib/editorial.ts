import { existsSync } from 'node:fs';
import path from 'node:path';
import { ANALYSIS_CATALOG, type AnalysisSummary } from './analyses';
import { DEBATE_CATALOG } from './debates';
import type { DebateSummary } from './debate-types';
import type { EditorialCover, EditorialKind } from './editorial-types';

export type { EditorialCover, EditorialKind } from './editorial-types';

export interface EditorialPost {
  kind: EditorialKind;
  slug: string;
  title: string;
  description: string;
  date: string;
  href: string;
  cover: EditorialCover | null;
}

/** Placeholder clairement libellé — jamais l’illustration d’un autre texte. */
export const MISSING_COVER_SRC = '/illustrations/unes/placeholder-manquante.svg';

export const MISSING_COVER_ALT =
  'Illustration manquante — ajouter un croquis unique pour ce texte, ne pas réutiliser une autre une';

const FORBIDDEN_COVER = /hero-daily-live|hero-daily-20\d{2}|cairo/i;

export function editorialKindLabel(kind: EditorialKind): string {
  switch (kind) {
    case 'analyse':
      return 'Analyse';
    case 'debat':
      return 'Débat';
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function resolveCover(
  cover: EditorialCover | null | undefined,
): { src: string; alt: string; missing: boolean } {
  const src = cover?.src?.trim() ?? '';
  if (!src) {
    return { src: MISSING_COVER_SRC, alt: MISSING_COVER_ALT, missing: true };
  }
  return { src, alt: cover?.alt?.trim() || MISSING_COVER_ALT, missing: false };
}

export function isForbiddenUneCover(src: string): boolean {
  return FORBIDDEN_COVER.test(src);
}

export function coverPublicPath(src: string): string {
  const rel = src.replace(/^\//, '').split('?')[0] ?? '';
  return path.join(process.cwd(), 'public', rel);
}

export function coverFileExists(src: string): boolean {
  return existsSync(coverPublicPath(src));
}

function analysisToPost(a: AnalysisSummary): EditorialPost {
  return {
    kind: 'analyse',
    slug: a.slug,
    title: a.title,
    description: a.description,
    date: a.date,
    href: a.href,
    cover: a.cover,
  };
}

function debateToPost(d: DebateSummary): EditorialPost {
  return {
    kind: 'debat',
    slug: d.slug,
    title: d.question,
    description: d.description,
    date: d.date,
    href: d.href,
    cover: d.cover,
  };
}

export function listEditorialPosts(): EditorialPost[] {
  return [...ANALYSIS_CATALOG.map(analysisToPost), ...DEBATE_CATALOG.map(debateToPost)];
}

export function findEditorialByPath(pathname: string): EditorialPost | undefined {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return listEditorialPosts().find((p) => p.href === clean);
}

/** Plus récente date ISO d’abord ; égalité → slug stable. */
export function compareEditorialRecency(a: EditorialPost, b: EditorialPost): number {
  const byDate = b.date.localeCompare(a.date);
  if (byDate !== 0) return byDate;
  return a.slug.localeCompare(b.slug, 'fr');
}

/** Une du jour = couverture du texte éditorial le plus récemment publié. */
export function getUneDuJour(posts: EditorialPost[] = listEditorialPosts()): EditorialPost | null {
  if (posts.length === 0) return null;
  return [...posts].sort(compareEditorialRecency)[0] ?? null;
}

export type CoverAuditError = {
  code: 'missing-field' | 'missing-file' | 'duplicate' | 'forbidden';
  message: string;
};

/**
 * Échec bruyant : champ absent, fichier manquant, image interdite (cairo/scoop),
 * ou deux posts qui partagent le même fichier. Pas de réemploi silencieux.
 */
export function auditEditorialCovers(posts: EditorialPost[] = listEditorialPosts()): CoverAuditError[] {
  const errors: CoverAuditError[] = [];
  const seen = new Map<string, string>();

  for (const post of posts) {
    const id = `${post.kind}:${post.slug}`;
    const src = post.cover?.src?.trim() ?? '';
    if (!src) {
      errors.push({
        code: 'missing-field',
        message: `${id} n’a pas de couverture dédiée — placeholder obligatoire, jamais l’art d’un autre texte`,
      });
      continue;
    }
    if (isForbiddenUneCover(src)) {
      errors.push({
        code: 'forbidden',
        message: `${id} utilise une illustration interdite (cairo / scoop quotidien) : ${src}`,
      });
    }
    const prev = seen.get(src);
    if (prev) {
      errors.push({
        code: 'duplicate',
        message: `Couverture partagée entre ${prev} et ${id} : ${src}`,
      });
    } else {
      seen.set(src, id);
    }
    if (!coverFileExists(src)) {
      errors.push({
        code: 'missing-file',
        message: `${id} : fichier introuvable ${src}`,
      });
    }
  }

  return errors;
}

export function assertUniqueEditorialCovers(posts: EditorialPost[] = listEditorialPosts()): void {
  const errors = auditEditorialCovers(posts);
  if (errors.length > 0) {
    throw new Error(
      `Couvertures éditoriales invalides:\n${errors.map((e) => `- ${e.message}`).join('\n')}`,
    );
  }
}
