/** Flags opt-in pour le pipeline sync LMDPT. */

export function shouldGenerateSocialDraft(
  env: NodeJS.ProcessEnv = process.env,
  argv: string[] = process.argv,
): boolean {
  const flag = env.LMDPT_SYNC_SOCIAL_DRAFT?.trim().toLowerCase();
  if (flag === '1' || flag === 'true' || flag === 'yes') return true;
  return argv.includes('--social-draft');
}
