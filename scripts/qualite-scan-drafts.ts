/**
 * Batch qualité rédaction sur social-drafts LMDPT (L0).
 * Usage:
 *   npx tsx scripts/qualite-scan-drafts.ts
 *   npx tsx scripts/qualite-scan-drafts.ts --write
 *   npx tsx scripts/qualite-scan-drafts.ts --dir /path/to/drafts --json
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import {
  applyQualiteToDraftMarkdown,
  reviewQualiteRedaction,
  formatQualiteGateSection,
  repairFalsePositiveGlue,
  type QualiteReport,
} from '../src/lib/qualite-redaction';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const JSON_OUT = args.includes('--json');
const dirIdx = args.indexOf('--dir');
const DIR =
  dirIdx >= 0 && args[dirIdx + 1]
    ? resolve(args[dirIdx + 1]!)
    : resolve(
        process.env.MEDICONVOI_SECOND_BRAIN_VAULT?.trim() || '/home/debian/second-brain',
        'projects/lmdpt/social-drafts',
      );

function walkMd(root: string): string[] {
  if (!existsSync(root)) return [];
  const out: string[] = [];
  const stack = [root];
  while (stack.length) {
    const d = stack.pop()!;
    let entries: string[];
    try {
      entries = readdirSync(d);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (name.startsWith('.')) continue;
      const p = join(d, name);
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        // skip brand assets / thumbnails noise
        if (name === 'thumbnails' || name === 'brand') continue;
        stack.push(p);
      } else if (name.endsWith('.md') && !name.endsWith('.result.md')) {
        out.push(p);
      }
    }
  }
  return out.sort();
}

/** Réécrit fences + recovery faux positifs glue sur tout le doc + gate. */
function rewriteDraft(md: string): {
  markdown: string;
  reports: QualiteReport[];
  changed: boolean;
} {
  const reports: QualiteReport[] = [];
  // Recovery global (hashtags hors fence, adverbes)
  let next = repairFalsePositiveGlue(md);
  next = next.replace(/```\n([\s\S]*?)\n```/g, (_full, body: string) => {
    const report = reviewQualiteRedaction(body);
    reports.push(report);
    return `\`\`\`\n${report.corrected}\n\`\`\``;
  });

  // Aussi scanner le doc entier pour stats hors fence (sans écrire le corps)
  const fullScan = reviewQualiteRedaction(
    md
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/## Gate qualité rédaction[\s\S]*?(?=## |$)/, ' '),
  );

  const aggregate: QualiteReport = {
    original: md,
    corrected: next,
    anomalies: [...reports.flatMap((r) => r.anomalies), ...fullScan.anomalies.filter((a) => a.type === 'glue')],
    stats: {
      total: 0,
      glue: 0,
      ortho: 0,
      punct: 0,
      space: 0,
      apostrophe: 0,
    },
    decision: 'SHIP',
    changed: reports.some((r) => r.changed) || next !== md,
  };
  const all = reports.length ? reports : [fullScan];
  for (const r of all) {
    aggregate.stats.total += r.stats.total;
    aggregate.stats.glue += r.stats.glue;
    aggregate.stats.ortho += r.stats.ortho;
    aggregate.stats.punct += r.stats.punct;
    aggregate.stats.space += r.stats.space;
    aggregate.stats.apostrophe += r.stats.apostrophe;
  }
  if (reports.length === 0) {
    aggregate.anomalies = fullScan.anomalies;
    aggregate.stats = fullScan.stats;
    aggregate.decision = fullScan.decision;
  } else {
    aggregate.decision = reports.some((r) => r.decision === 'FIX-FIRST') ? 'FIX-FIRST' : 'SHIP';
    // Si URL réparée → anomalies punct présentes → decision SHIP après fix
    if (aggregate.stats.glue === 0) aggregate.decision = 'SHIP';
  }

  const gate = formatQualiteGateSection(aggregate);
  if (next.includes('## Gate qualité rédaction')) {
    next = next.replace(/## Gate qualité rédaction[\s\S]*?(?=## Gate REVIEW|## |$)/, gate);
  } else if (next.includes('## Gate REVIEW')) {
    next = next.replace('## Gate REVIEW', `${gate}## Gate REVIEW`);
  } else if (reports.length > 0 || aggregate.stats.total > 0) {
    next = `${next.trimEnd()}\n\n${gate}`;
  }

  // Checklist
  if (next.includes('## Gate REVIEW')) {
    if (!next.includes('Qualité rédaction')) {
      next = next.replace(
        '## Gate REVIEW\n\n',
        `## Gate REVIEW\n\n- [ ] Qualité rédaction (${aggregate.decision}) — mots accolés / typos\n`,
      );
    } else {
      next = next.replace(
        /- \[ \] Qualité rédaction \([^)]+\)[^\n]*/,
        `- [ ] Qualité rédaction (${aggregate.decision}) — mots accolés / typos`,
      );
    }
  }

  return { markdown: next, reports: [aggregate, ...reports], changed: next !== md };
}

const files = walkMd(DIR);
const rows: Array<{
  file: string;
  decision: string;
  glue: number;
  ortho: number;
  punct: number;
  total: number;
  changed: boolean;
  brokenUrl: boolean;
}> = [];

let writeCount = 0;
for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const brokenUrl = /https?:\s+\/\//.test(raw) || /\?\s+utm_/.test(raw);
  const { markdown, reports, changed } = rewriteDraft(raw);
  const agg = reports[0]!;
  rows.push({
    file: relative(DIR, file),
    decision: agg.decision,
    glue: agg.stats.glue,
    ortho: agg.stats.ortho,
    punct: agg.stats.punct,
    total: agg.stats.total,
    changed,
    brokenUrl,
  });
  if (WRITE && changed) {
    writeFileSync(file, markdown, 'utf8');
    writeCount++;
  }
}

const summary = {
  dir: DIR,
  write: WRITE,
  files: files.length,
  writeCount,
  brokenUrlBefore: rows.filter((r) => r.brokenUrl).length,
  glueTotal: rows.reduce((s, r) => s + r.glue, 0),
  fixFirst: rows.filter((r) => r.decision === 'FIX-FIRST').length,
  ship: rows.filter((r) => r.decision === 'SHIP').length,
  rows: rows.filter((r) => r.brokenUrl || r.glue > 0 || r.changed || r.decision === 'FIX-FIRST'),
};

if (JSON_OUT) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(`# Qualité rédaction batch`);
  console.log(`dir=${DIR}`);
  console.log(`files=${files.length} · write=${WRITE} · wrote=${writeCount}`);
  console.log(`brokenUrl(before)=${summary.brokenUrlBefore} · glue=${summary.glueTotal}`);
  console.log(`SHIP=${summary.ship} · FIX-FIRST=${summary.fixFirst}`);
  console.log('');
  console.log('| Fichier | Tag | glue | ortho | punct | URL cassée | changed |');
  console.log('|---------|-----|------|-------|-------|------------|---------|');
  for (const r of summary.rows.slice(0, 40)) {
    console.log(
      `| ${r.file} | ${r.decision} | ${r.glue} | ${r.ortho} | ${r.punct} | ${r.brokenUrl ? 'oui' : 'non'} | ${r.changed ? 'oui' : 'non'} |`,
    );
  }
  if (summary.rows.length > 40) console.log(`_… ${summary.rows.length - 40} autres_`);
}

// unused import guard: applyQualiteToDraftMarkdown kept for API parity consumers
void applyQualiteToDraftMarkdown;
