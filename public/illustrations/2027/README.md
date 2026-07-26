# Visuels Élection 2027 — Le Média du Premier Tour

Assets pour illustrer le **premier tour** et la ligne **Democracy Over Elimination**.

## Style (2026-07-18)

**Croquis humoristiques style X** : encre noire + aquarelle, papier crème, esprit fil Twitter/X.
Légèreté sur les *mécanismes* électoraux — jamais de caricature de camp ni de personnalités nommées.

## Rotation quotidienne (P17 · 2026-07-22)

- Registry : [`visual-daily-pool.json`](./visual-daily-pool.json) — **≥ 7** sets (timezone `Europe/Paris`)
- Lib : `src/lib/visual-daily.ts` · composant `DailyVisuals.astro`
- Sélection : `epochDays(Paris) % N` — change chaque jour **sans** redeploy
- `hybrid/` branché dans le pool
- Une seule MP4 hero pour l’instant ; posters + galeries varient par jour

## Fichiers

| Fichier | Sujet |
|---------|--------|
| `hero-premier-tour-2027.jpg` / `.webp` | Hero (souvent poster webp LCP) |
| `democracy-over-elimination.jpg` | Flèches du 2e tour cassées |
| `pluralite-1er-tour.jpg` | Urne / confettis de bulletins |
| `dessin-urne-2027.jpg` | Urne + miroir « France » |
| `photo-citoyens-data-2027.jpg` | Open data 1er tour |
| `meme-*.jpg` | Mèmes croquis |
| `illustration-voix-egales.jpg` | Balance des voix |
| `hybrid/*.jpg` | Sets hybrides (inclus rotation) |
| `visual-daily-pool.json` | Calendrier des sets |

**Animations hero** :
- `/videos/2027/hero-voting-animation.mp4` (6s, push-in croquis couleur — sets pairs)
- `/videos/2027/hero-urne-nb-croquis.mp4` (6s, croquis encre **N&B sans texte** — sets impairs)
- Poster N&B : `hero-urne-nb-croquis-2026-07-25.jpg` / `.webp`
- **Quotidien scoop** (forcé) : `npm run hero:daily` → `hero-daily-live.mp4` + `hero-daily-override.json`  
  Timer **07:40 Europe/Paris** (reco Directrice) : `bash scripts/install-hero-daily-timer.sh`

Archive pré-croquis : `archive-pre-croquis-2026-07-18/`

## PRINCIPE ABSOLU DE LAÏCITÉ (non négociable)

- Aucun signe religieux ostentatoire dans AUCUNE illustration.
- Tenues quotidiennes neutres uniquement.
- Pas de logo de parti, pas de caricature de personnalités nommées.
- Sauf live YouTube (exception documentée ailleurs).

Générés 2026-07-18 — remplacement dessins réalistes → croquis X humoristiques.
Rotation quotidienne 2026-07-22 (P17).
