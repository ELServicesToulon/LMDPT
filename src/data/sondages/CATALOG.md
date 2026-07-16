# Catalogue — organismes de sondage (présidentielle FR 2027)

**Mise à jour** : 2026-07-16 · Source machine : [`providers.json`](./providers.json)  
**Veille** : `npm run sondage:veille` (2×/jour · timer `lmdpt-sondage-veille`)

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
| `2027-sondages-candidats.json` | Agrégat pédagogique scoré |
| `latest.json` / `movements.jsonl` | Snapshot + journal des mouvements |

**Commanditaires médias** ne sont pas des instituts : ils **commandent** (Figaro×Ifop, Point×Cluster17, etc.).
