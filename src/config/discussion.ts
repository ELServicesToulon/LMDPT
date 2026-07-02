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
const repoId = env('PUBLIC_GISCUS_REPO_ID');
const categoryId = env('PUBLIC_GISCUS_CATEGORY_ID');

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

export function getDiscussionUrl(discussionId: string): string {
  return `${discussionConfig.discussionsUrl}?discussions_q=${encodeURIComponent(discussionId)}`;
}
