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

## Flux quotidien type

1. Timer 8h → `sync:all:social`
2. Relire `social-drafts/auto/YYYY-MM-DD-renifleur-draft.md`
3. Publier sur X si gate `docs/REVIEW.md` OK
4. Cocher `publication-log.md`
5. Deploy site si contenu changé : `npm run deploy-lmdpt-ovh` (+ restart container si deploy local)
