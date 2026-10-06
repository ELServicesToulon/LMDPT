# Sync & automatisation — LMDPT (OVH KS-5-B)

Opérations récurrentes sur le VPS. La publication X reste **manuelle** (revue humaine).

## Commandes

| Commande | Usage |
|----------|--------|
| `npm run sync:all` | data.gouv + renifleur + veille programmes (chaque build) |
| `npm run sync:all:social` | idem + brouillon X → `second-brain/.../social-drafts/auto/` |
| `npm run deploy-lmdpt-ovh` | depuis `Mediconvoi/backend` |

## Timer systemd (recommandé)

Installation (une fois, sudo) :

```bash
cd ~/iarbre/le-media-du-premier-tour
sudo bash scripts/install-sync-timer.sh
```

Vérif :

```bash
systemctl list-timers lmdpt-sync-social.timer
journalctl -u lmdpt-sync-social.service -n 30
```

Désinstallation :

```bash
sudo bash scripts/install-sync-timer.sh --remove
```

**Horaire** : tous les jours à 08:00 (heure locale du serveur).

## Cron (alternative)

```cron
0 8 * * * debian bash -lc 'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22 && cd /home/debian/iarbre/le-media-du-premier-tour && npm run sync:all:social' >> /tmp/lmdpt-sync.log 2>&1
```

## Giscus (débats embarqués)

Variables optionnelles pour le **build** OVH / local (voir `docs/GISCUS.md`) :

- `PUBLIC_GISCUS_REPO_ID`
- `PUBLIC_GISCUS_CATEGORY_ID`

Sans ces variables, les pages `/debats/*` affichent le lien GitHub Discussions uniquement.

## Espace rédaction — dossiers Drive

Liens privés du bloc Outils (`/redaction/` et `/redaction/god/`). Absents du dépôt. ManuskBot les ajoute au `.env` lu par le build, puis redéploie.

```bash
# Mediconvoi/backend/.env  (lu par deploy-lmdpt-ovh sur KS-5-B)
PUBLIC_LMDPT_REDACTION_DRIVE_URL=https://drive.google.com/drive/folders/…
PUBLIC_LMDPT_PIGISTES_DRIVE_URL=https://drive.google.com/drive/folders/…
```

Détail : `docs/REDACTION.md`. Sans ces variables, les deux lignes restent des libellés hors dépôt.

## Cloudflare Web Analytics (beacon cookieless)

Mesure d’audience **sans cookie** (RUM Cloudflare). Hors Consent Mode GA4/GTM — ne pas attendre une bannière pubs.

Jeton **public** (dashboard Cloudflare → Web Analytics → JS snippet) :

```bash
# Mediconvoi/backend/.env  (lu par deploy-lmdpt-ovh sur KS-5-B)
PUBLIC_CF_WEB_ANALYTICS_TOKEN=72ab49a17241420da6d8a97cee1f62e2
```

Puis rebuild + deploy :

```bash
cd ~/iarbre/le-media-du-premier-tour   # ou le checkout LMDPT du VPS
# s’assurer que l’env est exporté dans le shell / .env backend
cd ~/Mediconvoi/backend && npm run deploy-lmdpt-ovh
```

| Valeur | Effet au `astro build` |
|--------|------------------------|
| unset / vide | fallback jeton public LMDPT (comme les IDs Giscus) |
| `72ab49a1…1f62e2` (ou autre hex 32) | beacon émis dans `BaseLayout` avant `</body>` |
| `off` / `false` / `0` | aucun script |

Vérif HTML (après deploy + `docker restart lmdpt-website` si bind-mount) :

```bash
curl -sS https://lmdpt.iarbre.org/ | grep -F 'cloudflareinsights.com/beacon.min.js'
```

Activation Discussions sur le repo GitHub :

```bash
GITHUB_TOKEN=ghp_… node scripts/setup-giscus.mjs --create-category
```

Puis ajouter les IDs dans `Mediconvoi/backend/.env` et redéployer.

## Deploy local VPS (releases + symlink)

Sur KS-5-B le conteneur `lmdpt-website` bind-monte `~/lmdpt-website/current` :

```bash
# après npm run build dans le-media-du-premier-tour
TS=$(date +%Y%m%d-%H%M%S)
DEST=~/lmdpt-website/releases/$TS
rsync -a --delete dist/ "$DEST/"
ln -sfn "$DEST" ~/lmdpt-website/current
# IMPORTANT : Docker résout le symlink au démarrage — restart obligatoire
docker restart lmdpt-website
# smoke
curl -sS -o /dev/null -w '%{http_code}\n' https://lmdpt.iarbre.org/analyses/programmes/axes/
```

Sans `docker restart`, une nouvelle release peut rester invisible (404 sur pages neuves, ex. `/axes/`).

**Publication X** : jamais auto sans revue (P10-2 BLOQUÉ Ω 2026-07-26).

## Hero quotidien (croquis)

Scripts : `scripts/hero-daily-video.mjs`, `scripts/hero-daily-sketch.py`.

