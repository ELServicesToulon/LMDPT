# Espace rédaction

Page interne : `/redaction/`

Ce n’est pas une page de présentation. Elle n’est pas dans la navigation du site. L’adresse et ce document suffisent pour la retrouver.

## Accès

En production, Cloudflare Access (liste d’adresses autorisées) fermera la route. Le dépôt ne contient ni jeton, ni liste d’adresses. La page envoie `noindex` et `robots.txt` interdit l’exploration de `/redaction`.

La version actuelle est statique : elle n’authentifie pas les visiteurs.

## Rôles

- Directeur de la publication (LCEN) : personne physique indiquée dans les mentions légales. Inchangé.
- Espace du directeur (god mode) : `/redaction/god/` — mode d’emploi dans `docs/REDACTION-GOD.md`.
- Directrice de la publication adjointe : ligne, calendrier, relecture.

## Identité affichée

La directrice de la publication adjointe choisit elle-même son pseudonyme. Elle décide aussi si ses coordonnées sont affichées.

Tant que cette décision n’est pas prise, les mentions légales et `/redaction/` portent uniquement le titre « Directrice de la publication adjointe » : pas de nom, pas de courriel personnel, pas de pseudonyme inventé.

Placeholder interne : (pseudonyme à définir par la DPA)

Les coordonnées opérationnelles restent hors du site (espace de travail privé).

## Repères

- Charte publique : `/charte/` (ne pas la modifier depuis cet espace)
- Ligne : `docs/EDITORIAL.md`
- Revue : `docs/REVIEW.md`
- Mentions : `/mentions-legales/`

## Avant publication

Reprendre la revue de `docs/REVIEW.md` : sources, neutralité, français, build, revue humaine.

## Outils

Deux liens Drive, lus au **build**. Ils ne sont pas dans le dépôt (la page est statique, sans authentification).

ManuskBot, sur KS-5, les pose dans `Mediconvoi/backend/.env`, puis `npm run deploy-lmdpt-ovh` :

| Variable | Rôle |
|----------|------|
| `PUBLIC_LMDPT_REDACTION_DRIVE_URL` | Espace de travail rédaction |
| `PUBLIC_LMDPT_PIGISTES_DRIVE_URL` | Boîte pigistes |

Valeur attendue : `https://drive.google.com/drive/folders/…` uniquement. Sans variable, ou si l’URL n’est pas un dossier Drive, le libellé hors dépôt reste et aucun lien n’est émis. Le même bloc est sur `/redaction/god/`.

- File de relecture : non branchée
