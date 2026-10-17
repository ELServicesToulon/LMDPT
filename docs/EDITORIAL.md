# Ligne éditoriale — Le Média du Premier Tour

> **La démocratie avant l’élimination** — la démocratie avant le spectacle du duel.

**Tagline** : Le premier tour : le miroir le plus fidèle de la France politique. Pour une démocratie où l'on vote pour, et non contre.

## Statut des textes

- **Page publique** `/charte/` (`src/pages/charte.astro`) : profession de foi. Pourquoi le premier tour, promesse, trois refus, deux repères sur chaque texte, deux exemples. Français, vouvoiement. Pas de mode d’emploi.
- **Ce document** : source versionnée. Il conserve le détail d’exploitation retiré de la page publique le 5 octobre 2026 (Phase 3, file de relecture, clés de palette, cible d’accessibilité).

La doctrine ne change pas. La page publique la dit. Ce fichier la tient, avec le circuit technique.

## Vision

Couvrir le **premier tour** avec des faits sourcés (données ouvertes), sans éliminer ni caricaturer les candidats et forces politiques.

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

## Langue — français correct uniquement (impératif · Président 2026-07-27)

**Règle non négociable** : tout contenu **éditorial public** du média (site, journal, charte, drafts X prêts à publier, libellés UI visibles, alt texts, titres SEO) est rédigé en **bon français uniquement**.

| OK | Interdit (gate FAIL / BLOCK publish) |
|----|--------------------------------------|
| Français correct : orthographe, accents, accords, ponctuation FR, espaces | Anglais éditorial, franglais, anglicismes inutiles quand un équivalent FR clair existe |
| Citations / noms propres / sigles officiels dans leur langue d’origine (signalés) | Corps de page ou brouillon public majoritairement en anglais |
| Termes techniques sourcés une fois, glossés en français | Mots accolés, fautes récurrentes, jargon anglo non glossé |
| Gate `/lmdpt-qualite-redaction` PASS avant `ready_review` | Publier sans relecture FR |

**Exceptions** (hors rédaction éditoriale) : code, identifiants techniques, URLs, noms de fichiers, métadonnées machine, licences citées telles quelles.

**Gate** : `bot-quality-gate` + agent `lmdpt-qualite-redaction` — FAIL = pas de SHIP publication.

## Zéro biais · zéro parti pris · transparence des couleurs

Le média se veut **zéro biais** et **sans parti pris** éditorial.

| Règle | Application |
|-------|-------------|
| **Zéro biais** | Aucune force, candidat ou camp n’est favorisé dans le traitement des faits, titres, tailles de fiche ou ordre d’apparition sans justification documentaire. |
| **Zéro parti pris** | Le média ne « soutient » personne. Les prises de position des **intervenants** et des **posts** sont les leurs, pas celles de la rédaction. |
| **Transparence des couleurs politiques** | Chaque post / commentaire / intervenant affiche une **teinte politique** (proximité d’idées 1er tour) de façon visible — pastille + libellé. Ce n’est **pas** une carte d’adhésion partisane ; c’est un **signal de transparence** pour le lecteur. |
| **Badges obligatoires sur toute publication** | **Toute** publication (site, brouillon X, carte programme, déclaration, débat, veille presse) porte **le ou les badges couleurs d’idées** (`PoliticalHueBadges` / `hueBadgesForPublication`). Multi-camps cités → **plusieurs** pastilles. Implémentation : `src/lib/comment-politics.ts` · `src/components/PoliticalHueBadges.astro`. |
| **Idées vs autorité** | Les **idées politiques** du débat démocratique passent. Les **autorités** religieuses ou idéologiques totalisantes **ne passent pas**. |

### IA modératrice en cheffe (fourches caudines)

La **modératrice IA** est le premier filtre non négociable des commentaires et contributions :

1. **Refuse** toute **autorité religieuse** (commandement clérical/divin, prosélytisme d’autorité, imposition normative religieuse).
2. **Refuse** toute **autorité idéologique** totalisante (monopole de vérité, interdiction du débat, culte d’obéissance).
3. **Refuse** haine et appels à la violence.
4. **Autorise** les positions politiques du 1er tour, y compris tranchées, **à condition** d’afficher la teinte politique en transparence.
5. **N’impose pas** de ligne partisane : reformulation = français correct + clarté, **sans** ajouter d’opinion éditoriale.

