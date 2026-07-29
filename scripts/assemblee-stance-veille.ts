#!/usr/bin/env tsx
/**
 * Bot veille « changements d’avis » — assemblée influenceurs LMDPT.
 *
 * Compare watchlist vs teinte courante du dataset ; produit un rapport
 * vault + filet d’alerte (drift). N’applique pas de scrape live (extraction
 * conforme : revue humaine + patch JSON sourcé).
 *
 * Usage :
 *   npx tsx scripts/assemblee-stance-veille.ts
 *   npx tsx scripts/assemblee-stance-veille.ts --json
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src/data/assemblee-influenceurs.json');
const WATCH = path.join(ROOT, 'src/data/assemblee-stance-veille-watchlist.json');
const VAULT_OUT = '/home/debian/second-brain/projects/lmdpt/assemblee-influenceurs/stance-veille';

type WatchEntry = {
  id: string;
  display_name: string;
  expected_family: string;
  previous_families?: string[];
  priority?: string;
  notes?: string;
  watch_urls?: string[];
};

const args = new Set(process.argv.slice(2));
const JSON_OUT = args.has('--json');

function main() {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const watch = JSON.parse(fs.readFileSync(WATCH, 'utf8'));
  const byId = new Map(data.influencers.map((i: { id: string }) => [i.id, i]));

  const drifts: Array<Record<string, unknown>> = [];
  const ok: Array<Record<string, unknown>> = [];
  const missing: string[] = [];
  const withHistory: Array<Record<string, unknown>> = [];

  for (const w of watch.entries as WatchEntry[]) {
    const inf = byId.get(w.id) as
      | {
          stance: { family: string; label: string };
          stance_history?: unknown[];
          summary: string;
        }
      | undefined;
    if (!inf) {
      missing.push(w.id);
      continue;
    }
    const current = String(inf.stance.family);
    const row = {
      id: w.id,
      name: w.display_name,
      expected: w.expected_family,
      current,
      label: inf.stance.label,
      has_history: Array.isArray(inf.stance_history) && inf.stance_history.length > 0,
      history_len: Array.isArray(inf.stance_history) ? inf.stance_history.length : 0,
      priority: w.priority || 'medium',
      notes: w.notes || '',
      watch_urls: w.watch_urls || [],
    };
    if (current !== w.expected_family) drifts.push(row);
    else ok.push(row);
    if (row.has_history) withHistory.push(row);
  }

  // Aussi : toute fiche avec stance_history (hors watchlist)
  for (const inf of data.influencers) {
    if (!Array.isArray(inf.stance_history) || !inf.stance_history.length) continue;
    if (watch.entries.some((w: WatchEntry) => w.id === inf.id)) continue;
    withHistory.push({
      id: inf.id,
      name: inf.display_name,
      current: inf.stance.family,
      history_len: inf.stance_history.length,
      priority: 'low',
      notes: 'Historique présent hors watchlist',
    });
  }

  const report = {
    schema: 'lmdpt-stance-veille-report-v1',
    motto: watch.motto,
    generated_at: new Date().toISOString(),
    watched: (watch.entries as WatchEntry[]).length,
    ok: ok.length,
    drifts: drifts.length,
    missing: missing.length,
    with_history: withHistory.length,
    drift_items: drifts,
    ok_items: ok,
    missing_ids: missing,
    history_items: withHistory,
    next_actions:
      drifts.length > 0
        ? [
            'Revue humaine des drift_items (sources publiques).',
            'Mettre à jour stance + stance_history.motifs dans assemblee-influenceurs.json.',
            'Aligner expected_family dans la watchlist après validation.',
          ]
        : [
            'Aucun drift watchlist — poursuivre la veille sourcée.',
            'Enrichir stance_history quand une bascule est documentée.',
          ],
  };

  fs.mkdirSync(VAULT_OUT, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const outJson = path.join(VAULT_OUT, `report-${stamp}.json`);
  const outMd = path.join(VAULT_OUT, `report-${stamp}.md`);
  const latest = path.join(VAULT_OUT, 'latest.json');
  fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(latest, JSON.stringify(report, null, 2) + '\n');

  const md = [
    `# Veille changements d’avis — ${stamp}`,
    '',
    `> ${watch.motto}`,
    '',
    `- Watchlist : **${report.watched}**`,
    `- Alignés : **${report.ok}**`,
    `- Drifts : **${report.drifts}**`,
    `- Fiches avec historique : **${report.with_history}**`,
    '',
    '## Drifts (expected ≠ current)',
    '',
    drifts.length === 0
      ? '_Aucun._'
      : drifts
          .map(
            (d) =>
              `- **${d.name}** (\`${d.id}\`) : attendu \`${d.expected}\` · dataset \`${d.current}\` — ${d.notes}`,
          )
          .join('\n'),
    '',
    '## Historiques documentés',
    '',
    withHistory
      .map((h) => `- **${h.name}** — ${h.history_len} palier(s) · teinte \`${h.current}\``)
      .join('\n') || '_Aucun._',
    '',
    '## Prochaines actions',
    '',
    ...report.next_actions.map((a) => `- ${a}`),
    '',
    '_Synthèse documentaire — à recouper. Pas un score moral._',
    '',
  ].join('\n');
  fs.writeFileSync(outMd, md);

  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`stance-veille: ok=${report.ok} drifts=${report.drifts} history=${report.with_history}`);
    console.log(`report: ${outMd}`);
    if (drifts.length) {
      console.log('DRIFT:');
      for (const d of drifts) console.log(`  - ${d.name}: expected ${d.expected} → ${d.current}`);
    }
  }

  // exit 0 même avec drifts (alerte soft — revue humaine)
  process.exit(0);
}

main();
