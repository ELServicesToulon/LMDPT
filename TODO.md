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
- [ ] Carte départements 2022
- [ ] Dossier analyse longue (distorsion 1er/2nd tour)
- [ ] Législatives 2024 (désistements)
- [ ] Accessibilité + mobile-first (base OK, audit à faire)

---

## Phase 3 — Qualité & conformité

- [ ] Mentions légales + politique de confidentialité
- [ ] Licences open data par ressource (ODbL, Etalab…)
- [ ] Journal des mises à jour données
- [ ] Revue éditoriale humaine avant publication auto

---

## Phase 4 — Écosystème Manusk (optionnel)

- [ ] Lier au Director bridge `mediconvoi` si missions partagées
- [ ] Capability Manusk `local_files_read` sur ce workspace
- [ ] Ingest second-brain / Graphiti si veille long terme

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
- [x] Domaine custom `lmdpt.iarbre.org` (CNAME Cloudflare → GitHub Pages)
- [ ] Domaine `.fr` dédié — décision L1+ (optionnel)

## Prochaine action recommandée

1. Vérifier le site : [lmdpt.iarbre.org](https://lmdpt.iarbre.org)
2. Import CSV départements 2022 + carte interactive
3. Dossier analyse législatives 2024 (désistements)
4. Phase 3 : mentions légales avant audience large
