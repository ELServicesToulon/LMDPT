# Compte X — Le Media Du Premier Tour (LMDPT)

> Projet civique **séparé** de Mediconvoi.

## Compte unique (canon · 2026-07-26)

| Champ | Valeur |
|-------|--------|
| **Handle** | `@LMDuPremierTour` |
| **URL** | https://x.com/LMDuPremierTour |
| **Nom affiché** | Le Media Du Premier Tour |
| **User id** | `2072732260076224512` |
| **Créé** | juillet 2026 |
| **Statut** | **live** — seul compte X LMDPT |

**Décision Ω 2026-07-26** : garder **uniquement** ce compte. L’ancien relais `@LeMediaDPT` **n’existe plus** — ne plus documenter, ne plus OAuth, ne plus pont repost.

| Ancien | Statut |
|--------|--------|
| `@LeMediaDPT` | **abandonné / n’existe plus** |
| Pont quote-repost `lmdpt-x-repost-bridge` | **off** (GO-auto disabled · pas de 2e compte) |

OAuth / publish / brand : toujours **@LMDuPremierTour** (OAuth1 `.lemedia-x-api.json` ou OAuth2 perso — vérifier `users/me` = `LMDuPremierTour`).

## YouTube — débats en live

| Champ | Valeur |
|-------|--------|
| **Handle cible** | `@LMDuPremierTour` |
| **Statut** | **à créer / activer** — voir `autonomy/lmdpt-youtube-live/` |
| **Site** | Bandeau live + lien footer **off** tant que `PUBLIC_YOUTUBE_ENABLED` n’est pas `true` |
| **Config** | `src/config/youtube.ts` · `PUBLIC_YOUTUBE_*` (voir `.env.example`) |

### Checklist activation YouTube

1. Créer la chaîne YouTube LMDPT (compte Google dédié / Bitwarden)
2. Revendiquer le handle `@LMDuPremierTour`
3. Vérifier que `https://www.youtube.com/@LMDuPremierTour` charge (pas 404)
4. Prod : `PUBLIC_YOUTUBE_ENABLED=true` (+ rebuild/deploy)
5. Live ponctuel : `PUBLIC_YOUTUBE_LIVE_URL=https://www.youtube.com/watch?v=VIDEO_ID` ou `live_url` sur le JSON débat
