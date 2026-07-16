# Ligne éditoriale — Le Média du Premier Tour

> **Democracy Over Elimination** — la démocratie avant le spectacle.

**Tagline** : Le premier tour : le miroir le plus fidèle de la France politique. Pour une démocratie où l'on vote pour, et non contre.

## Vision

Couvrir le **premier tour** avec des faits sourcés (open data), sans éliminer ni caricaturer les candidats et forces politiques.

Le premier tour capture la pluralité des préférences ; le second tour la distord via désistements et vote stratégique. Nous documentons cette distorsion sans la moraliser.

## Périmètre (Phase 1–2)

| Inclus | Exclu |
|--------|-------|
| Données publiques officielles (élections, candidatures, résultats, géographie électorale) | Sondages présentés comme prédictions |
| Comparaisons factuelles (programmes, parcours documentés, chiffres vérifiables) | Classements éliminatoires type « top / flop » |
| Traçabilité : source + date pour chaque donnée | Caricatures, memes politiques, buzz sans fondement |
| Contexte et nuances sur les jeux de données | Avis éditorial non signalé comme tel |

## Ton

- **Sobre, civique, accessible** — français professionnel, phrases courtes.
- **Neutre factuel** sur les données ; prise de position explicite uniquement dans la rubrique « ligne » (manifeste), jamais déguisée en fait.
- Vouvoiement ou tutoiement : **vouvoiement** sur le site public (public large).

## Zéro biais · zéro parti pris · transparence des couleurs

Le média se veut **zéro biais** et **sans parti pris** éditorial.

| Règle | Application |
|-------|-------------|
| **Zéro biais** | Aucune force, candidat ou camp n’est favorisé dans le traitement des faits, titres, tailles de fiche ou ordre d’apparition sans justification documentaire. |
| **Zéro parti pris** | Le média ne « soutient » personne. Les prises de position des **intervenants** et des **posts** sont les leurs, pas celles de la rédaction. |
| **Transparence des couleurs politiques** | Chaque post / commentaire / intervenant affiche une **teinte politique** (proximité d’idées 1er tour) de façon visible — pastille + libellé. Ce n’est **pas** une carte d’adhésion partisane ; c’est un **signal de transparence** pour le lecteur. |
| **Idées vs autorité** | Les **idées politiques** du débat démocratique passent. Les **autorités** religieuses ou idéologiques totalisantes **ne passent pas**. |

### IA modératrice en cheffe (fourches caudines)

La **modératrice IA** est le premier filtre non négociable des commentaires et contributions :

1. **Refuse** toute **autorité religieuse** (commandement clérical/divin, prosélytisme d’autorité, imposition normative religieuse).
2. **Refuse** toute **autorité idéologique** totalisante (monopole de vérité, interdiction du débat, culte d’obéissance).
3. **Refuse** haine et appels à la violence.
4. **Autorise** les positions politiques du 1er tour, y compris tranchées, **à condition** d’afficher la teinte politique en transparence.
5. **N’impose pas** de ligne partisane : reformulation = français correct + clarté, **sans** ajouter d’opinion éditoriale.

Implémentation : `src/lib/moderation-gate.ts` · `comments-api/server.mjs` (preview / publish).

## Principes Democracy Over Elimination

1. **Aucun candidat n’est « éliminé »** par le média avant le scrutin — tous les candidats officiellement déclarés ont une fiche équivalente si les données existent.
2. **Pas de « tier list »** ni de notation subjective présentée comme objective.
3. **Les absences de données** sont affichées clairement (pas de silence qui suggère un désaveu).
4. **Revue humaine** avant toute publication automatique (Phase 3) — après le filtre IA.

## Rubrique Débats

La rubrique **Débats** (`/debats`) documente des questions civiques liées au premier tour et aux mécanismes électoraux.

| Règle | Application |
|-------|-------------|
| Pluralité des positions | Minimum 2 positions présentées avec la **même structure** (pas de position « gagnante ») |
| Arguments sourcés | Chaque argument renvoie à une source identifiable (officielle, académique ou interne LMDPT) |
| Pas de classement éliminatoire | Interdiction de tier list, notation ou caricature dans les débats |
| Discussion communautaire | Modérée via GitHub Discussions + Giscus — charte DOE applicable aux commentaires |
| Distinction fait / opinion | Les débats sont signalés comme espace d'argumentation, pas comme faits établis |

## Conformité

- Licences open data respectées par ressource (ODbL, Licence Ouverte / Etalab, etc.) — page Sources.
- Mentions légales et politique de confidentialité avant mise en ligne publique.
- Pas de données personnelles traitées sans base légale documentée.


## Page publique

La charte complète est publiée sur le site : **`/charte`** (`src/pages/charte.astro`).

## Équipe éditoriale

| Rôle | Statut |
|------|--------|
| Directeur / directrice de la publication (LCEN) | **À nommer** après accord explicite de la personne |
| Rédaction en chef | **À nommer** après accord explicite de la personne |

- **Ne pas** publier de nom, email ou photo de rédaction sans accord de la personne concernée.
- Détail d’intention / candidatures : hub Manusk privé uniquement (hors ce dépôt public).
- Revue humaine avant publication : Président / délégué L1+ tant que la rédaction n’est pas formellement nommée.

## Validation

- [x] Ligne DOE posée (2026-06-27)
- [x] Page `/charte` publique (2026-07-16)
- [ ] Accord de la future rédaction (nomination + contact public)
- [ ] Validation humaine Président / rédaction
