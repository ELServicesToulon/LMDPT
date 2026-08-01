export interface DiscussionConfig {
  /** Embed Giscus (login GitHub) — OFF par défaut : compte LMDPT centralisé. */
  enabled: boolean;
  repo: string;
  repoId: string;
  categoryId: string;
  category: string;
  mapping: 'specific' | 'pathname' | 'url' | 'title' | 'og:title' | 'number';
  theme: 'light' | 'dark' | 'preferred_color_scheme';
  lang: string;
  discussionsUrl: string;
}

function env(key: string): string {
  return (import.meta.env[key] as string | undefined)?.trim() ?? '';
}

const repo = env('PUBLIC_GISCUS_REPO') || 'ELServicesToulon/LMDPT';
const repoId = env('PUBLIC_GISCUS_REPO_ID') || 'R_kgDOTGlsIg';
const categoryId = env('PUBLIC_GISCUS_CATEGORY_ID') || '50431033';

/**
 * Compte lecteur unique = `/connexion` + module Commentaires citoyens.
 * Giscus (GitHub) n’est plus le canal d’identité sur `/debats` — opt-in explicite uniquement.
 */
const giscusEmbedOptIn =
  env('PUBLIC_GISCUS_EMBED') === '1' || env('PUBLIC_GISCUS_EMBED') === 'true';

export const discussionConfig: DiscussionConfig = {
  enabled: giscusEmbedOptIn && Boolean(repoId && categoryId),
  repo,
  repoId,
  categoryId,
  category: env('PUBLIC_GISCUS_CATEGORY') || 'Débats',
  mapping: 'specific',
  theme: 'preferred_color_scheme',
  lang: 'fr',
  discussionsUrl: `https://github.com/${repo}/discussions`,
};

/** Fils GitHub Discussions créés juil. 2026 — mapping Giscus `specific` (legacy / opt-in). */
const DISCUSSION_THREAD_URLS: Record<string, string> = {
  'assemblee-premier-tour': 'https://github.com/ELServicesToulon/LMDPT/discussions/1',
  'vote-utile-pluralite': 'https://github.com/ELServicesToulon/LMDPT/discussions/3',
  'desistements-second-tour': 'https://github.com/ELServicesToulon/LMDPT/discussions/4',
};

export function getDiscussionUrl(discussionId: string): string {
  return (
    DISCUSSION_THREAD_URLS[discussionId] ??
    `${discussionConfig.discussionsUrl}?discussions_q=${encodeURIComponent(discussionId)}`
  );
}

/** Mapping Giscus : numéro de fil si connu (fiable), sinon terme `specific`. */
export function getGiscusEmbed(discussionId: string): {
  mapping: DiscussionConfig['mapping'];
  term: string;
} {
  const threadUrl = DISCUSSION_THREAD_URLS[discussionId];
  const number = threadUrl?.match(/\/discussions\/(\d+)$/)?.[1];
  if (number) {
    return { mapping: 'number', term: number };
  }
  return { mapping: 'specific', term: discussionId };
}
