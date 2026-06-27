# Prompt Cursor — Le Média du Premier Tour

Tu travailles sur **Le Média du Premier Tour** (`le-media-du-premier-tour`).

## Mission

Média civique **Democracy Over Elimination** : premier tour, faits sourcés via open data (`data.gouv.fr`), sans classement éliminatoire.

## Stack

- **Astro 7** + TypeScript strict
- Client HTTP `src/lib/datagouv.ts` (lecture seule, sans clé API)
- Cache `data/cache/sources-manifest.json` via `npm run sync:data`
- Ligne éditoriale : `docs/EDITORIAL.md`

## Règles

- Traçabilité : chaque donnée affichée → lien data.gouv.fr + horodatage
- Pas de sondages présentés comme vérité ; pas de tier list candidats
- Diff minimal ; tests `npm test` ; build `npm run build`
- Deploy / domaine `.fr` = décision L1+ humaine

## API data.gouv.fr

- Racine : `https://www.data.gouv.fr/api/1/`
- Catalogue : `GET /site/catalog?q=…`
- Dataset : `GET /datasets/{id}/`
- Préférer les **IDs techniques** aux slugs dans les scripts durables

## Commandes

```bash
npm run dev          # dev local
npm run sync:data    # rafraîchir le cache open data
npm test             # vitest
npm run build        # sync + build statique
```
