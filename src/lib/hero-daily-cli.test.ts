import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseHeroDailyArgs, resolvePosterInput } from '../../scripts/hero-daily-video.mjs';

const script = path.join(process.cwd(), 'scripts/hero-daily-video.mjs');

function runHero(args: string[]) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
}

describe('hero daily CLI', () => {
  it('accepts the KS-5 flags --force --skip-sketch', () => {
    const parsed = parseHeroDailyArgs(['--force', '--skip-sketch']);
    expect(parsed).toEqual({
      dryRun: false,
      force: true,
      skipSketch: true,
      unknown: [],
    });
  });

  it('keeps --dry-run and ignores unknown flags', () => {
    const parsed = parseHeroDailyArgs(['--dry-run', '--force', '--not-a-real-flag']);
    expect(parsed.dryRun).toBe(true);
    expect(parsed.force).toBe(true);
    expect(parsed.skipSketch).toBe(false);
    expect(parsed.unknown).toEqual(['--not-a-real-flag']);
  });

  it('reuses an existing poster when --skip-sketch is set', () => {
    expect(
      resolvePosterInput({ skipSketch: true, sketchExists: true, liveExists: false }),
    ).toEqual({ mode: 'reuse-sketch' });
    expect(
      resolvePosterInput({ skipSketch: true, sketchExists: false, liveExists: true }),
    ).toEqual({ mode: 'reuse-live' });
    expect(
      resolvePosterInput({ skipSketch: true, sketchExists: false, liveExists: false }),
    ).toEqual({ mode: 'missing' });
  });

  it('still plans a cairo sketch when --skip-sketch is absent', () => {
    expect(
      resolvePosterInput({ skipSketch: false, sketchExists: true, liveExists: true }),
    ).toEqual({ mode: 'generate' });
  });

  it('dry-run --force --skip-sketch does not launch hero-daily-sketch.py', () => {
    const result = runHero(['--dry-run', '--force', '--skip-sketch']);
    const out = `${result.stdout ?? ''}${result.stderr ?? ''}`;
    expect(result.status, out).toBe(0);
    expect(out).not.toContain('hero-daily-sketch.py');
    expect(out).toContain('--skip-sketch');
    expect(out).toContain('[hero-daily] SHIP');
  });

  it('dry-run --force still plans the cairo sketch', () => {
    const result = runHero(['--dry-run', '--force']);
    const out = `${result.stdout ?? ''}${result.stderr ?? ''}`;
    expect(result.status, out).toBe(0);
    expect(out).toContain('hero-daily-sketch.py');
  });
});
