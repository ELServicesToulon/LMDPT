# Auth lecteurs LMDPT

**Statut** : code MVP (socle + 4 providers) · prod = `LMDPT_AUTH_ENABLED=1` + secrets Bitwarden  
**API** : `comments-api` · routes `/api/auth/*`  
**Usage** : commentaires citoyens + teinte politique (message), pas SSO Mediconvoi

## Providers

| Id | Flux | Secrets |
|----|------|---------|
| `google` | OAuth2 / OIDC | `LMDPT_GOOGLE_CLIENT_ID` · `LMDPT_GOOGLE_CLIENT_SECRET` |
| `x` | OAuth2 PKCE | `LMDPT_X_OAUTH_CLIENT_ID` · `LMDPT_X_OAUTH_CLIENT_SECRET` |
| `apple` | Sign in with Apple (form_post) | `LMDPT_APPLE_CLIENT_ID` · `TEAM_ID` · `KEY_ID` · `PRIVATE_KEY` |
| `email` | Magic link 15 min | SMTP OVH `ssl0.ovh.net:465` · user `contact@mediconvoi.fr` · ou `LMDPT_SMTP_URL` webhook · dev : log |

### SMTP OVH (prod LMDPT · 2026-07-26)

| Champ | Valeur |
|-------|--------|
| Host | `ssl0.ovh.net` |
| Port | `465` (TLS implicite) |
| User / From | `contact@mediconvoi.fr` |
| Mot de passe | Bitwarden `CONTACT_MEDICONVOI_MAIL_PASSWORD` · env fichier `/etc/lmdpt-comments.env` (root 600) |
| **Pas** `vigi@` | Adresse inexistante — boîte sécu = **`medivigil@mediconvoi.fr`** (mdp **absent** du vault / 535 — voir `Mediconvoi/backend/docs/SMTP-OVH-CONTACT-MEDIVIGIL.md`) |

| Boîte | AUTH | LMDPT |
|-------|------|-------|
| `contact@mediconvoi.fr` | ✅ | **From / User SMTP** (prod) |
| `medivigil@mediconvoi.fr` | ❌ mdp manquant | non branché (sécu Mediconvoi) |

```bash
# smoke
curl -sS -X POST https://lmdpt.iarbre.org/api/auth/email/start \
  -H 'Content-Type: application/json' \
  -d '{"email":"vous@exemple.fr","next":"/compte"}'
# journal : MAGIC LINK sent via SMTP { host: ssl0.ovh.net, from: contact@… }
```

Redirects prod :

```
https://lmdpt.iarbre.org/api/auth/callback/google
https://lmdpt.iarbre.org/api/auth/callback/x
https://lmdpt.iarbre.org/api/auth/callback/apple
```

## Feature flags

| Variable | Défaut | Effet |
|----------|--------|-------|
| `LMDPT_AUTH_ENABLED` | off | Active start OAuth / magic link |
| `LMDPT_AUTH_REQUIRED` | = enabled | `POST /api/comments/publish` → 401 sans session |
| `LMDPT_SESSION_SECRET` | — | HMAC cookie (obligatoire si enabled) |
| `LMDPT_PUBLIC_URL` | `https://lmdpt.iarbre.org` | callbacks + liens mail |
| `LMDPT_AUTH_EMAIL_DEV` | — | expose `devVerifyUrl` dans JSON start |
| `LMDPT_COOKIE_SECURE` | auto https | force Secure |

## Routes

| Méthode | Path |
|---------|------|
| GET | `/api/auth/providers` · `/api/auth/health` |
| GET | `/api/auth/me` |
| POST | `/api/auth/logout` · `/api/auth/profile` |
| GET | `/api/auth/start/{google\|x\|apple}` |
| GET/POST | `/api/auth/callback/{google\|x\|apple}` |
| POST | `/api/auth/email/start` |
| GET | `/api/auth/email/verify` |

## UI

- `/connexion` — 4 boutons + email  
- `/compte` — pseudonyme, providers, logout  
- `CitizenCommentModule` — CTA login si non authentifié  

## Tests

```bash
cd iarbre/le-media-du-premier-tour
node --test comments-api/lib/auth/auth.test.mjs
```

## Nginx

`location /api/auth/` → même upstream que `/api/comments/`  
Fichier prod : `~/lmdpt-website/conf/default.conf` (**root-owned** — L1+ pour éditer).

Snippet à ajouter :

```nginx
  location /api/auth/ {
    proxy_pass http://172.18.0.1:8796/api/auth/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Cookie $http_cookie;
    proxy_pass_header Set-Cookie;
    proxy_read_timeout 90s;
  }
```

Puis `docker exec` / reload nginx conteneur LMDPT.

## DOE

- Email IdP **jamais** dans `publicComment` / UI publique  
- Teinte = **message**, pas identité de compte  
- Rôles modo (jetons) **inchangés**

## Go-live L1+

1. Créer clients OAuth (Google Cloud, X Developer, Apple Developer)  
2. Bitwarden `LMDPT-AUTH-*` → env systemd comments-api  
3. `LMDPT_AUTH_ENABLED=1` · `LMDPT_SESSION_SECRET=…`  
4. Reload nginx (proxy `/api/auth/`)  
5. Smoke : `/api/auth/providers` · magic link · 1 OAuth

## P41-O — secrets branchés (2026-07-26 L1+)

| Provider | enabled | Source vault | Callback à autoriser (humain) |
|----------|---------|--------------|-------------------------------|
| Email | ✅ | `CONTACT_MEDICONVOI_MAIL_PASSWORD` → SMTP contact@ | — |
| Google | ✅ | `iarbre_GOOGLE_OAUTH_CLIENT_*` | `https://lmdpt.iarbre.org/api/auth/callback/google` |
| X | ✅ | `LEMEDIA-DPT-X-API-v2` (`oauth2_client_*`) | `https://lmdpt.iarbre.org/api/auth/callback/x` |
| Apple | ❌ | absent | Services ID + `…/callback/apple` |

Env prod : `/etc/lmdpt-comments.env` (root 600) · restart `lmdpt-comments.service`.

**Google Cloud Console** (client iarbre `1008470530429-…`) : Authorized redirect URIs → ajouter le callback LMDPT.  
**X Developer Portal** (app LeMediaDPT Bridge, client `VURQNG9O…`) : User authentication → Callback URI / Redirect URL → callback X LMDPT.

Sans ces URIs, le bouton redirige vers IdP puis erreur `redirect_uri_mismatch`.

## P41-O2 — redirect URIs (2026-07-26)

**Pack** : `second-brain/projects/lmdpt/docs/2026-07-26-P41-O2-redirect-uris-go-pack.md`

| | |
|--|--|
| Google client (prod) | `748914516227-tgrop94cvom5u9v74b1eqoe4dig6fg3p…` (projet **mediconvoi**) |
| X client | `VURQNG9O…` (LeMediaDPT Bridge) |
| API publique update URI | **inexistante** (Google & X) → **humain console** |
| Probe X | page « Something went wrong » tant que callback LMDPT non ajouté |

Après clics console → smoke navigateur `/connexion`.
