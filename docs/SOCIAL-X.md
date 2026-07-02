# Compte X — Le Média du Premier Tour (LMDPT)

> Projet civique **séparé** de Mediconvoi.

## Compte live

| Champ | Valeur |
|-------|--------|
| **Handle** | `@LMDuPremierTour` |
| **URL** | https://x.com/LMDuPremierTour |
| **Nom affiché** | Le Media Du Premier Tour |
| **Créé** | juillet 2026 |
| **Statut** | **live** — profil à compléter (bio + pin) |

## À compléter sur X (checklist)

- [ ] Bio courte → brouillon Manusk `second-brain/projects/lmdpt/social-drafts/2026-07-02-profil-bio-pin-x.md`
- [ ] Lien site : `https://lmdpt.iarbre.org?utm_source=x&utm_medium=organic&utm_campaign=bio_link`
- [ ] Avatar + bannière → **PNG prêts** : `public/brand/lmdpt-avatar-x.png` · `lmdpt-banner-x.png` (regénérer : `npm run brand:png`)
- [ ] 2FA activée → Bitwarden `LMDPT-X-ACCOUNT`
- [ ] **Post épinglé** → brouillon Manusk `social-drafts/2026-07-02-profil-bio-pin-x.md`
- [ ] **Thread + semaine 1** → `social-drafts/2026-07-pack-publication-semaine1-x.md`
- [ ] **Semaine 2** → `social-drafts/2026-07-pack-publication-semaine2-x.md`
- [ ] **Suivi publication** → `social-drafts/publication-log.md`
- [ ] **Avatar / bannière** → `public/brand/lmdpt-avatar-x.png` · `lmdpt-banner-x.png` (+ SVG sources)

### Bio recommandée (160 car. max) — copy-paste

```
Média civique · 1er tour · open data
Democracy Over Elimination
Pas de sondages. Pas de tier list.
🔗 ci-dessous
```

### Post épinglé — copy-paste

```
Bienvenue sur Le Média du Premier Tour.

Nous documentons la pluralité du 1er tour (open data, sources officielles) et la distorsion 1er → 2nd tour — sans sondage, sans « favori », sans tier list.

Présidentielle 2027 : 18 avril · 2 mai
Dossier + atlas : https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x&utm_medium=organic&utm_campaign=pinned
```

## Handles non retenus

| Handle | Note |
|--------|------|
| `@lmdpt` | Pris (autre compte) |
| `@LeMediaDuPremierTour` | Non utilisé — handle retenu : `@LMDuPremierTour` |

## Intégration site

- Config : `src/config/social.ts`
- Footer : lien `@LMDuPremierTour` sur toutes les pages (`BaseLayout.astro`)

## Règles éditoriales X (cf. `docs/EDITORIAL.md`)

| OK | Interdit |
|----|----------|
| Atlas, analyses, veille factuelle (renifleur) | Sondages comme vérité |
| Liens vers pages sourcées | Tier list / « favoris » |
| Contexte distorsion 1er/2nd tour | Buzz sans source |
| Threads pédagogiques open data | Prise de parti déguisée |

## Premiers posts (brouillon — revue humaine avant publish)

1. **Lancement** — présentation DOE + lien site
2. **Calendrier 2027** — 18 avril / 2 mai (source gouvernement)
3. **Dossier préparation** — lien `/analyses/presidentielle-2027-preparation`

## Automatisation brouillons (revue humaine)

```bash
npm run renifleur          # fetch RSS → latest.json
npm run renifleur:draft    # brouillon X → second-brain/.../social-drafts/auto/
npm run renifleur:draft:refresh  # refetch + brouillon
```

Sortie : `second-brain/projects/lmdpt/social-drafts/auto/YYYY-MM-DD-renifleur-draft.md`  
**Jamais** auto-post — gate `docs/REVIEW.md` + cocher `publication-log.md`.

### Cycle sync (opt-in brouillon)

```bash
npm run sync:all              # build standard — pas de brouillon X
npm run sync:all:social       # data + renifleur + brouillon X
```

Cron exemple (1×/jour, 8h) :

```cron
0 8 * * * cd /home/debian/iarbre/le-media-du-premier-tour && npm run sync:all:social >> /tmp/lmdpt-sync.log 2>&1
```

## Automatisation future (hors scope)

- ~~Renifleur RSS → brouillons threads~~ → `npm run renifleur:draft` (2026-07-02)
- Pas d'auto-post sans GO L1+

## Historique

| Date | Action |
|------|--------|
| 2026-07-02 | Fiche compte X LMDPT créée |
| 2026-07-02 | Agent **lmdpt-social** + skill `lmdpt-social-director` · `/lmdpt-social` |
| 2026-07-02 | Pipeline `npm run renifleur:draft` → `social-drafts/auto/` |
| 2026-07-02 | PNG avatar/bannière/OG + meta `summary_large_image` sur le site |
