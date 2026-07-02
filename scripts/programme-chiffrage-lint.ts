/**
 * Lint chiffrages et cohérence des fiches programmes.
 * Usage: npm run programme-chiffrage-lint
 */
import { getAllProgramFiles } from '../src/lib/programs.js';
import { lintAllProgramFiles } from '../src/lib/program-chiffrage.js';

const issues = lintAllProgramFiles(getAllProgramFiles());

if (issues.length === 0) {
  console.log(`programme-chiffrage-lint: OK (${getAllProgramFiles().length} fiches)`);
  process.exit(0);
}

console.error('programme-chiffrage-lint: ÉCHEC\n');
for (const i of issues) {
  console.error(`  [${i.file}] ${i.chiffrageId}: ${i.message}`);
}
process.exit(1);
