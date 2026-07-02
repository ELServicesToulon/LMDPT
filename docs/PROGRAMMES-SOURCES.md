# Sources — programmes électoraux LMDPT

Références pour l'intégration des programmes présidentiels. Chaque fiche candidat cite au minimum une source primaire (document de campagne) et, le cas échéant, un chiffrage tiers.

## Présidentielle 2022

| Source | URL | Usage |
|--------|-----|-------|
| Institut Montaigne — synthèse des chiffrages | https://www.institutmontaigne.org/presidentielle-2022/synthese-des-chiffrages | Agrégats recettes / dépenses / solde (5 candidats) |
| Institut Montaigne — article finances publiques | https://www.institutmontaigne.org/expressions/presidentielle-2022-quels-effets-attendre-des-programmes-sur-les-finances-publiques | Méthodologie et écarts candidat vs IM |
| OFCE — contributions thématiques 2022 | https://www.ofce.sciences-po.fr/ | Pas de bouclage global 2022 (choix méthodologique OFCE) |
| Article Ragot (HAL) | https://hal-sciencespo.archives-ouvertes.fr/hal-03697377 | Justification de l'absence d'évaluation globale OFCE en 2022 |

### Programmes officiels (archives)

| Candidat | Document |
|----------|----------|
| Emmanuel Macron | https://www.emmanuelmacron.fr/programme |
| Marine Le Pen | https://rassemblementnational.fr/programme |
| Jean-Luc Mélenchon | https://laec.fr/ |
| Valérie Pécresse | https://www.valeriepecresse.fr/programme |
| Éric Zemmour | https://www.ericzemmour.fr/programme |

## Présidentielle 2017

| Source | Usage |
|--------|-------|
| OFCE — évaluation programmes 2017 | Ordres de grandeur solde public (agrégats dans fiches 2017) |
| France Stratégie | Contributions thématiques 2017 |
| Programmes archivés (En Marche, FN, LFI, LR, PS) | Mesures phares par candidat |

## Présidentielle 2027

| Source | Usage |
|--------|-------|
| Conseil constitutionnel | Liste officielle des candidats qualifiés |
| Veille renifleur LMDPT | Détection de publication programme (flag uniquement) |
| Sites candidats | Intégration manuelle après revue `docs/REVIEW.md` |

### Post-événement (veille 2027)

Après publication d’une décision ou d’un vote documenté dans la presse :

1. `npm run renifleur && npm run programme-veille`
2. Mettre à jour la fiche JSON (`src/data/programmes/presidentielle-2027/{slug}.json`) — **mesure factuelle + source URL**
3. Mettre à jour `_index.json` (`last_measure_at`, `press_signals`)
4. Si chiffrage : `docs/PROGRAMMES-CHIFFRAGE-METHODO.md` + `npm run programme-chiffrage-lint`
5. Entrée `data-journal.json` + `npm test` + deploy

**Ne pas anticiper** le résultat d’un jugement ou vote avant publication source qualifiée.

| Échéance | Fiches concernées |
|----------|-------------------|
| Jugement Le Pen (7 juil. 2026) | `le-pen.json`, `bardella.json` |
| Vote militants PS (9 juil. 2026) | `parti-socialiste.json` |

## Licence et citation

- Pas de republication intégrale des PDF de campagne — extraits courts + lien source.
- Chiffrages tiers : attribution explicite (badge auteur sur le site).
- Données LMDPT : méthodologie publiée dans [PROGRAMMES-CHIFFRAGE-METHODO.md](./PROGRAMMES-CHIFFRAGE-METHODO.md).
