# LMDPT — API commentaires citoyens + suggestions/alertes + auth lecteurs

## Auth lecteurs (Google · X · Apple · email)

Voir [`docs/AUTH.md`](../docs/AUTH.md).

```bash
# flags
export LMDPT_AUTH_ENABLED=1
export LMDPT_SESSION_SECRET='…'   # 32+ bytes
export LMDPT_PUBLIC_URL=https://lmdpt.iarbre.org
# + secrets providers (Google / X / Apple / SMTP)

node --test lib/auth/auth.test.mjs
```

- `GET /api/auth/providers` — capabilities  
- `GET /api/auth/me` — session  
- `POST /api/comments/publish` — **401** si `LMDPT_AUTH_REQUIRED` (défaut = enabled)

## Flux posteur (commentaires)

1. Saisie du message  
2. `POST /api/comments/preview` → reformulation FR + **teinte d’idées 1er tour** (couleur)  
3. Le posteur **valide** (ou modifie) le texte reformulé  
4. `POST /api/comments/publish` → statut `pending`  
5. Modo approuve → `published`

## Flux suggestions & alertes lecteurs

1. Formulaire public `/contribuer` (ou retour pied de page)  
2. `POST /api/comments/tips/submit` → `pending` (gate anti-haine / anti-autorité religieuse)  
3. Modo : `GET /api/comments/mod/tips-queue` + `POST /api/comments/mod/tips-action` (`approve`|`reject`)  
4. `approve` → visible via `GET /api/comments/tips/published` sur `/contribuer` et section lecteurs de `/analyses/alerte-citoyenne`  
5. Email optionnel : jamais publié ; consentement requis

Stockage : `./data/tips.json`

## Hiérarchie modo

| Rôle | Niveau | Droits |
|------|--------|--------|
| lecteur | 0 | lecture |
| contributeur | 1 | poster (après validation IA) |
| modo | 2 | approuver / masquer |
| modo-senior | 3 | modération avancée (teinte calculée à l’affichage, plus de recolor) |
| redaction | 4 | supervision |

Jetons : **aucun défaut dans le code**. Configurer avant tout déploiement, soit :

- variables `LMDPT_MOD_TOKEN_REDACTION`, `LMDPT_MOD_TOKEN_MODO_SENIOR`, `LMDPT_MOD_TOKEN_MODO`
- soit `data/moderators.json` (hors git) avec des jetons propres

Les placeholders `__REMPLACER_JETON_*__` de `.env.example` sont refusés. Sans jeton utilisable, le processus journalise un avertissement au démarrage et répond **503** aux actions de modération et d’édition (`/api/comments/mod/*`, publication forcée).

UI : `/moderation/`

## Conservation et purge

Règles prévues (à brancher plus tard sur GO — **aucune routine n’est activée** : pas de timer
systemd, pas de cron, pas d’appel au démarrage) :

- propositions rejetées : 12 mois après leur traitement ; publiées et en attente : conservées
- e-mail facultatif des propositions : 12 mois après l’envoi
- comptes : 3 ans sans connexion (sessions associées supprimées)
- commentaires : 3 ans après publication (à défaut création)

```bash
# dry-run (défaut) — affiche des compteurs, n’écrit rien
node comments-api/scripts/retention-purge.mjs

# écriture (après revue des compteurs)
node comments-api/scripts/retention-purge.mjs --apply
```

Chemin des données : `LMDPT_COMMENTS_DATA` ou `comments-api/data`.

**Aucune routine n’est activée.** Les unités `comments-api/deploy/systemd/lmdpt-comments-purge.service` et
`.timer` sont préparées, pas installées. Ne pas les copier ni les `enable` sans revue.

Installation future (à ne lancer que sur GO, après dry-run manuel) :

```bash
# 1. dry-run manuel
LMDPT_COMMENTS_DATA=/home/debian/ks5b/iarbre/le-media-du-premier-tour/comments-api/data \
  node /home/debian/ks5b/iarbre/le-media-du-premier-tour/comments-api/scripts/retention-purge.mjs

# 2. copier les unités puis recharger systemd
sudo cp comments-api/deploy/systemd/lmdpt-comments-purge.service /etc/systemd/system/
sudo cp comments-api/deploy/systemd/lmdpt-comments-purge.timer /etc/systemd/system/
sudo systemctl daemon-reload

# 3. activer le timer (pas le service seul)
sudo systemctl enable --now lmdpt-comments-purge.timer
```

Retour arrière :

```bash
sudo systemctl disable --now lmdpt-comments-purge.timer
sudo rm -f /etc/systemd/system/lmdpt-comments-purge.timer /etc/systemd/system/lmdpt-comments-purge.service
sudo systemctl daemon-reload
```

## Démarrage

```bash
cd comments-api
node server.mjs
# ou systemd : lmdpt-comments.service
```

Nginx LMDPT proxy : `/api/comments/` → `host.docker.internal:8796`.
