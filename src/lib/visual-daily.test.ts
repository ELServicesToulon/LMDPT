import { describe, expect, it } from 'vitest';
import {
  applyHeroDailyOverride,
  dayIndexFromKey,
  epochDayFromKey,
  parisDayKey,
  pickDailyVisuals,
  type HeroDailyOverride,
  type VisualDailyPool,
} from './visual-daily';

const miniPool: VisualDailyPool = {
  timezone: 'Europe/Paris',
  days: [
    {
      id: 'a',
      heroVideo: '/v.mp4',
      heroPosterWebp: '/a.webp',
      heroPosterJpg: '/a.jpg',
      heroAlt: 'a',
      gallery: [
        { src: '/g1.jpg', alt: 'g1', label: 'L', title: 'T', wit: 'W' },
      ],
    },
    {
      id: 'b',
      heroVideo: '/v.mp4',
      heroPosterWebp: '/b.webp',
      heroPosterJpg: '/b.jpg',
      heroAlt: 'b',
      gallery: [
        { src: '/g2.jpg', alt: 'g2', label: 'L', title: 'T', wit: 'W' },
      ],
    },
    {
      id: 'c',
      heroVideo: '/v.mp4',
      heroPosterWebp: '/c.webp',
      heroPosterJpg: '/c.jpg',
      heroAlt: 'c',
      gallery: [
        { src: '/g3.jpg', alt: 'g3', label: 'L', title: 'T', wit: 'W' },
      ],
    },
  ],
};

describe('visual-daily', () => {
  it('parisDayKey formats YYYY-MM-DD in Europe/Paris', () => {
    const key = parisDayKey(new Date('2026-07-22T10:00:00+02:00'));
    expect(key).toBe('2026-07-22');
  });

  it('epochDayFromKey is stable for a calendar day', () => {
    expect(epochDayFromKey('2026-07-22')).toBe(epochDayFromKey('2026-07-22'));
    expect(epochDayFromKey('2026-07-23')).toBe(epochDayFromKey('2026-07-22') + 1);
  });

  it('dayIndexFromKey cycles mod N', () => {
    const e = epochDayFromKey('2026-07-22');
    expect(dayIndexFromKey('2026-07-22', 7)).toBe(((e % 7) + 7) % 7);
    expect(dayIndexFromKey('2026-07-23', 7)).toBe(
      dayIndexFromKey('2026-07-22', 7) === 6 ? 0 : dayIndexFromKey('2026-07-22', 7) + 1,
    );
  });

  it('pickDailyVisuals is deterministic for same day and advances next day', () => {
    const d0 = new Date('2026-07-22T12:00:00+02:00');
    const d1 = new Date('2026-07-23T12:00:00+02:00');
    const a = pickDailyVisuals(miniPool, d0);
    const a2 = pickDailyVisuals(miniPool, d0);
    const b = pickDailyVisuals(miniPool, d1);
    expect(a.index).toBe(a2.index);
    expect(a.set.id).toBe(a2.set.id);
    expect(b.index).toBe((a.index + 1) % miniPool.days.length);
    expect(b.set.id).not.toBe(a.set.id);
  });

  it('real pool has at least 7 distinct day sets', async () => {
    const pool = (await import('../../public/illustrations/2027/visual-daily-pool.json'))
      .default as VisualDailyPool;
    expect(pool.days.length).toBeGreaterThanOrEqual(7);
    const ids = new Set(pool.days.map((d) => d.id));
    expect(ids.size).toBe(pool.days.length);
    for (const day of pool.days) {
      expect(day.gallery.length).toBeGreaterThanOrEqual(5);
      expect(day.heroPosterJpg).toMatch(/^\/illustrations\//);
      expect(day.heroVideo).toMatch(/^\/videos\//);
    }
  });

  it('applyHeroDailyOverride forces video when dayKey matches', () => {
    const base = miniPool.days[0];
    const ov: HeroDailyOverride = {
      dayKey: '2026-07-25',
      forceDaily: true,
      id: 'scoop-2026-07-25-documents',
      heroVideo: '/videos/2027/hero-daily-live.mp4?d=2026-07-25',
      heroPosterWebp: '/illustrations/2027/hero-daily-live.webp?d=2026-07-25',
      heroPosterJpg: '/illustrations/2027/hero-daily-live.jpg?d=2026-07-25',
      heroAlt: 'Croquis N&B du jour',
    };
    const applied = applyHeroDailyOverride(base, ov, '2026-07-25');
    expect(applied.heroVideo).toContain('hero-daily-live');
    expect(applied.id).toBe('scoop-2026-07-25-documents');
    expect(applied.gallery).toEqual(base.gallery);

    const skipped = applyHeroDailyOverride(base, ov, '2026-07-26');
    expect(skipped.heroVideo).toBe(base.heroVideo);
  });
});
