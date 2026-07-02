# Méthodologie de chiffrage — programmes LMDPT

**Principe** : LMDPT ne remplace pas les instituts spécialisés. Les estimations maison complètent Montaigne/OFCE/campagnes sur un **sous-ensemble de mesures quantifiables**, avec hypothèses publiées.

## Règles

1. Tout montant affiché porte un badge **auteur** (`Campagne`, `Institut Montaigne`, `OFCE`, `Estimation LMDPT`).
2. Les chiffrages `lmdpt` exigent `method_note` et, si possible, une fourchette `montant_min` / `montant_max`.
3. **Interdit** : multiplicateur keynésien spéculatif, effet croissance non sourcé.
4. Formule de base : `impact_annuel_mdeur = base_mdeur × taux_delta` ou `unités × coût_unitaire_mdeur`.

## Hypothèses macro (2022, base PLF)

| Paramètre | Valeur | Source |
|-----------|--------|--------|
| PIB France 2022 | ~2 600 Md€ | INSEE |
| Masse salariale | ~1 050 Md€ | ordre de grandeur DGE |
| SMIC net mensuel | ~1 300 € | 2022 |
| Effectif salariés | ~29 M | INSEE |

## Pilotes 2022 — estimations LMDPT

### Emmanuel Macron — solde -38 Md€ (fourchette -52 / -28)

| Mesure | Base | Calcul | Impact Md€/an |
|--------|------|--------|---------------|
| Retraites 65 ans | 15 Md€/an (ordre OFCE réformes) | report partiel | +8 à +12 dépenses |
| Baisse IS / production | 5 Md€ recettes déjà engagées | maintien | -3 recettes |
| Bouclier énergie | 20 Md€ (pic 2022) | non pérenne | +15 dépenses ponctuelles |

### Marine Le Pen — solde -72 Md€ (fourchette -95 / -55)

| Mesure | Calcul | Impact |
|--------|--------|--------|
| TVA énergie 5,5 % | ~25 Md€ base TVA énergie × 14 pts | -8 recettes |
| SMIC +10 % | ~3 Md€ par point × 10 | +30 dépenses |
| 10 000 lits hôpital | 50 k€/lit | +0,5 dépenses |

### Jean-Luc Mélenchon — solde -185 Md€ (fourchette -240 / -140)

| Mesure | Calcul | Impact |
|--------|--------|--------|
| Retraite 60 ans | +15 Md€ vs trajectoire 65 ans | +15 dépenses |
| SMIC 1 500 € net | ~+200 € × 2,5 M SMIC × 12 | +6 dépenses |
| Semaine 32 h | +10 % masse salariale secteur privé ciblé | +40 dépenses |
| 14 tranches IR | recettes additionnelles hauts revenus | -25 recettes |

## Pilotes 2027 — estimations LMDPT

### Gabriel Attal — départs volontaires fonctionnaires

| Poste | Hypothèse | Impact Md€/an |
|-------|-----------|---------------|
| Indemnités | 100 000 départs / 5 ans · 200–300 k€/départ | +2 à +6 dépenses |
| Économies postes | 20 000 postes/an non remplacés · ~60 k€ coût employeur | −0,8 à −2 recettes |
| Solde net direct | Indemnités − économies (sans effet macro) | +0 à +5 solde négatif |

Badge `confidence: faible` sur le solde net — mesure unique sans bouclage programme complet.

### Parti socialiste — projet « Vivre libre » (2027)

| Mesure | Hypothèse | Impact Md€/an |
|--------|-----------|---------------|
| SMIC 1 700 € net | +300 € × 2,5 M bénéficiaires | +6 à +12 dépenses |
| Taxe Zucman 2 % | Patrimoine >100 M€ | +10 à +20 recettes |
| Retraite 62 ans | vs trajectoire 64 ans | +5 à +12 dépenses |

Note PS : chiffrage officiel **en cours** (Les Echos, juin 2026) — estimations LMDPT `confidence: faible` à `moyenne`.

### Philippe Brun — primaire PS (2027)

| Élément | Statut |
|---------|--------|
| Programme propre | Non — s'appuie sur « Vivre libre » |
| Chiffrage | Voir fiche PS (pas de chiffrage candidat) |
| Mesures intégrées | Primaire interne · axe salaires (presse) |

### Édouard Philippe / Jordan Bardella (2027)

| Candidat | Statut | Chiffrage |
|----------|--------|-----------|
| Édouard Philippe | Partiel — débat primaire droite, pas de programme chiffrable | Aucun |
| Jordan Bardella | Partiel — substitution RN si inéligibilité MLP | Voir fiche Le Pen 2022 |
| Jean-Noël Barrot | Partiel — référendum décentralisation, service civique | Aucun |
| Marine Le Pen | Partiel — éligibilité judiciaire (7 juil. 2026) | Voir fiche Le Pen 2022 |

## Validation

```bash
npm run programme-chiffrage-lint
```

Revue humaine obligatoire avant publication (`docs/REVIEW.md`).
