export type HeroDailyArgs = {
  dryRun: boolean;
  force: boolean;
  skipSketch: boolean;
  unknown: string[];
};

export type PosterInputMode = 'generate' | 'reuse-sketch' | 'reuse-live' | 'missing';

export function parseHeroDailyArgs(argv: readonly string[]): HeroDailyArgs;

export function resolvePosterInput(input: {
  skipSketch: boolean;
  sketchExists: boolean;
  liveExists: boolean;
}): { mode: PosterInputMode };