Implémentation : `src/lib/moderation-gate.ts` · `comments-api/server.mjs` (preview / publish).

## Principes — La démocratie avant l’élimination

Trois refus publics, non négociables (page `/charte/`) :

1. Aucun classement qui élimine à la place du lecteur.
2. Aucun sondage présenté comme une prédiction.
3. Aucune autorité religieuse ou idéologique totalisante, ni haine, ni appel à la violence.

Application :

1. **Aucun candidat n’est « éliminé »** par le média avant le scrutin — tous les candidats officiellement déclarés ont une fiche équivalente si les données existent.
2. **Pas de « tier list »** ni de notation subjective présentée comme objective.
3. **Les absences de données** sont affichées clairement (pas de silence qui suggère un désaveu).
4. **Revue humaine** avant toute publication automatique (Phase 3) — après le filtre IA. La page publique dit seulement qu’une relecture humaine précède la publication.

### Deux repères sur chaque article et chaque chronique (5 octobre 2026)

Engagement public, dans la promesse de `/charte/` (`#reperes`). La doctrine ne change pas.

La page nomme les deux repères. Elle ne dit pas comment les noms sont retenus, ni les clés de palette.

| Repère | Ce que le lecteur voit | Tenue ici |
|--------|------------------------|-----------|
| **Encadré DOE des candidats 2027** | Positions potentielles des candidats à la présidentielle de 2027 **sur le sujet du texte**. Traces publiques (déclaration, vote, texte porté). Absence écrite. Noms côte à côte. | Section `kind: 'candidats'` (enquêtes `dsa-qui-decide`, `lisnard-abonnes-electeurs`). Titre usuel : « Encadré · Ce que disent les candidats ». Même gabarit pour chaque nom. L’intro du texte dit que l’encadré ne classe personne et ne vaut pas consigne de vote. Une règle d’inclusion, si le texte en a une, reste dans cette intro. Les scores de sondage n’ordonnent pas les noms. |
| **Badge des courants en phase** | Courants politiques **en phase avec la thèse** du texte. Il situe la thèse. Il n’est pas un soutien de la rédaction. | Palette `FIRST_ROUND_HUES` (`src/lib/comment-politics.ts`), affichage `PoliticalHueBadges`. Libellé de groupe : « Courants en phase avec la thèse ». Plusieurs courants : plusieurs badges, sans ordre et sans note. Distinct des pastilles de citation (tableau « Zéro biais », couleurs d’idées), qui disent d’où parle une phrase citée. Le composant fixe aujourd’hui son `aria-label` sur ces pastilles : le badge de thèse porte un libellé de groupe à part. |

Les pastilles de citation restent obligatoires sur toute publication (tableau « Zéro biais »). Le badge de thèse s’y ajoute sur l’article et la chronique. Il ne les remplace pas.

### Exemples tenus sur la page publique (5 octobre 2026)

- **Fiches égales.** Jean-Luc Mélenchon (La France insoumise) et Marine Le Pen (Rassemblement national), préparation 2027 : mêmes rubriques (identité, affiliation, document, mesures par thème, source, date, état du dossier). Les deux dossiers sont partiels. La fiche Le Pen écrit l’absence de programme 2027 distinct à l’intégration. La longueur suit les documents disponibles ; la structure ne change pas.
- **Sondage cité, sans palmarès.** Ifop pour LCI et *Le Figaro*, questionnaire en ligne du 7 au 8 juillet 2026, échantillon de 984 personnes inscrites sur les listes électorales (extrait d’un échantillon de 1 075), hypothèse Édouard Philippe. Source Ifop du 8 juillet 2026. Renvoi aux notices de la Commission des sondages. La page publique ne recopie pas les scores : les aligner serait déjà un ordre d’arrivée. Phrase canonique : `SONDAGES_LIGNE` dans `src/lib/sondages-ligne.ts`.

## Rubrique Débats

La rubrique **Débats** (`/debats`) documente des questions civiques liées au premier tour et aux mécanismes électoraux.

| Règle | Application |
|-------|-------------|
| Pluralité des positions | Minimum 2 positions présentées avec la **même structure** (pas de position « gagnante ») |
| Arguments sourcés | Chaque argument renvoie à une source identifiable (officielle, académique ou interne LMDPT) |
| Pas de classement éliminatoire | Interdiction de tier list, notation ou caricature dans les débats |
| Discussion communautaire | Modérée via GitHub Discussions + Giscus — charte DOE applicable aux commentaires |
| Distinction fait / opinion | Les débats sont signalés comme espace d'argumentation, pas comme faits établis |

