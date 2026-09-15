# Renifleur — flux RSS

Le fil « dernières actualités » doit rester **multi-sources**. Un seul titre
(historiquement ~88 % Le Monde) ne peut pas saturer le snapshot.

Consigne éditoriale : le mix hebdomadaire d’articles par `politicalHue` vise
une **pluralité de couverture** proche des blocs sondages — ce n’est **pas**
une prédiction par sondage. Référence (hors dépôt) :
`hub cycles/2026-09-15-consigne-renifleur-mix-couleurs.md`.

**DOE** : les sondages = **cible de couverture** uniquement. Pas de ranking,
pas de « qui va gagner », pas d’adhésion éditoriale. Les badges couleur sont
de la transparence (acteurs / idées cités). Les titres sondage / baromètre /
intentions de vote restent hors fil (`exclude_patterns`).

- `exclude_patterns` : sondage / baromètre / intentions de vote.
- `topic_keywords` : filtre présidentielle 2027 sur les flux `filter: keywords`.
- `max_items_per_feed` : identique pour tous les flux (la diversité vient du
  nombre de sources, pas d’un bonus Le Monde).
- `max_share_per_host` : plafond d’items d’un même hôte dans le snapshot
  (étape 1 du mix couleurs). La sélection est un round-robin par hôte
  (plus récents d’abord), pour qu’une source un peu moins fraîche ne soit
  pas évincée par un titre unique du jour.
- Mix teinte (étape 2) : après fetch + filtres, `src/lib/renifleur-mix.ts`
  sélectionne jusqu’à `max_total_items` en minimisant Σ |obs% − cible%|
  par bloc, sous le plafond hôte. Si le vivier est trop mince, le fil n’est
  pas vidé (repli plafond-hôte, puis slice par date). Rapport :
  `mix-report.json`.

## Cible v1 (blocs sondages → teintes)

Source : `src/data/elections/2027-sondages-candidats.json`.

1. Pour chaque `bloc`, garder **un** score : `latest_pct` si présent, sinon
   `avg_pct` — le meilleur candidat du bloc (RN : Le Pen plutôt que Bardella
   quand les deux existent, hypothèses exclusives).
2. Renormaliser ces scores à 100 %.
3. Compter un article dans le bloc si `politicalHue.slug` est dans la table :

| Bloc sondage | Slugs `politicalHue` |
|---|---|
| `rn` | `le-pen`, `bardella` |
| `centre-droit` | `philippe` |
| `gauche` | `melenchon`, `ruffin`, `roussel`, `parti-socialiste` |
| `centre` | `attal`, `barrot` |
| `gauche-sociale-democrate` | `glucksmann` |
| `droite` | `retailleau`, `lisnard` |
| `ecologie` | `ecolo` |
| `extreme-droite` | `zemmour` |
| `droite-souverainiste` | — (pas de teinte dédiée) |
| `extreme-gauche` | — (pas de teinte dédiée) |

`pluraliste` n’est pas un bloc sondage : filet lexical, cible 0 %, utilisé
pour remplir le fil sans forcer une couleur.

Flux vérifiés (2026-09-15) et **non retenus** : Les Échos politique (HTTP 403),
Ouest-France politique (HTTP 403), Ouest-France une (RSS valide mais une
générale), LCP `rss-actualites.xml` (RSS valide, payload ~1,3 Mo pour 9 items).
