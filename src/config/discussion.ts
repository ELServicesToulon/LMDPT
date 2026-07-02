export interface DiscussionConfig {
  enabled: boolean;
  repo: string;
  repoId: string;
  categoryId: string;
  category: string;
  mapping: 'specific' | 'pathname' | 'url' | 'title' | 'og:title';
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

export const discussionConfig: DiscussionConfig = {
  enabled: Boolean(repoId && categoryId),
  repo,
  repoId,
  categoryId,
  category: env('PUBLIC_GISCUS_CATEGORY') || 'Débats',
  mapping: 'specific',
  theme: 'preferred_color_scheme',
  lang: 'fr',
  discussionsUrl: `https://github.com/${repo}/discussions`,
};

/** Fils GitHub Discussions créés juil. 2026 — mapping Giscus `specific`. */
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
