# Le Média du Premier Tour (LMDPT)

> **Democracy Over Elimination** — média civique, premier tour, faits sourcés via open data.

Couvrir le premier tour avec des données publiques officielles (`data.gouv.fr`), sans éliminer ni caricaturer — la démocratie avant le spectacle.

- **Dépôt** : [github.com/ELServicesToulon/LMDPT](https://github.com/ELServicesToulon/LMDPT)
- **Site** : [lmdpt.iarbre.org](https://lmdpt.iarbre.org) (sous-domaine iarbre.org, GitHub Pages)
- **Ligne éditoriale** : [`docs/EDITORIAL.md`](docs/EDITORIAL.md)

## Stack

- [Astro 7](https://astro.build) + TypeScript
- Client HTTP lecture seule `src/lib/datagouv.ts` (API `data.gouv.fr` v1, sans clé)
- Cache local `data/cache/sources-manifest.json` (`npm run sync:data`)
- Tests Vitest

## Démarrage local

```bash
npm install
npm run dev          # http://localhost:4321
npm test
npm run sync:data    # rafraîchir le cache open data
npm run build        # sync + build statique → dist/
```

Node **≥ 22.12**.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Accueil + hero + mission |
| `/atlas` | Sélecteur d'élections |
| `/atlas/2022-presidentielle` | Résultats 1er tour 2022 + distorsion 2nd tour |
| `/a-propos` | Charte éditoriale + méthodologie |
| `/sources` | Jeux data.gouv.fr, horodatage |

## Structure

```text
src/
  components/   # visualisations (bar chart, résumé national)
  data/elections/  # JSON résultats officiels
  lib/          # client data.gouv, elections, cache, mapping
  pages/        # routes Astro (atlas, à propos…)
  layouts/
scripts/        # sync-data.ts
data/cache/     # manifeste catalogue (gitignored)
docs/           # éditorial, prompt Cursor, agent Grok
```

## Déploiement

Push sur `Main` → workflow GitHub Actions (`.github/workflows/deploy.yml`) : tests, `sync:data`, build, publication GitHub Pages.

**Domaine** : `lmdpt.iarbre.org` — CNAME → `elservicestoulon.github.io` (zone Cloudflare `iarbre.org`, DNS only).

```bash
npm run dns:iarbre    # crée/met à jour le CNAME (jeton IARBE_CLOUDFLARE_API_TOKEN)
```

Variables build CI : `ASTRO_SITE=https://lmdpt.iarbre.org`, `ASTRO_BASE=/`.

## Principes éditoriaux (résumé)

- Traçabilité : source + date pour chaque donnée
- Pas de sondages présentés comme vérité ; pas de tier list candidats
- Comparaisons factuelles sans classement éliminatoire
- Revue humaine avant publication automatique (Phase 3)

## Licence

Code du site : à définir. Données tierces : licences open data par ressource (voir page Sources).
