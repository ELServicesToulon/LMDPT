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

Activation Discussions sur le repo GitHub :

```bash
GITHUB_TOKEN=ghp_… node scripts/setup-giscus.mjs --create-category
```

Puis ajouter les IDs dans `Mediconvoi/backend/.env` et redéployer.

## Flux quotidien type

1. Timer 8h → `sync:all:social`
2. Relire `social-drafts/auto/YYYY-MM-DD-renifleur-draft.md`
3. Publier sur X si gate `docs/REVIEW.md` OK
4. Cocher `publication-log.md`
5. Deploy site si contenu changé : `npm run deploy-lmdpt-ovh`
