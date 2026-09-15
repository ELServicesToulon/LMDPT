# Renifleur — flux RSS

Le fil « dernières actualités » doit rester **multi-sources**. Un seul titre
(historiquement ~88 % Le Monde) ne peut pas saturer le snapshot.

Consigne éditoriale : le mix hebdomadaire d’articles par `politicalHue` vise
une **pluralité de couverture** proche des blocs sondages — ce n’est **pas**
une prédiction par sondage. Référence (hors dépôt) :
`hub cycles/2026-09-15-consigne-renifleur-mix-couleurs.md`.

- `exclude_patterns` : sondage / baromètre / intentions de vote.
- `topic_keywords` : filtre présidentielle 2027 sur les flux `filter: keywords`.
- `max_items_per_feed` : identique pour tous les flux (la diversité vient du
  nombre de sources, pas d’un bonus Le Monde).
- `max_share_per_host` : plafond d’items d’un même hôte dans le snapshot
  (étape 1 du mix couleurs). La sélection est un round-robin par hôte
  (plus récents d’abord), pour qu’une source un peu moins fraîche ne soit
  pas évincée par un titre unique du jour.

Flux vérifiés (2026-09-15) et **non retenus** : Les Échos politique (HTTP 403),
Ouest-France politique (HTTP 403), Ouest-France une (RSS valide mais une
générale), LCP `rss-actualites.xml` (RSS valide, payload ~1,3 Mo pour 9 items).
