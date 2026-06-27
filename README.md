# Le Média du Premier Tour (LMDPT)

> **Democracy Over Elimination** — média civique, premier tour, faits sourcés via open data.

Couvrir le premier tour avec des données publiques officielles (`data.gouv.fr`), sans éliminer ni caricaturer — la démocratie avant le spectacle.

- **Dépôt** : [github.com/ELServicesToulon/LMDPT](https://github.com/ELServicesToulon/LMDPT)
- **Site** : [elservicestoulon.github.io/LMDPT](https://elservicestoulon.github.io/LMDPT/) (GitHub Pages, après activation du workflow)
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
| `/` | Accueil + manifeste |
| `/sources` | Jeux de données mappés, liens `data.gouv.fr`, horodatage |

## Structure

```text
src/
  lib/          # client data.gouv, cache, mapping datasets
  pages/        # routes Astro
  layouts/
scripts/        # sync-data.ts
data/cache/     # manifeste régénérable (gitignored)
docs/           # éditorial, prompt Cursor
```

## Déploiement

Push sur `Main` → workflow GitHub Actions (`.github/workflows/deploy.yml`) : tests, `sync:data`, build, publication GitHub Pages.

Première fois : **Settings → Pages → Source : GitHub Actions** (si le workflow ne s’active pas seul).

Variables build CI : `ASTRO_SITE` + `ASTRO_BASE=/LMDPT/` pour le sous-chemin Pages.

## Principes éditoriaux (résumé)

- Traçabilité : source + date pour chaque donnée
- Pas de sondages présentés comme vérité ; pas de tier list candidats
- Comparaisons factuelles sans classement éliminatoire
- Revue humaine avant publication automatique (Phase 3)

## Licence

Code du site : à définir. Données tierces : licences open data par ressource (voir page Sources).
