#!/usr/bin/env tsx
/**
 * Génère public/data/assemblee-influenceurs-client.json
 * (détails fiches pour hémicycle + développement — hors HTML).
 * À lancer avant astro build (via sync:all).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildClientPayload,
  getAssembleeInfluenceursView,
} from '../src/lib/assemblee-influenceurs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(ROOT, 'public', 'data');
const outFile = path.join(outDir, 'assemblee-influenceurs-client.json');

const view = getAssembleeInfluenceursView();
const payload = buildClientPayload(view.seated);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(payload));
console.log(
  `assemblee-influenceurs-client.json — ${Object.keys(payload).length} fiches → ${path.relative(ROOT, outFile)}`,
);
