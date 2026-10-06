# Espace directeur — god mode

Page interne : `/redaction/god/`

Même famille que `/redaction/`. Ce n’est pas une page de présentation. Elle n’est pas dans la navigation du site. Aucune page publique ne pointe vers cette adresse. L’adresse et ce document suffisent pour la retrouver.

## Accès

Même posture que `/redaction/`.

En production, Cloudflare Access (liste d’adresses autorisées) fermera `/redaction/` et `/redaction/god/`. Le dépôt ne contient ni jeton, ni liste d’adresses.

La page envoie `noindex` (`noindex={true}`, et tout chemin commençant par `/redaction` dans `BaseLayout`). `robots.txt` interdit `/redaction` : ce préfixe couvre `/redaction/god` sans ligne supplémentaire. Le fichier public ne nomme pas le sous-chemin.

La version actuelle est statique : elle n’authentifie pas les visiteurs.

## Rôle

- Directeur de la publication (LCEN) : Emmanuel Lecourt, déjà nommé dans `/mentions-legales/`.
- God mode : veto LCEN, GO-L1 X, fusion et déploiement, infrastructure, accès, invitations, secrets hors dépôt.
- La directrice de la publication adjointe conserve l’entière autorité éditoriale au quotidien. Cette page n’affiche pas son nom.
- Charte `/charte/` : inchangée. Ne pas la modifier depuis cet espace.

## Repères

- Espace rédaction : `/redaction/`
- Mode d’emploi rédaction : `docs/REDACTION.md`
- Ligne : `docs/EDITORIAL.md`
- Revue : `docs/REVIEW.md`
- Mentions : `/mentions-legales/`
- Charte : `/charte/`

## Avant publication

Reprendre la revue de `docs/REVIEW.md` : sources, neutralité, français, build, revue humaine.

En plus, pour le directeur :

- Gate X : un post par jour au maximum sur @LMDuPremierTour, uniquement avec un GO-L1 explicite.
- Déploiement : ManuskBot, après fusion sur Main.
- Texte neuf : relecture KS-5 `lmdpt-relecture.sh` avant un GO site.

## Outils partagés

Le bloc « Outils » est le même que sur `/redaction/` : espace Drive et boîte pigistes via `PUBLIC_LMDPT_REDACTION_DRIVE_URL` et `PUBLIC_LMDPT_PIGISTES_DRIVE_URL` (build KS-5, voir `docs/REDACTION.md`). File de relecture : non branchée.

## Leviers (non branchés)

Liste statique. Aucun secret dans le dépôt.

- Drive racine LMDPT : lien à confirmer hors dépôt
- Hub KS-5 : répertoire `publication-director/`
- Dépôt : [ELServicesToulon/LMDPT](https://github.com/ELServicesToulon/LMDPT) (administration et écriture)
- Déploiement et retour arrière : ManuskBot, releases sous `~/lmdpt-website/releases/`
- Cloudflare Access : fermer `/redaction/` et `/redaction/god/` (adresses hors dépôt)
- Traefik et filtre d’adresses IP Cloudflare : déjà en place, ne pas les casser
- Secrets et clés : Bitwarden Secrets Manager, via Manusk, jamais dans le dépôt
- File GO-L1 et un post X : non branchés
- Escalade Manusk en cas de collision ou de blocage ; pour information, boîte KS-5 (adresse hors dépôt)
