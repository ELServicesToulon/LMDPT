# TODO — Le Média du Premier Tour

> **Democracy Over Elimination** — média civique, données publiques, premier tour.  
> Créé le **2026-06-27**. Source de cadrage : [conversation Grok](https://grok.com/share/c2hhcmQtNA_5c541291-4ab3-4a52-84ab-4306f008bf9a).

---

## Vision (1 phrase)

Couvrir le premier tour avec des faits sourcés (open data), sans éliminer ni caricaturer — la démocratie avant le spectacle.

---

## Phase 0 — Fondations (maintenant)

- [x] Valider le périmètre éditorial (sujets, ton, ligne « Democracy Over Elimination ») → `docs/EDITORIAL.md`
- [x] Choisir la stack → **Astro 7 + TypeScript**
- [x] Initialiser le dépôt Git + `.gitignore`
- [x] Définir la structure du repo (`src/`, `docs/`, `data/cache/`…)
- [x] Rédiger le prompt Cursor projet → `docs/CURSOR.md` (transcript Grok complet toujours optionnel)

---

## Phase 1 — Intégration data.gouv.fr (priorité Grok)

Réf. API : [guides.data.gouv.fr](https://guides.data.gouv.fr/api-de-data.gouv.fr/prise-en-main.md) — lecture seule, **sans clé API**.

- [x] Client HTTP `data.gouv.fr` v1 (catalogue JSON-LD + datasets + ressources) → `src/lib/datagouv.ts`
- [x] Recherche catalogue : `GET /api/1/site/catalog?q=…` (+ fallback `GET /datasets/?q=`)
- [x] Détail dataset : `GET /api/1/datasets/{id}/` + extraction URLs ressources
- [x] Mapper les jeux utiles au premier tour → `src/lib/datasets-map.ts`
- [x] Cache local + horodatage → `data/cache/sources-manifest.json` · `npm run sync:data`
- [x] Tests sur datasets réels + gestion erreurs/rate-limit → `npm test` (4 tests) + retry 503
- [x] Page « sources » listant chaque donnée + lien data.gouv.fr → `/sources`

---

## Phase 2 — Produit minimal

- [x] Page d'accueil + manifeste + hero → `/`
- [x] Atlas premiers tours (sélecteur + dossier 2022) → `/atlas`, `/atlas/2022-presidentielle`
- [x] Page À propos + charte → `/a-propos`
- [x] Données nationales 2022 (JSON statique + graphique barres)
- [x] Carte départements 2022 (SVG géographique + import TXT officiel) → `npm run import:dept-2022` · `npm run build:geo`
- [x] Présidentielle 2017 (national + départements XLS) → `/atlas/2017-presidentielle`
- [x] Dossier analyse législatives 2024 (désistements) → `/analyses/legislatives-2024-desistements`
- [x] Atlas législatives 2024 — 577 circonscriptions → `/atlas/2024-legislatives` · `npm run import:legislatives-2024`
- [x] Dossier analyse présidentielle (distorsion 1er/2nd tour) → `/analyses/presidentielle-distorsion`
- [x] Index analyses → `/analyses`
- [x] Accessibilité + mobile-first (Lighthouse preview 100/100 — 2026-06-29)

---

## Phase 3 — Qualité & conformité

- [x] Mentions légales → `/mentions-legales`
- [x] Politique de confidentialité → `/confidentialite`
- [x] Journal des mises à jour données → `/sources#mises-a-jour`
- [x] Licences open data par ressource (ODbL, Etalab…) → journal intégré + jeux détaillés `/sources`
- [x] Revue éditoriale humaine avant publication auto → `docs/REVIEW.md`

---

## Phase 4 — Écosystème Manusk (optionnel)

- [ ] Lier au Director bridge `mediconvoi` si missions partagées
- [ ] Capability Manusk `local_files_read` sur ce workspace
- [ ] Ingest second-brain / Graphiti si veille long terme

---

## Phase 5 — Débats civiques & discussion (juil. 2026)

- [x] Rubrique `/debats` + catalogue (`src/lib/debates.ts`, JSON positions sourcées)
- [x] Débats pilotes : vote utile, désistements 2024, assemblée premier tour
- [x] Composants `DebatePositions.astro`, `DiscussionSection.astro` (Giscus)
- [x] GitHub Discussions + catégorie « Débats » + app Giscus
- [x] Script `npm run giscus:setup` + doc `docs/GISCUS.md`, `docs/GISCUS-ACTIVATION.md`
- [ ] Créer les 3 fils GitHub (ou premier commentaire Giscus par page) pour lier les embeds

---

## Phase 6 — AN1T simulation législatives 2024 (juil. 2026)

- [x] Moteur Sainte-Laguë + blocs civiques → `src/lib/an1t.ts` (tests)
- [x] Analyse `/analyses/assemblee-premier-tour` + comparatif sièges
- [x] Carte départements T1 (toggle nuances / blocs) → `An1tComparatorMap.astro`
- [x] Débat lié `/debats/assemblee-premier-tour`
- [ ] Carte 2nd tour réel par circonscription (import données T2 à prévoir)

---

## Décisions ouvertes

| Sujet | Options | Décision |
|-------|---------|----------|
| Stack | Next.js / Astro / Python FastAPI + static | **Astro 7 + TS** |
| Repo GitHub | Nouveau repo privé / public | **Public** → [ELServicesToulon/LMDPT](https://github.com/ELServicesToulon/LMDPT) |
| Nom dossier slug | `le-media-du-premier-tour` | **OK** |
| Domaine | `.fr` à réserver ? / sous-domaine iarbre | **`lmdpt.iarbre.org`** (GitHub Pages) |

---

## Déploiement

- [x] Repo GitHub public [ELServicesToulon/LMDPT](https://github.com/ELServicesToulon/LMDPT)
- [x] Workflow GitHub Pages (`.github/workflows/deploy.yml`) — push `Main` → build + deploy
- [x] Prod OVH KS-5-B (`npm run deploy-lmdpt-ovh` depuis Mediconvoi/backend)
- [x] DNS Cloudflare : A `lmdpt` → `37.187.159.93` proxied
- [ ] Domaine `.fr` dédié — décision L1+ (optionnel)

## Prochaine action recommandée

1. Publication X manuelle : `second-brain/projects/lmdpt/social-drafts/publication-log.md` (semaine 4 = débats + AN1T)
2. Profil + pin + thread semaine 1, puis enchaîner packs S2→S4
3. Premier commentaire Giscus sur `/debats/assemblee-premier-tour/` (crée le fil `discussion_id`)
4. `npm run manusk:capture:lmdpt` (Mediconvoi) après déploiement
