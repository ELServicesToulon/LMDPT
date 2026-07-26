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
| modo-senior | 3 | + recolorer la teinte |
| redaction | 4 | supervision |

Jetons seed (à changer) dans `data/moderators.json` :

- `lmdpt-modo-change-me`
- `lmdpt-modo-senior-change-me`
- `lmdpt-redaction-change-me`

UI : `/moderation/`

## Démarrage

```bash
cd comments-api
node server.mjs
# ou systemd : lmdpt-comments.service
```

Nginx LMDPT proxy : `/api/comments/` → `host.docker.internal:8796`.
