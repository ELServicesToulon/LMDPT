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

## Workspace Cursor (multi-root)

Ouvrir **`lmdpt.code-workspace`** (repo + hub Manusk `projects/lmdpt` + vault second-brain + `Mediconvoi/backend` pour deploy).

Alternative : dossier racine dans `mediconvoi.code-workspace` (monorepo Mediconvoi).

## Démarrage local

```bash
npm install
npm run dev          # http://localhost:4321
npm test
npm run sync:data    # rafraîchir le cache open data
npm run import:elections  # départements 2017+2022 + geo SVG
npm run import:dept-2022  # régénérer JSON départements 2022 (TXT data.gouv.fr)
npm run import:dept-2017    # régénérer JSON départements 2017 (XLS data.gouv.fr)
npm run build:geo           # paths SVG départements (carte)
npm run build        # sync + build statique → dist/
```

Node **≥ 22.12**.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Accueil + hero + mission |
| `/atlas` | Sélecteur d'élections |
| `/atlas/2027-presidentielle` | Projection 2027 1er tour (placeholder + pluralité + liens AN1T) |
| `/atlas/2017-presidentielle` | Résultats 1er tour 2017 + carte départements |
| `/atlas/2022-presidentielle` | Résultats 1er tour 2022 + distorsion 2nd tour + carte |
| `/analyses` | Index des dossiers thématiques |
| `/analyses/presidentielle-distorsion` | Distorsion 1er / 2nd tour (2017, 2022) |
| `/analyses/legislatives-2024-desistements` | Dossier désistements législatives 2024 |
| `/mentions-legales` | Mentions légales |
| `/confidentialite` | Politique de confidentialité |
| `/a-propos` | Charte éditoriale + méthodologie |
| `/sources` | Jeux data.gouv.fr, horodatage |

## Structure

```text
src/
  components/   # visualisations (bar chart, carte SVG départements)
  data/elections/  # JSON résultats officiels (2017, 2022)
  data/geo/     # paths SVG départements (build:geo)
  data/analyses/  # dossiers thématiques (ex. législatives 2024)
  lib/          # client data.gouv, elections, cache, mapping
  pages/        # routes Astro (atlas, à propos…)
  layouts/
scripts/        # sync-data, import départements, build-dept-svg
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