## Arène des chroniqueurs

La page publique **`/chroniqueurs/`** tient un tir à la corde documentaire. Ce n’est pas un sondage, ni un palmarès, ni une consigne de vote.

| Règle | Application |
|-------|-------------|
| Données | `src/data/chroniqueurs-arena.json`. Lib : `src/lib/chroniqueurs-arena.ts`. |
| Axe | `hue_to_side` mappe `FIRST_ROUND_HUES` vers `gauche` / `droite` / `centre` / `exclu`. Centre et exclu n’inclinent pas le nœud. |
| Poids | `confirme` = 1 · `partiel` = 0,5 · `debattu` et `non_etaye` = 0 sur la corde (restent listés). |
| Revue | Chaque `fact_check` exige `reviewed_at` et `reviewer_role` ≥ `modo`. |
| Tribunes | Opinion invitée, distincte de la couche fact-check. Une tribune hors catalogue (`catalog: archive`, `href: null`) peut alimenter le registre sans être republiee. |
| Copy | Le nœud plus lourd d’un côté n’est pas un camp « gagnant ». Libellé public : équilibre documentaire. |

Corriger une affirmation : page Contribuer ou `lemediadupremiertour@gmail.com`.

## Conformité

- Licences de données ouvertes respectées par ressource (ODbL, Licence Ouverte / Etalab, etc.) — page Sources.
- Mentions légales et politique de confidentialité avant mise en ligne publique.
- Pas de données personnelles traitées sans base légale documentée.


## Page publique

La profession de foi est publiée sur **`/charte/`** (`src/pages/charte.astro`).

Elle ne reproduit pas le mode d’emploi. Elle renvoie à ce document par la phrase « le détail technique est dans le dépôt ».

### Détail technique conservé ici (hors page publique)

| Sujet | Tenue |
|-------|--------|
| Phase 3 | Revue humaine avant toute publication automatique, après le filtre IA. Gate : `docs/REVIEW.md`. |
| File de relecture | contributeur → modo → modo-senior → rédaction. Rôles : `CommentRole` dans `src/lib/comment-politics.ts`. |
| Clés de palette | `FIRST_ROUND_HUES` (`slug`, ex. `melenchon`). Non affichées sur `/charte/`. API : `/api/comments/hues`. |
| Pastilles | `PoliticalHueBadges` / `hueBadgesForPublication`. Plusieurs camps cités : plusieurs pastilles. Proximité des idées citées, pas la thèse du texte. |
| Encadré candidats 2027 | `kind: 'candidats'`. Positions potentielles, traces publiques, absence écrite, pas de classement, pas de sondage ordonné en palmarès. |
| Badge courants en phase | Même palette et même composant que les pastilles, libellé de groupe « Courants en phase avec la thèse ». Slugs non montrés sur `/charte/`. |
| Filtre | `src/lib/moderation-gate.ts` · `comments-api/server.mjs` (preview / publish). |
| Accessibilité | Cible WCAG 2.2 AA+ (contraste, lisibilité, focus clavier). La page publique dit seulement que le site vise un contraste et une lisibilité suffisants. |

## Qui est lié

La charte de pluralisme s’applique telle quelle à la rédaction, aux contributeurs et à la directrice de la publication adjointe. Elle ne s’assouplit pas selon la fonction.

Aucun nom et aucun courriel de la directrice adjointe ne sont publiés tant qu’elle ne l’a pas décidé (`docs/REDACTION.md`). La page publique peut porter le titre de fonction seul.

## Validation

- [x] Ligne DOE posée (2026-06-27)
- [x] Page `/charte` publique (2026-07-16)
- [x] Impératif langue FR correct uniquement (2026-07-27 · Président)
- [x] Profession de foi publique (2026-10-05) : doctrine inchangée, jargon d’exploitation retiré de `/charte/`
- [x] Engagement public (2026-10-05) : chaque article et chaque chronique portent l’encadré des positions potentielles des candidats 2027 et le badge des courants en phase avec la thèse. Doctrine inchangée. Pas de déploiement dans cette révision.
- [ ] Validation humaine Président / rédaction (pas de déploiement dans cette révision)
