import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: path.join(os.tmpdir(), 'lmdpt-vitest-cache'),
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
