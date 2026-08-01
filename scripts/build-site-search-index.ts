#!/usr/bin/env tsx
/**
 * Génère public/data/site-search-index.json
 * (pages core + sièges assemblée influenceurs pour le moteur header).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatFollowersFr,
  getAssembleeInfluenceursView,
  resolveAudience,
} from '../src/lib/assemblee-influenceurs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(ROOT, 'public', 'data');
const outFile = path.join(outDir, 'site-search-index.json');

const PAGES = [
  { title: 'Accueil', url: '/', kind: 'page', keywords: 'premier tour pluralité LMDPT' },
  { title: 'Atlas électoral', url: '/atlas', kind: 'page', keywords: 'cartes circonscriptions' },
  { title: 'Analyses', url: '/analyses', kind: 'page', keywords: 'dossiers' },
  {
    title: 'Assemblée 1er tour (AN1T)',
    url: '/analyses/assemblee-premier-tour',
    kind: 'page',
    keywords: 'simulation hémicycle sainte-laguë',
  },
  {
    title: 'Liberté d’expression',
    url: '/liberte-d-expression',
    kind: 'page',
    keywords: 'DOE censure plateformes',
  },
  {
    title: 'Observatoire de la censure',
    url: '/observatoire-censure',
    kind: 'page',
    keywords: 'sanctions médias influenceurs',
  },
  {
    title: 'Assemblée des influenceurs',
    url: '/assemblee-influenceurs',
    kind: 'page',
    keywords: 'hémicycle abonnés casus lady nathan keskon ali babal bolb bilal jack le fou',
  },
  { title: 'Débats', url: '/debats', kind: 'page', keywords: 'commentaires citoyens' },
  { title: 'Contribuer', url: '/contribuer', kind: 'page', keywords: 'suggestions alertes' },
  { title: 'Sources', url: '/sources', kind: 'page', keywords: 'open data' },
  { title: 'Charte', url: '/charte', kind: 'page', keywords: 'DOE éditorial' },
  { title: 'À propos', url: '/a-propos', kind: 'page', keywords: 'média civique' },
  { title: 'Soutenir', url: '/soutenir', kind: 'page', keywords: 'don' },
];

const view = getAssembleeInfluenceursView();
const people = view.influencers.map((inf) => {
  const aud = resolveAudience(inf);
  const kind =
    inf.category === 'elu-parlementaire'
      ? 'elu'
      : inf.category === 'societe-civile'
        ? 'societe-civile'
        : 'influenceur';
  return {
    title: inf.display_name,
    url: `/assemblee-influenceurs/?q=${encodeURIComponent(inf.display_name)}#hemicycle`,
    kind,
    keywords: [inf.handle, inf.stance.label, inf.category, formatFollowersFr(aud.followers_total)]
      .filter(Boolean)
      .join(' '),
    followers: aud.followers_total,
  };
});

const payload = {
  schema: 'lmdpt-site-search-v1',
  updated: new Date().toISOString().slice(0, 10),
  items: [...PAGES, ...people],
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(payload));
console.log(
  `site-search-index.json — ${payload.items.length} entrées → ${path.relative(ROOT, outFile)}`,
);
