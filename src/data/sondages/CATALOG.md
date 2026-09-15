# Catalogue — organismes de sondage (présidentielle FR 2027)

**Mise à jour** : 2026-07-17 · Source machine : [`providers.json`](./providers.json)  
**Veille** : `npm run sondage:veille` (2×/jour · 06:45 + 18:15 Europe/Paris · timer `lmdpt-sondage-veille`)  
Après chaque persist réussi, `2027-sondages-candidats.json` est recalculé depuis les vagues d'**intentions de vote** scorées (`latest_pct` / `avg_pct` / `updated`).  
**X officiels** : [`../elections/2027-x-officiels.json`](../elections/2027-x-officiels.json)

> Intentions de vote = **illustration pédagogique**. Pas de prédiction. Notices : [Commission des sondages](https://www.commission-des-sondages.fr/).

---

## 1. France — principaux (terrain régulier 2025–2026)

| Institut | Rôle typique | Clients / supports fréquents |
|----------|--------------|------------------------------|
| **Ifop** (+ Ifop-Fiducial) | Baromètres présidentiels haute fréquence | Figaro, LCI, Sud Radio |
| **Elabe** | Intentions multi-hypothèses | BFMTV, Tribune Dimanche, Les Échos |
| **Harris Interactive / Toluna** | Baromètres + 2nds tours | M6, RTL |
| **Ipsos** (+ héritage **BVA**) | Baromètres + Cevipof + soir d’élection | Parisien, France Télévisions, Radio France |
| **OpinionWay** | Exclusifs médias | Les Échos, CNews, Radio Classique |
| **Cluster17** | Clusters + parfois *souhait de victoire* | **Le Point** |
| **Verian** (ex-Kantar Public) | Vagues nationales | Presse / commandes |

## 2. France — secondaires / référence

| Organisme | Note |
|-----------|------|
| **Odoxa** | Figaro, franceinfo… |
| **CSA** | CNews, Europe 1, JDD… |
| **Viavoice** | Libération, France Inter… |
| **YouGov France** | Présence FR, volume variable |
| **Cevipof** (Sciences Po) | Baromètre politique de référence (souvent × Ipsos) — **pas** un sondeur commercial |
| **Estimations 20h** | Ipsos-Sopra Steria, Harris, Elabe — *jour J uniquement* |

## 3. Europe — couverture / agrégation

| Organisme | Rôle |
|-----------|------|
| **Europe Elects** | Moyennes & scénarios FR 2027, relais pan-EU |
| **Politico Europe — Poll of Polls** | Agrégats européens (FR inclus quand dispo) |
| **YouGov (UK)** | Méthodes + enquêtes pan-EU |
| **Ipsos MORI** | Bras UK d’Ipsos |
| **Kantar / Verian EU** | Réseau public opinion Europe |
| **Eurobaromètre** | Climat d’opinion UE — **pas** d’intentions présidentielles FR |

## 4. International — relais & études

| Organisme | Rôle |
|-----------|------|
| **Reuters** (cite Ifop, Harris…) | Relais news des vagues FR |
| **Pew Research** | Attitudes FR/UE, rarement score 1er tour |
| **Gallup** | Historique mondial, FR sporadique |
| **Morning Consult** | Tracking multi-pays |
| **Wikipedia EN** *Opinion polling 2027* | Table consolidée multi-instituts |
| **FT / Bloomberg / AP / BBC** | Relais presse anglo-saxonne |

## 5. Historique (inactifs ou rare 2027)

TNS Sofres → Kantar/Verian · LH2 · GfK — gardés en registre `active: false` pour matching texte.

---

## Intégration LMDPT

| Fichier | Usage |
|---------|--------|
| `providers.json` | Index machine (scan + keywords) |
| `sondage-veille.ts` | Matching firmes + scan agrégateurs |
| `sondage-candidats-refresh.ts` | Recalcul `avg_pct` / `latest_pct` / `updated` après persist |
| `2027-sondages-candidats.json` | Agrégat pédagogique scoré (écrit par la veille) |
| `latest.json` / `movements.jsonl` | Snapshot + journal des mouvements |

### Chemin auto

1. `npm run sondage:veille` (ou le timer systemd) scanne les agrégateurs.
2. `persistSnapshot` écrit `latest.json`, `waves-registry.json`, `movements.jsonl`.
3. Puis `rebuildCandidatsFromWaves` : uniquement les vagues `intentions_vote` dont la somme des % est entre 70 et 115 (une hypothèse de 1er tour, pas un collage multi-scénarios). `souhait_victoire` reste en source, **non fusionné**.
4. `updated` = date du scan (`YYYY-MM-DD`). Identité candidats (nom, bloc, note) conservée. Slug absent des IV → scores historiques inchangés (ex. Bardella hors vagues post-7 juil.).

`npm run sondage:veille -- --dry-run` ne touche pas au disque.

### Chemin manuel (paywall, PDF Commission, hypothèse manquante)

Si l'extracteur rate une vague scorée :

1. Ajouter la vague dans `seedKnownWaves()` (`src/lib/sondage-veille.ts`) avec `metric: 'intentions_vote'` et les `scores`.
2. Relancer `npm run sondage:veille` (le seed est fusionné aux vagues live). Éviter `--seed-only` sur un `latest.json` déjà peuplé : ce mode réécrit le snapshot à partir des seuls seeds.
3. Contrôle : `updated` du JSON candidats = jour du scan ; `waves_latest` contient la firme.

Ne pas coller à la main un `latest_pct` issu d'un **souhait de victoire**. Ne pas rédiger de prédiction dans `method` / `disclaimer`.

**Commanditaires médias** ne sont pas des instituts : ils **commandent** (Figaro×Ifop, Point×Cluster17, etc.).
