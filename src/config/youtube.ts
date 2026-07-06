/** YouTube — débats civiques LMDPT (live + replays). */
const DEFAULT_CHANNEL = 'https://www.youtube.com/@LMDuPremierTour';

function trimUrl(value: string | undefined): string {
  return (value ?? '').trim();
}

export function getYoutubeChannelUrl(): string {
  return trimUrl(import.meta.env.PUBLIC_YOUTUBE_CHANNEL_URL) || DEFAULT_CHANNEL;
}

/** URL live courante — défaut : /live sur la chaîne. */
export function getYoutubeLiveUrl(): string {
  const override = trimUrl(import.meta.env.PUBLIC_YOUTUBE_LIVE_URL);
  if (override) return override;
  const channel = getYoutubeChannelUrl().replace(/\/$/, '');
  return `${channel}/live`;
}

export function getYoutubeLiveUrlWithUtm(campaign: string): string {
  const base = getYoutubeLiveUrl();
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}utm_source=lmdpt&utm_medium=organic&utm_campaign=${encodeURIComponent(campaign)}`;
}