```bash
npm run hero:daily
npm run hero:daily:force
node scripts/hero-daily-video.mjs --force --skip-sketch
```

`--skip-sketch` est le drapeau de l’unité systemd `lmdpt-hero-daily` déjà en place sur KS-5 : pas d’appel Cairo, le poster existant est réutilisé. `npm run hero:daily:force` régénère le croquis.

Installateur (réécrit l’unité user ; le défaut conserve `--force --skip-sketch`) :

```bash
bash scripts/install-hero-daily-timer.sh
```

Dépendances hors npm, sur le serveur : `python3` + `pycairo` (`import cairo`), `ffmpeg`, `cwebp` optionnel. Sans `--skip-sketch`, l’absence de Cairo fait échouer le script.

La une (`getUneDuJour()`) n’utilise pas ces fichiers. L’accueil laisse `applyOverride={false}`.

## Deploy nightly et arbre git sale

Le refus « Repo LMDPT dirty — refuse checkout » **n’est pas dans ce dépôt**.

Chaîne constatée :

1. `manusk-jour-ship.timer` (02:30, `RandomizedDelaySec=5400`, fenêtre ~02:30–04:00) → `second-brain/scripts/manusk-jour-ship.mjs` dans `ELServicesToulon/Manusk`. Ce script inventorie `git status --porcelain` mais ne décide pas du checkout LMDPT.
2. S’il déploie, `manusk-lmdpt-deploy.mjs` lance `npm run deploy-lmdpt-ovh` dans `ELServicesToulon/Mediconvoi` (`backend/`).
3. `backend/scripts/deploy-lmdpt-ovh.ts` (`checkoutLmdptRef`) appelle `evaluateDirtyTree` dans `backend/scripts/lib/lmdptDeployGuards.ts`.

`evaluateDirtyTree` refuse **toute** sortie porcelain non vide. Il n’a pas d’allowlist. Un correctif ici ne changerait pas le nightly.

`manusk-ks5-capacity.mjs` (job ~21:01) ne lance ni `astro build` ni `deploy-lmdpt-ovh`. Il enchaîne les work-loops. S’il salit le checkout LMDPT, c’est via une boucle qui réécrit des fichiers, pas via ce gate.

### Allowlist recommandée (à coder dans Mediconvoi, pas ici)

Ne pas ignorer `src/data/elections/` ni `src/data/programmes/` en entier : ces arbres mélangent des JSON historiques édités à la main et des sorties de jobs. Allowlist explicite, d’après les écritures de ce dépôt :

| Chemin | Écrivain |
|--------|----------|
| `src/data/sondages/**` | `sondage:veille` (`latest.json`, `movements.jsonl`, `waves-registry.json`, `brief-latest.md`) |
| `src/data/renifleur/**` | `renifleur` / `sync:all` (`latest.json`, `mix-report.json`, `assemblee-sujets.json`) |
| `src/data/elections/2027-sondages-candidats.json` | `sondage:veille` |
| `src/data/programmes/presidentielle-2027/_index.json` | `programme-veille` |
| `public/sitemap.xml` | `seo:assets` (build) |
| `public/sitemap-index.xml` | `seo:assets` |
| `public/sitemap-news.xml` | `seo:assets` |
| `public/sitemap-images.xml` | `seo:assets` |
| `public/robots.txt` | `seo:assets` |
| `public/illustrations/2027/hero-daily-*` | `hero:daily` |
| `public/illustrations/2027/hero-daily-override.json` | `hero:daily` |
| `public/illustrations/2027/hero-daily-live.jpg` | `hero:daily` |
| `public/illustrations/2027/hero-daily-live.webp` | `hero:daily` |
| `public/videos/2027/hero-daily-live.mp4` | `hero:daily` |
| `public/videos/2027/daily/**` | `hero:daily` |

`src/data/scoop/` n’est écrit par aucun script de ce dépôt. Ne l’ajouter que si un job serveur le réécrit vraiment.

Comportement sûr, une fois le gate déplacé ou étendu dans Mediconvoi :

- un chemin hors allowlist dans `git status --porcelain` → refus, comme aujourd’hui ;
- uniquement des chemins allowlist → ne pas `reset` / `checkout --` / `clean` ces fichiers. Les mettre de côté (`git stash push -- <paths>`, y compris `movements.jsonl`), faire fetch + checkout + pull, puis `stash pop`. En cas de conflit, arrêter le deploy et **laisser le stash**. `movements.jsonl` est un append : le perdre est une perte d’historique.

Tant que `lmdptDeployGuards.ts` n’est pas modifié, le nightly continue de refuser ces fichiers.

## Flux quotidien type

1. Timer 8h → `sync:all:social`
2. Relire `social-drafts/auto/YYYY-MM-DD-renifleur-draft.md`
3. Publier sur X si gate `docs/REVIEW.md` OK
4. Cocher `publication-log.md`
5. Deploy site si contenu changé : `npm run deploy-lmdpt-ovh` (+ restart container si deploy local)
