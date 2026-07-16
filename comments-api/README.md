# LMDPT — API commentaires citoyens

## Flux posteur

1. Saisie du message  
2. `POST /api/comments/preview` → reformulation FR + **teinte d’idées 1er tour** (couleur)  
3. Le posteur **valide** (ou modifie) le texte reformulé  
4. `POST /api/comments/publish` → statut `pending`  
5. Modo approuve → `published`

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
