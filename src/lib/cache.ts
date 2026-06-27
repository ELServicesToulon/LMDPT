import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { SourcesManifest } from './types';

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache');
const MANIFEST_FILE = 'sources-manifest.json';

export function getCacheDir(): string {
  return CACHE_DIR;
}

export async function ensureCacheDir(): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
}

export async function readJsonFile<T>(filename: string): Promise<T | null> {
  try {
    const raw = await readFile(path.join(CACHE_DIR, filename), 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJsonFile(filename: string, data: unknown): Promise<void> {
  await ensureCacheDir();
  await writeFile(path.join(CACHE_DIR, filename), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function readManifest(): Promise<SourcesManifest | null> {
  return readJsonFile<SourcesManifest>(MANIFEST_FILE);
}

export async function writeManifest(manifest: SourcesManifest): Promise<void> {
  await writeJsonFile(MANIFEST_FILE, manifest);
}
