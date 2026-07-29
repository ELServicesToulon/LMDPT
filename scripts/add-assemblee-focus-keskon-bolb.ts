#!/usr/bin/env tsx
/**
 * Focus égal (Président) — Nathan Keskon + Ali Babal (@BolbBilal) + Jack Le Fou (@JackLeFouX)
 * même niveau de curation que Casus Lady. N=577 : remplace élus bas signal.
 *
 * Sources publiques : YouTube about, X, alibabal.fr, Causeur (Apostats 2.0), entretiens.
 * Usage : npx tsx scripts/add-assemblee-focus-keskon-bolb.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src/data/assemblee-influenceurs.json');
const OVERRIDES = path.join(ROOT, 'src/data/assemblee-audience-overrides.json');
const WATCH = path.join(ROOT, 'src/data/assemblee-stance-veille-watchlist.json');
const TOTAL = 577;

const REPLACE_IDS = [
  'wd-depute-q30490415', // Sophie Mette
  'wd-depute-q30506490', // Stella Dupont
  'wd-depute-q3501943', // Stéphane Mazars
];

const ENTRIES = [
  {
    id: 'nathan-keskon',
    display_name: 'Nathan Keskon',
    handle: 'nathankeskon69',
    platforms: [
      {
        kind: 'youtube',
        label: 'YouTube @nathankeskon69',
        url: 'https://www.youtube.com/@nathankeskon69',
      },
    ],
    summary:
      'Nathan Keskon — société civile (débats YouTube). Formats longs de confrontation : islam, gauche / LFI, transidentité, philosophie vs pragmatisme. Même écosystème que Casus Lady / Jack le fou (débats croisés documentés sur sa chaîne). Teinte pédagogique provisoire : autre / liberté d’expression & critique religieuse (confiance basse) — fiction LMDPT, pas une carte d’adhésion.',
    stance: {
      status: 'estime' as const,
      family: 'autre',
      label: 'Autre / transversal',
      confidence: 0.4,
      rationale:
        'Focus égal Casus Lady : contenu dominant = débats publics (islam, « gauchistes », société). Pas d’affiliation partisane déclarée sourcée. Zone pédagogique liberté d’expression / laïcité critique — à recouper.',
      sources: [
        {
          label: 'YouTube — Nathan Keskon (@nathankeskon69)',
          url: 'https://www.youtube.com/@nathankeskon69',
        },
        {
          label: 'Chaîne — annonces débats Casus Lady / Islam (posts publics)',
          url: 'https://www.youtube.com/@nathankeskon69',
        },
      ],
    },
    stance_history: [
      {
        as_of: '2024+',
        family: 'autre',
        label: 'Autre / transversal',
        status: 'estime',
        confidence: 0.4,
        motifs: [
          'Chaîne centrée sur des débats filmés (islam, gauche, société) — présence publique depuis 2016.',
          'Annonces de plateaux croisés avec Casus Lady et d’autres figures du circuit débats / apostasie.',
        ],
        sources: [
          {
            label: 'YouTube @nathankeskon69 (about / posts)',
            url: 'https://www.youtube.com/@nathankeskon69',
          },
        ],
      },
    ],
    dependencies: [],
    verification: 'partial',
    category: 'societe-civile',
    followers: 2440,
    primary_platform: 'youtube',
    audience_note: 'YouTube ~2,44 k abonnés (ordre public about page 2026-07) — focus éditorial égal Casus, pas un inflation d’audience.',
  },
  {
    id: 'ali-babal-bolb-bilal',
    display_name: 'Ali Babal (Bolb Bilal)',
    handle: 'BolbBilal',
    platforms: [
      {
        kind: 'x',
        label: 'X @BolbBilal',
        url: 'https://x.com/BolbBilal',
      },
      {
        kind: 'youtube',
        label: 'YouTube Sagesse d’islam — Ali Babal',
        url: 'https://www.youtube.com/channel/UCUjOwNF48zS5Cq3dh_nUyKA',
      },
      {
        kind: 'site',
        label: 'Site alibabal.fr',
        url: 'https://alibabal.fr/',
      },
    ],
    summary:
      'Ali Babal (X @BolbBilal, plume Cheikh Ali) — apostat de l’islam, débats TikTok/YouTube/X et livres (Incroyable Islam, Incroyable Coran). Chaîne « Sagesse d’islam » : décorticage Coran / hadiths / fiqh ; espace pour ex-croyants. Même circuit public que Casus Lady / Jack le fou (critiques croisées, plateaux). Teinte pédagogique : autre / laïcité & liberté de critique religieuse — pas une carte RN ni partisane.',
    stance: {
      status: 'estime' as const,
      family: 'autre',
      label: 'Autre / transversal',
      confidence: 0.45,
      rationale:
        'Focus égal Casus Lady : plaidoyer public = critique rationnelle de l’islam + apostasie + lutte contre les MGF (site). Titres de débats parfois ironiques (« idiot du RN ») ≠ affiliation. Confiance modérée-basse.',
      sources: [
        { label: 'X @BolbBilal', url: 'https://x.com/BolbBilal' },
        { label: 'Site — Ali Babal', url: 'https://alibabal.fr/' },
        {
          label: 'Causeur — Apostats 2.0 (portrait journalistique)',
          url: 'https://www.causeur.fr/apostats-2-0-318516',
        },
        {
          label: 'Babelio — Cheikh Ali / Incroyable Islam',
          url: 'https://www.babelio.com/auteur/Cheikh-Ali/767676',
        },
      ],
    },
    stance_history: [
      {
        as_of: 'avant apostasie (revendiquée)',
        family: 'autre',
        label: 'Autre / transversal',
        status: 'estime',
        confidence: 0.35,
        motifs: [
          'Parcours personnel d’apostasie revendiqué publiquement (biographies site / portraits presse) — hors famille partisane 1er tour.',
        ],
        sources: [
          { label: 'alibabal.fr — bio', url: 'https://alibabal.fr/' },
        ],
      },
      {
        as_of: '2024-2025+',
        family: 'autre',
        label: 'Autre / transversal',
        status: 'estime',
        confidence: 0.45,
        motifs: [
          'Publication Incroyable Islam / Incroyable Coran ; chaîne Sagesse d’islam (~53,5 k abonnés YT, ordre public 2026-07).',
          'Débats quotidiens et présence X @BolbBilal ; articles presse sur le phénomène « Apostats 2.0 ».',
          'Focus LMDPT : liberté de critique religieuse / laïcité — voisinage pédagogique Casus Lady, sans forcer une teinte droite nationale.',
        ],
        sources: [
          {
            label: 'YouTube Sagesse d’islam (about)',
            url: 'https://www.youtube.com/channel/UCUjOwNF48zS5Cq3dh_nUyKA',
          },
          { label: 'Causeur — Apostats 2.0', url: 'https://www.causeur.fr/apostats-2-0-318516' },
          { label: 'X @BolbBilal', url: 'https://x.com/BolbBilal' },
        ],
      },
    ],
    dependencies: [],
    verification: 'partial',
    category: 'societe-civile',
    followers: 53500,
    primary_platform: 'youtube',
    audience_note: 'YouTube Sagesse d’islam ~53,5 k (about 2026-07) + X @BolbBilal — ordre pédagogique ; focus éditorial égal Casus (~68 k).',
  },
  {
    id: 'jack-le-fou',
    display_name: 'Jack Le Fou',
    handle: 'JackLeFouX',
    platforms: [
      {
        kind: 'x',
        label: 'X @JackLeFouX',
        url: 'https://x.com/JackLeFouX',
      },
      {
        kind: 'youtube',
        label: 'YouTube @JackLeFouX',
        url: 'https://www.youtube.com/@JackLeFouX',
      },
    ],
    summary:
      'Jack Le Fou (@JackLeFouX) — militant athée algérien, débats publics TikTok/YouTube/X sur l’islam sunnite, la liberté d’expression et la laïcité. Installé au Québec ; formats longs de confrontation textuelle (Coran / hadiths) avec croyants. Figure pivot du circuit Casus Lady / Ali Babal / Nathan Keskon. Teinte pédagogique : autre / liberté de critique religieuse — fiction LMDPT, pas une carte d’adhésion partisane.',
    stance: {
      status: 'estime' as const,
      family: 'autre',
      label: 'Autre / transversal',
      confidence: 0.45,
      rationale:
        'Focus égal Casus Lady : plaidoyer public = critique de l’islam sunnite + liberté d’expression (entretiens / plateformes). Accusations croisées d’« extrême droite » dans certaines analyses militants ≠ affiliation déclarée sourcée. Confiance modérée-basse.',
      sources: [
        { label: 'X @JackLeFouX', url: 'https://x.com/JackLeFouX' },
        { label: 'YouTube @JackLeFouX', url: 'https://www.youtube.com/@JackLeFouX' },
        {
          label: 'Le Précepteur — entretien Jack Le Fou (podcast)',
          url: 'https://podcasts.apple.com/ie/podcast/entretien-jack-le-fou-son-combat-contre-lislam-sunnite/id1534272032?i=1000654422795',
        },
        {
          label: 'Elo veut savoir — Jack Le Fou & Casus Lady (balado)',
          url: 'https://www.eloveutsavoir.com/balado-jack-le-fou-et-casus-lady-islam-apostasie-et-incoherences-religieuses/',
        },
      ],
    },
    stance_history: [
      {
        as_of: 'Clubhouse / Algérie → Québec',
        family: 'autre',
        label: 'Autre / transversal',
        status: 'estime',
        confidence: 0.4,
        motifs: [
          'Débats en arabe sur Clubhouse puis migration au Québec — récit public d’exil pour la liberté de parole.',
          'Ligne athée / anti-autorité religieuse revendiquée dans entretiens.',
        ],
        sources: [
          {
            label: 'Entretiens publics (Le Précepteur / presse podcast)',
            url: 'https://podcasts.apple.com/ie/podcast/entretien-jack-le-fou-son-combat-contre-lislam-sunnite/id1534272032?i=1000654422795',
          },
        ],
      },
      {
        as_of: '2023-2026',
        family: 'autre',
        label: 'Autre / transversal',
        status: 'estime',
        confidence: 0.45,
        motifs: [
          'Viralité TikTok/YouTube des débats quotidiens sur l’islam sunnite ; chaîne @JackLeFouX (~83 k abonnés YT, ordre public 2026-07).',
          'Companonnage public avec Casus Lady (débats croisés ; lectures divergentes selon les observateurs).',
          'Focus LMDPT : liberté d’expression / critique religieuse — voisinage Ali Babal & Nathan Keskon, sans forcer une teinte droite nationale.',
        ],
        sources: [
          { label: 'YouTube @JackLeFouX (about)', url: 'https://www.youtube.com/@JackLeFouX' },
          { label: 'X @JackLeFouX', url: 'https://x.com/JackLeFouX' },
          {
            label: 'Balado Elo — Jack Le Fou & Casus Lady',
            url: 'https://www.eloveutsavoir.com/balado-jack-le-fou-et-casus-lady-islam-apostasie-et-incoherences-religieuses/',
          },
        ],
      },
    ],
    dependencies: [],
    verification: 'partial',
    category: 'societe-civile',
    followers: 82900,
    primary_platform: 'youtube',
    audience_note:
      'YouTube @JackLeFouX ~82,9 k abonnés (about 2026-07) + X @JackLeFouX — devant Casus (~68 k) ; focus éditorial égal du cluster.',
  },
];

function main() {
  const raw = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const existing = new Set(raw.influencers.map((i: { id: string }) => i.id));

  for (const e of ENTRIES) {
    if (existing.has(e.id)) {
      // refresh curated fields
      const idx = raw.influencers.findIndex((i: { id: string }) => i.id === e.id);
      const { followers, primary_platform, audience_note, ...rest } = e;
      raw.influencers[idx] = { ...raw.influencers[idx], ...rest };
      console.log('updated', e.id);
    }
  }

  const toAdd = ENTRIES.filter((e) => !existing.has(e.id));
  if (toAdd.length) {
    const remove = REPLACE_IDS.filter((id) => existing.has(id)).slice(0, toAdd.length);
    if (remove.length < toAdd.length) {
      throw new Error(`Need ${toAdd.length} free seats, only ${remove.length} replace ids present`);
    }
    raw.influencers = raw.influencers.filter((i: { id: string }) => !remove.includes(i.id));
    for (const e of toAdd) {
      const { followers, primary_platform, audience_note, ...rest } = e;
      raw.influencers.push(rest);
      console.log('added', e.id, 'replaced one of', remove);
    }
  }

  if (raw.influencers.length !== TOTAL) {
    throw new Error(`Expected ${TOTAL}, got ${raw.influencers.length}`);
  }

  if (!String(raw.methodology_note).includes('P46c')) {
    raw.methodology_note +=
      ' P46c : focus égal Nathan Keskon + Ali Babal (@BolbBilal) + Jack Le Fou (@JackLeFouX) — même curation que Casus Lady (écosystème débats / apostasie / liberté d’expression).';
  }
  raw.updated = '2026-07-28';
  fs.writeFileSync(DATA, JSON.stringify(raw, null, 2) + '\n');

  const ov = JSON.parse(fs.readFileSync(OVERRIDES, 'utf8'));
  ov.by_id = ov.by_id || {};
  for (const e of ENTRIES) {
    ov.by_id[e.id] = {
      followers_total: e.followers,
      primary_platform: e.primary_platform,
      status: 'estimate',
      note: e.audience_note,
    };
  }
  // clarify Casus note (pas confondre avec Ali Babal)
  if (ov.by_id['casus-lady']) {
    ov.by_id['casus-lady'].note =
      'TikTok ~50–70k / YouTube ~47–50k (ordres publics 2025–2026). Focus éditorial partagé avec Nathan Keskon, Ali Babal (@BolbBilal) et Jack Le Fou (@JackLeFouX).';
  }
  fs.writeFileSync(OVERRIDES, JSON.stringify(ov, null, 2) + '\n');

  if (fs.existsSync(WATCH)) {
    const w = JSON.parse(fs.readFileSync(WATCH, 'utf8'));
    const have = new Set(w.entries.map((x: { id: string }) => x.id));
    for (const e of ENTRIES) {
      const entry = {
        id: e.id,
        display_name: e.display_name,
        expected_family: e.stance.family,
        previous_families: [],
        priority: 'high',
        notes:
          'Focus égal Casus Lady — écosystème débats / critique islam / liberté d’expression. Réviser si affiliation partisane sourcée.',
        watch_urls: e.platforms.map((p) => p.url),
      };
      if (have.has(e.id)) {
        const i = w.entries.findIndex((x: { id: string }) => x.id === e.id);
        w.entries[i] = { ...w.entries[i], ...entry };
      } else {
        w.entries.push(entry);
      }
    }
    fs.writeFileSync(WATCH, JSON.stringify(w, null, 2) + '\n');
  }

  const civ = raw.influencers.filter((i: { category?: string }) => i.category === 'societe-civile')
    .length;
  console.log(
    JSON.stringify(
      {
        total: raw.influencers.length,
        civile: civ,
        ids: ENTRIES.map((e) => e.id),
      },
      null,
      2,
    ),
  );
}

main();
