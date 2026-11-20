# Unes aquarelle — source de vérité git

Ce dossier est **commité dans le dépôt** (`public/illustrations/unes/`).
Astro le copie vers `dist/illustrations/unes/` au build. Un `rsync --delete`
vers `lmdpt-website/current` ne doit plus dépendre d’une préservation
post-rsync : sans ces fichiers dans le checkout, la prochaine release les
efface.

Pas de `*.bak*`. JPEG binaires tels quels (voir `.gitattributes`).

## Pool

- `placeholder-manquante.svg`
- `analyses/alerte-citoyenne.jpg`
- `analyses/assemblee-premier-tour-mecanismes.jpg`
- `analyses/assemblee-premier-tour.jpg`
- `analyses/declarations-x-candidats.jpg`
- `analyses/gouvernance-an1t-droit.jpg`
- `analyses/legislatives-2024-desistements.jpg`
- `analyses/presidentielle-2022-legislatives.jpg`
- `analyses/presidentielle-2027-preparation.jpg`
- `analyses/presidentielle-distorsion.jpg`
- `analyses/programmes-comparateur.jpg`
- `analyses/programmes.jpg`
- `analyses/temps-parole-equite.jpg`
- `debats/assemblee-premier-tour.jpg`
- `debats/desistements-second-tour.jpg`
- `debats/vote-utile-pluralite.jpg`
