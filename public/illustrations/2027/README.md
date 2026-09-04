# Visuels Élection 2027 — Le Média du Premier Tour

Assets pour illustrer le **premier tour** et la ligne **Democracy Over Elimination**.

## Style (2026-09-04)

**Encre épique (registre médiéval original)** : parchemin d’orage, silhouettes à capuche,
coffre ferré (urne), siège de pierre, bannières **vides**, corbeaux, table de cartes.
Inspiré du climat « maisons / pouvoir / pluralité » — **pas** de logos HBO, **pas** de
sigils de fiction (loup, lion, dragon, cerf, kraken), **pas** de trône d’épées,
**pas** de ressemblance de personnages, **pas** de signes religieux, **pas** de lettres ni chiffres.
Les *mécanismes* électoraux seulement — jamais de caricature de camp ni de personnalités nommées.

## Rotation quotidienne (P17 · 2026-07-22)

- Registry : [`visual-daily-pool.json`](./visual-daily-pool.json) — **≥ 7** sets (timezone `Europe/Paris`)
- Lib : `src/lib/visual-daily.ts` · composant `DailyVisuals.astro`
- Sélection : `epochDays(Paris) % N` — change chaque jour **sans** redeploy
- `hybrid/` branché dans le pool
- Une seule MP4 hero pour l’instant ; posters + galeries varient par jour

## Fichiers

| Fichier | Sujet |
|---------|--------|
| `hero-premier-tour-2027.jpg` / `.webp` | Hero (bannières vides, coffre ferré, siège) |
| `democracy-over-elimination.jpg` | Portail grillagé / chaîne brisée (DOE) |
| `pluralite-1er-tour.jpg` | Coffre ferré débordant de bulletins |
| `dessin-urne-2027.jpg` | Coffre du scrutin + silhouettes |
| `photo-citoyens-data-2027.jpg` | Rouleaux, sceaux vides, table de cartes |
| `meme-*.jpg` | Croquis partageables (même registre, sans texte) |
| `illustration-voix-egales.jpg` | Balance de hall + parchemins |
| `hybrid/*.jpg` | Sets hybrides (inclus rotation) |
| `visual-daily-pool.json` | Calendrier des sets |

**Animations hero** :
- `/videos/2027/hero-voting-animation.mp4` (6s, push-in croquis couleur — sets pairs)
- `/videos/2027/hero-urne-nb-croquis.mp4` (6s, encre **orage sans texte** — sets impairs)
- Poster N&B : `hero-urne-nb-croquis-2026-07-25.jpg` / `.webp`
- **Quotidien scoop** (forcé) : `npm run hero:daily` → `hero-daily-live.mp4` + `hero-daily-override.json`  
  Timer **07:40 Europe/Paris** (reco Directrice) : `bash scripts/install-hero-daily-timer.sh`

Archive pré-croquis : `archive-pre-croquis-2026-07-18/`

## PRINCIPE ABSOLU DE LAÏCITÉ (non négociable)

- Aucun signe religieux ostentatoire dans AUCUNE illustration.
- Tenues quotidiennes neutres uniquement.
- Pas de logo de parti, pas de caricature de personnalités nommées.
- Sauf live YouTube (exception documentée ailleurs).

Générés 2026-07-18 — croquis X humoristiques (remplacés).
Restylés 2026-09-04 — encre épique originale (`scripts/hero-daily-sketch.py`).
Rotation quotidienne 2026-07-22 (P17).
