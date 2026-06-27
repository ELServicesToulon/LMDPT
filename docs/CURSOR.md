# Prompt Cursor — Le Média du Premier Tour

Tu travailles sur **Le Média du Premier Tour** (`le-media-du-premier-tour` / [LMDPT](https://github.com/ELServicesToulon/LMDPT)).

## Mission

Média civique indépendant **Democracy Over Elimination** :

- Représenter exhaustivement les résultats du **premier tour** (présidentielles, législatives).
- Montrer que le 1er tour est la photographie la plus fidèle de la pluralité nationale.
- Quantifier la **distorsion** 1er → 2nd tour (désistements, vote stratégique, barrage).
- Promouvoir une culture du **vote d'adhésion** — sans moraliser le vote tactique.
- Rester **strictement neutre** et data-driven (sources officielles uniquement).

Tagline : *Le premier tour : le miroir le plus fidèle de la France politique. Pour une démocratie où l'on vote pour, et non contre.*

## Stack (décision prise — ne pas migrer vers Next.js sans arbitrage L1+)

- **Astro 7** + TypeScript strict
- Données électorales **statiques** versionnées (`src/data/elections/*.json`) — performance + traçabilité
- Client catalogue `src/lib/datagouv.ts` (API v1, sans clé) + `npm run sync:data`
- Visualisations MVP : composants Astro + CSS (pas de Plotly/Leaflet tant que le besoin n'est pas prouvé)
- Hébergement : **GitHub Pages** (`ASTRO_BASE=/LMDPT/` en CI)
- Ligne éditoriale : `docs/EDITORIAL.md`

## Structure cible

```text
src/
  components/       # ResultsBarChart, NationalSummary…
  data/elections/   # JSON officiels (national, puis départements)
  lib/              # datagouv, elections, sources
  pages/
    atlas/          # Atlas interactif
    a-propos.astro
    sources.astro
scripts/
  sync-data.ts      # cache catalogue data.gouv.fr
  import-election/  # futurs scripts d'import CSV → JSON
docs/
  EDITORIAL.md
  GROK-AGENT-PROMPT.md
```

## Pipeline données (approche Grok validée)

1. Télécharger une fois les CSV/Excel officiels (data.gouv.fr ou archives Ministère de l'Intérieur).
2. Nettoyer et normaliser (nuances, codes geo, % exprimés/inscrits).
3. Exporter en JSON dans `src/data/elections/`.
4. Citer la source dans chaque JSON (`source`, `source_label`).
5. Page `/sources` + bloc méthodologie sur chaque dossier Atlas.

**Priorité datasets** : présidentielle 2022 (✅ national), puis 2017, législatives 2024, cartes départementales.

## Règles éditoriales & code

- Traçabilité : source + date pour chaque chiffre affiché
- **Pas de tier list**, pas de notation subjective présentée comme objective
- Pas de sondages comme vérité
- Diff minimal ; `npm test` + `npm run build` avant claim OK
- Deploy / domaine `.fr` = décision L1+ humaine

## MVP restant (Phase 2)

- [ ] Import CSV départements 2022 + carte
- [ ] Dossier analyse longue `/analyses/2022-presidentielle`
- [ ] Législatives 2024 (impact désistements)
- [ ] Mentions légales (Phase 3)

## Commandes

```bash
npm run dev          # http://localhost:4321
npm run sync:data    # cache open data
npm test
npm run build        # sync + build statique
```

## Agents Grok complémentaires

Prompt agent Grok dédié LMDPT : `docs/GROK-AGENT-PROMPT.md` (≤ 4 000 caractères).
