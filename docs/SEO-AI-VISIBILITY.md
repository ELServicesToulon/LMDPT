# Plan marketing — Visibilité moteurs & IA (LMDPT)

**Rôle** : Directeur contenu / marketing civique LMDPT (hors funnel Mediconvoi).  
**Date** : 2026-07-17 · **DecisionTag** : FIX-FIRST → SHIP technique ; GO L1+ pour Search Console / pubs.

## Diagnostic (avant)

| Endpoint | Symptôme |
|----------|----------|
| `/robots.txt` | Renvoyait le **HTML accueil** (try_files SPA) |
| `/sitemap.xml` | Idem — **aucune indexation fiable** |
| `/llms.txt` / `/ai.txt` | Idem — **IA non informées** |
| JSON-LD | Absent |
| `ASTRO_SITE` | Souvent vide → canonicals faibles |

## Livrables techniques (ce sprint)

1. **`public/robots.txt`** — Allow + sitemaps + allow explicite GPTBot/Claude/Perplexity…
2. **`public/sitemap.xml`** (+ images) — généré par `npm run seo:assets`
3. **`public/llms.txt`** + **`public/ai.txt`** — identité, pages prioritaires, règles de citation
4. **JSON-LD** site-wide : `NewsMediaOrganization` + `WebSite` + `WebPage`/`Article`
5. **Meta** : robots, keywords, hreflang fr, link sitemap + llms.txt
6. **nginx** : locations exactes 404 si fichier manquant (plus de faux 200 HTML)
7. **Build** : `seo:assets` avant `astro build` · site canonique `https://lmdpt.iarbre.org`

## Clusters de contenu (SEO sémantique)

| Cluster | Intent | URL pilier |
|---------|--------|------------|
| Présidentielle 2027 | informational | `/analyses/presidentielle-2027-preparation` |
| Pluralité 1er tour | informational | `/` · `/analyses/presidentielle-distorsion` |
| Atlas open data | data | `/atlas/*` |
| AN1T | pédagogie | `/analyses/assemblee-premier-tour` |
| Programmes | comparison | `/analyses/programmes` · comparateur |
| Débat public | news/civic | `/analyses/alerte-citoyenne` |
| Confiance | E-E-A-T | `/charte` · `/sources` · `/a-propos` |

Mots-clés cœur : *premier tour*, *présidentielle 2027*, *pluralité électorale*, *open data élections*, *Democracy Over Elimination*, *LMDPT*.

## Actions IA (citation / RAG)

- Les agents lisent **`llms.txt`** en premier → pages prioritaires listées.
- **`ai.txt`** : train/cite allow-with-attribution ; interdits (partisan, AN1T=loi, listes 2027 non officielles).
- Schéma **NewsMediaOrganization** + sameAs X/GitHub pour désambiguïsation entité.

## Actions manuelles Président (L1+)

| # | Action | Preuve |
|---|--------|--------|
| 1 | Google Search Console — propriété `lmdpt.iarbre.org` + soumettre sitemap | GSC |
| 2 | Bing Webmaster Tools — idem | Bing |
| 3 | (Option) IndexNow clé dans `public/` | doc Bing |
| 4 | Bio X + pin + lien UTM (déjà brouillon Manusk) | X live |
| 5 | Thread SEO soft : « Où vérifier le 1er tour 2027 ? » → lien site | L1+ publish |

## Commandes

```bash
cd ~/iarbre/le-media-du-premier-tour
npm run seo:assets
npm run build:fast          # sans renifleur réseau
# deploy OVH : rsync dist → lmdpt-website/releases + restart lmdpt-website
```

## KPI (30 j)

| KPI | Cible indicative |
|-----|------------------|
| Pages indexées GSC | ≥ 30 URLs |
| Impressions GSC | tendance ↑ |
| Clics organiques | baseline puis +20 % |
| Citations IA (Perplexity / ChatGPT browsing) | présence marque LMDPT sur requêtes « premier tour 2027 open data » |

## Garde-fous DOE

- Pas de clickbait « favori 2027 »
- Pas de black-hat SEO
- Toute pub X = gate `docs/REVIEW.md` + L1+
