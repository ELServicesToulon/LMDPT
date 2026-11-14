# Sondages sur l’accueil

Bloc « Intentions de vote au 1er tour » dans `ApercuCampagne.astro`. Deux tableaux distincts, une hypothèse chacun, aucune moyenne.

## D’où viennent les chiffres

Les scores, mentions et liens de notice sont dans `src/data/campagne.json` (`sondage.classements`). Chaque chiffre affiché a une page de notice de la Commission des sondages (`notice_url`, `notice_numero`).

- OpinionWay pour CNews, notice n° 10371.
- Cluster17 pour Politico, notice n° 10368.

Les notices portent les mentions de l’article 2 de la loi n° 77-808 (institut, commanditaire, terrain, échantillon, méthode, marges).

## Ajouter un sondage

1. Vérifier la notice sur le site de la Commission des sondages.
2. Recopier les mentions de l’article 2 et une seule hypothèse par tableau.
3. Renseigner `terrain_debut` / `terrain_fin` (ISO), `notice_numero`, `notice_url`.
4. Ne pas inventer de chiffre absent de la page de notice. Ne pas fusionner deux sondages. Ne pas calculer d’écart candidat par candidat.

## Masquage (loi n° 77-808, art. 11)

Pour chaque dimanche de scrutin listé dans `sondage.scrutins_a_masquer`, le bloc est masqué du samedi 00:00 au dimanche 20:00 exclus, heure de Paris (`fin_masquage_heure`). Vendredi 23:59 : visible. Samedi 00:00 : masqué. Dimanche 19:59 : masqué. Dimanche 20:00 : visible.

Les dates 2027-04-18 et 2027-05-02 portent le statut « à confirmer par décret de convocation ».

Au build, `sondage.masquer: true` masque le bloc dans le HTML. Le script navigateur applique la même règle en Europe/Paris (`data-scrutins`, `data-fin-masquage`), sans `getHours()` local.

## Interrupteur sans rebuild

Fichier `public/sondages-interrupteur.json`, recopié tel quel dans le dossier publié (`dist/sondages-interrupteur.json`) :

```json
{ "masquer": false, "mise_au_point": null }
```

Le script fait `fetch('/sondages-interrupteur.json', { cache: 'no-store' })`. Si `masquer` vaut `true`, le bloc `#apercu-sondage` passe `hidden`. Si `mise_au_point` a un `texte` (et éventuellement `lien_url` en https et `lien_label`), un paragraphe est inséré en tête du bloc (`textContent` / `createElement`, jamais `innerHTML`). Erreur réseau ou JSON invalide : l’état du build est conservé.

Pour un effet sans rebuild : éditer `sondages-interrupteur.json` dans le dossier publié sur le serveur, ou dans `public/` puis déployer. Effet au prochain chargement. Limite : les visiteurs sans JavaScript et les caches externes voient l’état du build.

## Mise au point

- Au build : `sondage.mise_au_point` dans `campagne.json`. `null` par défaut. Forme utile : `{ "texte": "...", "lien_label": "...", "lien_url": "https://..." }`. Affichée en tête du bloc (`<p class="apercu-sondage-map" role="note">`).
- Sans rebuild : même objet dans `sondages-interrupteur.json`.
