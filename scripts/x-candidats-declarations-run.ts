#!/usr/bin/env tsx
/**
 * Collecte les posts X des comptes officiels candidats (registre 2027)
 * et produit un fil chronologique pour le site LMDPT.
 *
 * Usage :
 *   npm run x:declarations
 *   npm run x:declarations -- --count 10
 *   npm run x:declarations -- --include-parties
 *
 * Lecture publique via FxEmbed (pas de clé requise).
 * Le follow des comptes se fait à part : Mediconvoi backend
 *   npm run lmdpt-x-follow-candidats
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseXCreatedAt,
  sortDeclarationsChrono,
  type XDeclarationItem,
  type XDeclarationsSnapshot,
} from '../src/lib/x-declarations';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = join(ROOT, 'src/data/elections/2027-x-officiels.json');
const OUT = join(ROOT, 'src/data/elections/x-declarations-latest.json');
const FX = process.env.LMDPT_FX_API_BASE?.trim() || 'https://api.fxtwitter.com';

interface Registry {
  candidates: Array<{ slug: string; name: string; handle: string | null }>;
  parties?: Array<{ id: string; label: string; handle: string | null }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchProfileStatuses(
  handle: string,
  count: number,
): Promise<Array<{ id: string; text: string; created_at?: string; url?: string }>> {
  const clean = handle.replace(/^@/, '');
  const url = `${FX}/2/profile/${encodeURIComponent(clean)}/statuses?count=${count}`;
  const res = await fetch(url);
  const text = await res.text();
  let body: { code?: number; results?: Array<Record<string, unknown>>; message?: string };
  try {
    body = JSON.parse(text) as typeof body;
  } catch {
    throw new Error(`FxEmbed non-JSON (${res.status})`);
  }
  if (!res.ok || (body.code && body.code !== 200)) {
    throw new Error(body.message || `FxEmbed ${body.code ?? res.status}`);
  }
  return (body.results ?? [])
    .filter((r) => r.type === 'status' && r.id && r.text)
    .map((r) => ({
      id: String(r.id),
      text: String(r.text),
      created_at: r.created_at ? String(r.created_at) : undefined,
      url: r.url ? String(r.url) : `https://x.com/${clean}/status/${r.id}`,
    }));
}

async function main(): Promise<void> {
  const includeParties = process.argv.includes('--include-parties');
  const countIdx = process.argv.indexOf('--count');
  const count = countIdx >= 0 ? Number(process.argv[countIdx + 1]) || 12 : 12;

  const registry = JSON.parse(readFileSync(REGISTRY, 'utf8')) as Registry;
  const accounts: Array<{
    handle: string;
    slug: string;
    name: string;
    source: 'candidate' | 'party';
  }> = [];

  for (const c of registry.candidates) {
    if (!c.handle) continue;
    accounts.push({
      handle: c.handle,
      slug: c.slug,
      name: c.name,
      source: 'candidate',
    });
  }
  if (includeParties) {
    for (const p of registry.parties ?? []) {
      if (!p.handle) continue;
      accounts.push({
        handle: p.handle,
        slug: p.id,
        name: p.label,
        source: 'party',
      });
    }
  }

  // Dédup handles
  const seen = new Set<string>();
  const unique = accounts.filter((a) => {
    const k = a.handle.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  console.log(`Collecte X — ${unique.length} comptes · ${count} posts max/compte`);

  const items: XDeclarationItem[] = [];
  const errors: NonNullable<XDeclarationsSnapshot['errors']> = [];
  let accountsOk = 0;
  let accountsError = 0;

  for (const acc of unique) {
    try {
      const tweets = await fetchProfileStatuses(acc.handle, count);
      for (const t of tweets) {
        items.push({
          id: t.id,
          text: t.text,
          created_at: parseXCreatedAt(t.created_at),
          url: t.url || `https://x.com/${acc.handle}/status/${t.id}`,
          handle: acc.handle,
          slug: acc.slug,
          name: acc.name,
          source: acc.source,
        });
      }
      accountsOk += 1;
      console.log(`  OK @${acc.handle} — ${tweets.length} posts`);
      await sleep(350);
    } catch (err) {
      accountsError += 1;
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ handle: acc.handle, slug: acc.slug, message });
      console.warn(`  ERR @${acc.handle}: ${message.slice(0, 100)}`);
      await sleep(500);
    }
  }

  const chrono = sortDeclarationsChrono(items, 'desc');
  const snapshot: XDeclarationsSnapshot = {
    title: 'Déclarations X des candidats — fil chronologique',
    updated: new Date().toISOString().slice(0, 10),
    fetched_at: new Date().toISOString(),
    disclaimer:
      'Fil pédagogique LMDPT : posts publics des comptes X documentés comme officiels (personnalités / formations). Ce n’est ni un classement, ni une validation éditoriale du contenu. Sources secondaires (X) — Democracy Over Elimination.',
    method:
      'Collecte publique FxEmbed api.fxtwitter.com/2/profile/{handle}/statuses · registre 2027-x-officiels.json · tri par created_at décroissant',
    follow_account: null,
    accounts_ok: accountsOk,
    accounts_error: accountsError,
    items: chrono,
    errors: errors.length ? errors : undefined,
  };

  // Enrich follow account if state exists
  const followStatePath = join(
    ROOT,
    '../../manusk/second-brain/projects/lmdpt/social-drafts/x-follow-candidats-state.json',
  );
  if (existsSync(followStatePath)) {
    try {
      const st = JSON.parse(readFileSync(followStatePath, 'utf8')) as {
        account?: { username?: string };
      };
      if (st.account?.username) snapshot.follow_account = st.account.username;
    } catch {
      /* ignore */
    }
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(`\nOK → ${OUT}`);
  console.log(`Items : ${chrono.length} · comptes OK ${accountsOk} · erreurs ${accountsError}`);
  if (chrono[0]) {
    console.log(`Plus récent : @${chrono[0].handle} — ${chrono[0].created_at}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
