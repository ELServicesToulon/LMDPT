# Dépendances — Le Média du Premier Tour

Pin et risques, audit 2026-08-25 (plan upgrade).

## Runtime (`astro build` → nginx statique)

| Paquet | Range | Notes |
|---|---|---|
| `astro` | `^7.2.7` | Site SSG. L’image prod est `nginx:alpine` sur `dist/`. |

Node : `>=22.12.0` (`.nvmrc` 22.23.1).

## Dev / scripts

| Paquet | Range | Notes |
|---|---|---|
| `tsx` | `^4.23.12` | Scripts d’import / sync. |
| `vitest` | `^4.1.11` | Tests unitaires `src/**/*.test.ts`. Config minimale (`environment: node`). |
| `xlsx` | `^0.18.5` | **Import only** — voir ci-dessous. |

## `xlsx` (SheetJS community)

Dernière version **publique npm** : `0.18.5`. SheetJS ≥0.20 n’est plus publié sur le registry npm public.

CVE documentées sur 0.18.5 (prototype pollution, ReDoS). **Mitigations LMDPT** :

1. `xlsx` est un `devDependency` — absent du `dist/` et du container nginx.
2. Usage limité à `scripts/import-presidentielle-2017-departements.ts` et `scripts/import-legislatives-2024.ts` (fichiers Ministère / data.gouv, pas d’upload utilisateur).
3. `npm run build` n’appelle pas ces scripts (`sync:all && astro build`).

Ne pas déplacer `xlsx` dans `dependencies`. Alternative future : `exceljs` (xlsx moderne) + conversion one-shot du XLS 2017, ou CSV Intérieur s’il est publié.

## Hero daily (Python, hors npm)

Pipeline `scripts/hero-daily-video.mjs` → `hero-daily-sketch.py`. Présent sur KS-5-B (2026-08-26) :

| Outil | Rôle |
|---|---|
| `pycairo` (`import cairo`) | Croquis N&B — 1.25.1 |
| Pillow (`from PIL import Image`) | Poster JPEG — 10.2.0 |
| `ffmpeg` | Ken Burns → mp4 |
| `cwebp` | WebP poster (optionnel) |

Pas d’install dans le timer systemd : ces paquets doivent déjà être sur l’hôte.

## Canon git

Le working tree ops est `/home/debian/iarbre/le-media-du-premier-tour` (clone `ELServicesToulon/LMDPT`). Le submodule `ks5b/iarbre/le-media-du-premier-tour` est **stale** — ne plus y écrire en premier.
