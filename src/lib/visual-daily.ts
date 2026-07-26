/**
 * Rotation quotidienne des visuels LMDPT (Europe/Paris).
 * Déterministe : même jour → même set ; J+1 → set suivant (mod N).
 */

export type VisualGalleryItem = {
  src: string;
  alt: string;
  label: string;
  title: string;
  wit: string;
};

export type VisualDaySet = {
  id: string;
  heroVideo: string;
  heroPosterWebp: string;
  heroPosterJpg: string;
  heroAlt: string;
  gallery: VisualGalleryItem[];
  galleryVideo?: {
    src: string;
    poster: string;
    caption?: string;
  };
};

export type VisualDailyPool = {
  timezone: string;
  days: VisualDaySet[];
};

/** Override généré par `npm run hero:daily` (scoop du jour → vidéo N&B). */
export type HeroDailyOverride = {
  schema?: string;
  dayKey: string;
  timezone?: string;
  forceDaily?: boolean;
  id?: string;
  motif?: string;
  heroVideo: string;
  heroPosterWebp: string;
  heroPosterJpg: string;
  heroAlt: string;
  galleryVideo?: VisualDaySet['galleryVideo'];
  scoop?: {
    title?: string;
    source?: string;
    url?: string | null;
  };
};

/** Clé calendaire YYYY-MM-DD en fuseau Europe/Paris (ou pool.timezone). */
export function parisDayKey(date: Date = new Date(), timeZone = 'Europe/Paris'): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Jours depuis epoch UTC pour une clé YYYY-MM-DD (stable, indépendant de l’heure). */
export function epochDayFromKey(dayKey: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);
  if (!m) throw new Error(`Invalid day key: ${dayKey}`);
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return Math.floor(Date.UTC(y, mo - 1, d) / 86_400_000);
}

export function dayIndexFromKey(dayKey: string, length: number): number {
  if (length <= 0) throw new Error('Pool length must be > 0');
  const epoch = epochDayFromKey(dayKey);
  return ((epoch % length) + length) % length;
}

export function pickDailyVisuals(
  pool: VisualDailyPool,
  date: Date = new Date(),
): { dayKey: string; index: number; set: VisualDaySet } {
  if (!pool.days?.length) throw new Error('visual-daily-pool: empty days');
  const tz = pool.timezone || 'Europe/Paris';
  const dayKey = parisDayKey(date, tz);
  const index = dayIndexFromKey(dayKey, pool.days.length);
  const set = pool.days[index];
  if (!set) throw new Error(`visual-daily-pool: missing set at index ${index}`);
  return { dayKey, index, set };
}

/**
 * Si un override du jour existe (hero:daily), force la vidéo/poster scoop
 * tout en conservant la galerie du set rotatif.
 */
export function applyHeroDailyOverride(
  base: VisualDaySet,
  override: HeroDailyOverride | null | undefined,
  dayKey: string,
): VisualDaySet {
  if (!override?.forceDaily) return base;
  if (override.dayKey !== dayKey) return base;
  if (!override.heroVideo || !override.heroPosterJpg) return base;

  return {
    ...base,
    id: override.id || `scoop-${dayKey}`,
    heroVideo: override.heroVideo,
    heroPosterWebp: override.heroPosterWebp || override.heroPosterJpg,
    heroPosterJpg: override.heroPosterJpg,
    heroAlt: override.heroAlt || base.heroAlt,
    galleryVideo: override.galleryVideo
      ? {
          src: override.galleryVideo.src || override.heroVideo,
          poster: override.galleryVideo.poster || override.heroPosterWebp || override.heroPosterJpg,
          caption: override.galleryVideo.caption,
        }
      : {
          src: override.heroVideo,
          poster: override.heroPosterWebp || override.heroPosterJpg,
          caption: 'Vidéo hero du jour — croquis N&B scoop.',
        },
  };
}
