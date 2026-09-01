# Visuels Élection 2027 — Le Média du Premier Tour

Assets pour illustrer le **premier tour** et la ligne **Democracy Over Elimination**.

## Style

**Croquis humoristiques style X** : encre noire + aquarelle, papier crème, esprit fil Twitter/X.
Légèreté sur les *mécanismes* électoraux — jamais de caricature de camp ni de personnalités nommées.

Titres et légendes restent en **HTML** : pas de grand texte incrusté dans l’image.

## Une du jour (textes éditoriaux)

La une de l’accueil n’est **pas** une rotation 7 jours, ni le scoop cairo (`hero-daily-live`).

Elle affiche **la couverture du texte éditorial le plus récemment publié** (analyses + débats). Publier un nouveau dossier avec une date plus récente change la une automatiquement (`getUneDuJour()` dans `src/lib/editorial.ts`, composant `UneDuJour.astro`).

### Ajouter un texte (analyse ou débat)

1. Déposer un croquis **unique** :
   - analyses : `public/illustrations/unes/analyses/<slug>.jpg` (ou `.webp`)
   - débats : `public/illustrations/unes/debats/<slug>.jpg` (ou `.webp`)
2. Renseigner le champ `cover` dans le catalogue :
   - `src/lib/analyses.ts` → `ANALYSIS_CATALOG`
   - `src/lib/debates.ts` → `DEBATE_CATALOG`

```ts
cover: {
  src: '/illustrations/unes/analyses/mon-nouveau-dossier.jpg',
  alt: 'Croquis encre et aquarelle : … (sans nommer de personnalité)',
}
```

3. **Ne jamais** réutiliser le fichier d’un autre texte. Deux posts = deux fichiers distincts.
4. Un texte **sans** `cover.src` n’emprunte pas l’art d’un voisin : le site affiche le placeholder libellé `public/illustrations/unes/placeholder-manquante.svg`. Les tests (`src/lib/editorial.test.ts`) **échouent** si le champ manque, si le fichier est absent, si deux slugs partagent la même image, ou si le chemin est un scoop cairo.

Qualité exigée : croquis encre + aquarelle sur papier crème. Interdit : stick figures cairo, photo stock réaliste, logos de parti, personnalités nommées, signes religieux, gros titres incrustés.

Pas d’API Recraft / Midjourney dans le dépôt (pas de clé).

## Galerie 2027 (pas la une)

- Registry : [`visual-daily-pool.json`](./visual-daily-pool.json) — sets pour la **galerie** en bas d’accueil
- Lib : `src/lib/visual-daily.ts` · composant `DailyVisuals.astro` (override scoop **désactivé** sur l’accueil)
- Cette galerie n’alimente plus la une

## Fichiers

| Fichier | Sujet |
|---------|--------|
| `../unes/analyses/*.jpg` | Couverture dédiée de chaque analyse |
| `../unes/debats/*.jpg` | Couverture dédiée de chaque débat |
| `../unes/placeholder-manquante.svg` | Placeholder libellé (jamais l’art d’un autre texte) |
| `hero-premier-tour-2027.jpg` / `.webp` | Galerie (souvent poster webp LCP) |
| `democracy-over-elimination.jpg` | Flèches du 2e tour cassées (galerie / archives) |
| `pluralite-1er-tour.jpg` | Urne / confettis de bulletins |
| `dessin-urne-2027.jpg` | Urne + miroir « France » |
| `photo-citoyens-data-2027.jpg` | Open data 1er tour |
| `meme-*.jpg` | Mèmes croquis (texte incrusté — ne pas servir de une) |
| `illustration-voix-egales.jpg` | Balance des voix |
| `hybrid/*.jpg` | Sets hybrides |
| `visual-daily-pool.json` | Calendrier des sets galerie |
| `hero-daily-override.json` / `hero-daily-live.jpg` | Ancien scoop cairo — **ne plus brancher comme une** |

**Animations galerie** :
- `/videos/2027/hero-voting-animation.mp4`
- `/videos/2027/hero-urne-nb-croquis.mp4`

Archive pré-croquis : `archive-pre-croquis-2026-07-18/`

## PRINCIPE ABSOLU DE LAÏCITÉ (non négociable)

- Aucun signe religieux ostentatoire dans AUCUNE illustration.
- Tenues quotidiennes neutres uniquement.
- Pas de logo de parti, pas de caricature de personnalités nommées.
- Sauf live YouTube (exception documentée ailleurs).
