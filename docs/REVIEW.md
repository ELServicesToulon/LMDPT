# Revue éditoriale — checklist avant publication

> **Gate** : aucune page ou dossier ne passe en prod sans cette revue humaine (Phase 3, `EDITORIAL.md`).

## Quand l’appliquer

- Nouvelle page Atlas, analyse, **débat**, ou mise à jour substantielle de chiffres
- Import / recalcul de jeux de données (`npm run import:*`, `sync:data`)
- Publication automatique ou semi-automatique (workflow, agent, script)

**Hors scope** : correctifs typo, CSS, infra (DNS, deploy) sans changement de contenu éditorial.

---

## Checklist (cocher avant merge / deploy)

### 1. Traçabilité des faits

- [ ] Chaque chiffre affiché renvoie à une **source identifiable** (lien data.gouv.fr, fichier officiel, ou entrée du journal `/sources#mises-a-jour`)
- [ ] **Date** du jeu de données ou du scrutin indiquée (métadonnées ou texte)
- [ ] **Licence** du jeu intégré documentée sur `/sources` (journal ou jeux détaillés)
- [ ] Absence de donnée signalée explicitement (pas de case vide ambiguë)

### 2. Neutralité Democracy Over Elimination

- [ ] Aucun classement éliminatoire (« top », « flop », tier list) déguisé en analyse
- [ ] Tous les candidats / forces concernés par le périmètre traités **à égalité de présentation** (même structure de fiche)
- [ ] Programmes : distinction visible **campagne** / **Institut Montaigne** / **estimation LMDPT**
- [ ] Distinction claire **fait** vs **interprétation** (analyses = synthèse éditoriale signalée)
- [ ] Pas de sondage ou projection présentée comme résultat

### 2b. Débats (rubrique `/debats`)

- [ ] Au moins **2 positions** avec structure identique (titres, nombre d'arguments comparable)
- [ ] Chaque argument possède une **source** (URL externe ou lien interne LMDPT)
- [ ] Aucune position désignée comme « gagnante » ou supérieure
- [ ] Charte de participation affichée sur la page débat
- [ ] `discussion_id` renseigné si statut `ouvert`
- [ ] Liens vers analyses/atlas connexes pertinents

### 3. Exactitude technique

- [ ] `npm test` vert (imports, parsing, couverture licences)
- [ ] Totaux cohérents (voix candidats = exprimés, pourcentages arrondis documentés si besoin)
- [ ] Liens externes valides (data.gouv.fr, archives intérieur.gouv.fr)
- [ ] Build local OK : `nvm use 22 && npm run build`

### 4. Conformité & accessibilité

- [ ] Pas de donnée personnelle non nécessaire (RGPD — voir `/confidentialite`)
- [ ] Titres hiérarchiques (`h1` unique, `h2`/`h3` logiques)
- [ ] Textes alternatifs ou libellés sur graphiques / cartes si ajout visuel
- [ ] Mentions légales à jour si nouveau type de contenu

### 5. Publication

- [ ] Entrée ajoutée au **journal** `src/data/data-journal.json` si nouveau jeu intégré
- [ ] `npm run sync:data` si le catalogue Sources doit refléter de nouveaux jeux
- [ ] Deploy prod : `npm run deploy-lmdpt-ovh` (depuis `Mediconvoi/backend`)
- [ ] Spot-check navigateur : page concernée + `/sources`

---

## Journal de revue (modèle)

| Date | Contenu | Revue par | Résultat | Notes |
|------|---------|-----------|----------|-------|
| YYYY-MM-DD | ex. Atlas 2022 dept | Prénom | ✅ / ⏸ | lien PR ou commit |

---

## Escalade

- Doute sur licence ou réutilisation → bloquer publish, documenter dans issue GitHub
- Donnée contradictoire entre sources → privilégier source **officielle** (Ministère, Conseil constitutionnel) et noter l’écart
- Décision L1+ (ligne éditoriale, nouveau format) → accord Président avant merge

---

## Références

- Ligne éditoriale : `docs/EDITORIAL.md`
- Page Sources : `/sources`
- Prompt agent : `docs/GROK-AGENT-PROMPT.md`