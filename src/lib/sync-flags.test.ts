import { describe, expect, it } from 'vitest';
import { shouldGenerateSocialDraft } from './sync-flags';

describe('sync-flags', () => {
  it('skips social draft by default', () => {
    expect(shouldGenerateSocialDraft({}, ['node', 'sync'])).toBe(false);
  });

  it('enables with env LMDPT_SYNC_SOCIAL_DRAFT=1', () => {
    expect(shouldGenerateSocialDraft({ LMDPT_SYNC_SOCIAL_DRAFT: '1' }, [])).toBe(true);
    expect(shouldGenerateSocialDraft({ LMDPT_SYNC_SOCIAL_DRAFT: 'true' }, [])).toBe(true);
  });

  it('enables with --social-draft argv', () => {
    expect(shouldGenerateSocialDraft({}, ['tsx', 'sync-all.ts', '--social-draft'])).toBe(true);
  });
});
