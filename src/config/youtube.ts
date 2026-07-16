/** YouTube — débats civiques LMDPT (live + replays).
 *
 * Chaîne créée : UCqSj6qYmHXtM1pSLc-DVCVA
 *   https://www.youtube.com/channel/UCqSj6qYmHXtM1pSLc-DVCVA
 * Streaming : demandé 2026-07-16 10:17 — en attente activation YouTube.
 * Handle @LMDuPremierTour : encore 404 jusqu’à revendication Studio.
 *
 * Activer le site uniquement après streaming OK + GO :
 *   PUBLIC_YOUTUBE_ENABLED=true
 *   PUBLIC_YOUTUBE_CHANNEL_URL=https://www.youtube.com/channel/UCqSj6qYmHXtM1pSLc-DVCVA
 * Live ponctuel (watch URL) sans activer toute la chaîne :
 *   PUBLIC_YOUTUBE_LIVE_URL=https://www.youtube.com/watch?v=VIDEO_ID
 */
const DEFAULT_CHANNEL = 'https://www.youtube.com/channel/UCqSj6qYmHXtM1pSLc-DVCVA';

function trimUrl(value: string | undefined): string {
  return (value ?? '').trim();
}

function truthyEnv(value: string | undefined): boolean {
  const v = (value ?? '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

/** Chaîne / footer YouTube — off tant que le handle n’est pas live. */
export function isYoutubeEnabled(): boolean {
  return truthyEnv(import.meta.env.PUBLIC_YOUTUBE_ENABLED);
}

export function getYoutubeChannelUrl(): string {
  if (!isYoutubeEnabled()) return '';
  return trimUrl(import.meta.env.PUBLIC_YOUTUBE_CHANNEL_URL) || DEFAULT_CHANNEL;
}

/** URL live courante — override watch/live explicite, sinon /live si chaîne activée. */
export function getYoutubeLiveUrl(): string {
  const override = trimUrl(import.meta.env.PUBLIC_YOUTUBE_LIVE_URL);
  if (override) return override;
  if (!isYoutubeEnabled()) return '';
  const channel = getYoutubeChannelUrl().replace(/\/$/, '');
  if (!channel) return '';
  return `${channel}/live`;
}

export function getYoutubeLiveUrlWithUtm(campaign: string): string {
  const base = getYoutubeLiveUrl();
  if (!base) return '';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}utm_source=lmdpt&utm_medium=organic&utm_campaign=${encodeURIComponent(campaign)}`;
}
