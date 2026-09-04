# Outils Google gratuits — référencement LMDPT

**Site** : https://lmdpt.iarbre.org  
**Date** : 2026-07-27 · **Ligne** : La démocratie avant l’élimination · **RGPD** : zéro traceur par défaut

Ce document liste **tous les outils Google gratuits** utiles au référencement et ce qui est **câblé dans le site**.

---

## 1. Stack technique (dans le dépôt)

| Outil Google | Gratuit | Intégration LMDPT | Activation |
|--------------|---------|-------------------|------------|
| **Search Console** | Oui | Meta `google-site-verification` + fichier HTML optionnel + sitemaps | Env `PUBLIC_GOOGLE_SITE_VERIFICATION` (+ `_FILE`) |
| **Sitemaps** (web / images / news / index) | Oui | `npm run seo:assets` → `public/sitemap*.xml` | Automatique au build |
| **robots.txt** (Googlebot*) | Oui | Généré (tous crawlers Google Allow) | Automatique |
| **Rich Results / JSON-LD** | Oui | `NewsMediaOrganization` + `WebSite` + `WebPage`/`Article` | Toujours on |
| **Discover** (max-image-preview) | Oui | `meta robots` large images + OG | Toujours on |
| **Analytics 4 (GA4)** | Oui | gtag optionnel | `PUBLIC_GA4_MEASUREMENT_ID=G-…` |
| **Tag Manager (GTM)** | Oui | container optionnel | `PUBLIC_GTM_CONTAINER_ID=GTM-…` |
| **Google Ads tag** | Compte free tier | gtag `AW-…` optionnel (pas de pub auto) | `PUBLIC_GOOGLE_ADS_ID=AW-…` |
| **Consent Mode v2** | Oui | default **denied** si tracking on | `PUBLIC_GOOGLE_CONSENT_MODE_DEFAULT=denied` |
| **Google News sitemap** | Oui | `sitemap-news.xml` | Automatique |
| **Publisher Center** | Oui | Démarche manuelle | Voir §3 |
| **PageSpeed Insights** | Oui | Externe | Mesure manuelle / CI future |
| **Rich Results Test** | Oui | Externe | URL page |
| **Mobile-Friendly Test** | Oui | Externe (legacy) | URL page |
| **Lighthouse** (Chrome) | Oui | DevTools | Local |
| **Keyword Planner** | Oui (compte Ads) | Externe | Recherche sémantique |
| **Google Trends** | Oui | Externe | Veille sujets |
| **Business Profile** | Oui | N/A média pure-player (option si local) | Manuel |
| **Merchant Center** | Oui | Hors scope (pas e-commerce produits) | — |
| **AdSense** | Oui | Hors scope référencement (monétisation = L1+) | — |
| **IndexNow** | — | Microsoft/Bing, pas Google | Voir Bing Webmaster |

Fichiers code :

- `src/lib/google-seo.ts` — config env
- `src/components/GoogleSeoTools.astro` — head
- `src/components/GoogleSeoBody.astro` — noscript GTM
- `scripts/generate-seo-assets.ts` — sitemaps + robots
- `src/lib/seo.ts` — JSON-LD / meta classiques

---

## 2. Variables d’environnement (build)

```bash
# Search Console — méthode balise meta (recommandé)
PUBLIC_GOOGLE_SITE_VERIFICATION=token_fourni_par_gsc

# Search Console — méthode fichier HTML (optionnel, en plus ou à la place)
PUBLIC_GOOGLE_SITE_VERIFICATION_FILE=googleXXXXXXXX.html
# (réutilise le même token que ci-dessus pour le contenu du fichier)

# Analytics (OFF par défaut — RGPD)
PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXX

# Tag Manager (OFF par défaut — préférer GTM *ou* gtag direct)
PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# Google Ads tag seul (rare pour SEO pur)
PUBLIC_GOOGLE_ADS_ID=AW-000000000

# Consent Mode : denied (défaut) | granted (uniquement si bannière + consentement)
PUBLIC_GOOGLE_CONSENT_MODE_DEFAULT=denied
```

Passer ces variables dans le build deploy (`deploy-lmdpt-ovh` lit le `process.env` du backend / shell).

**Sans aucune variable** : le site reste **sans cookie analytics**, uniquement SEO technique (sitemaps, schema, robots).

---

## 3. Actions manuelles Président (L1+ comptes Google)

| # | Outil | Action | Preuve |
|---|--------|--------|--------|
| 1 | [Search Console](https://search.google.com/search-console) | Propriété `https://lmdpt.iarbre.org` (préfixe URL ou domaine `iarbre.org`) | Propriété vérifiée |
| 2 | Search Console | Soumettre **`/sitemap-index.xml`** | Sitemap « Succès » |
| 3 | Search Console | Inspection d’URL sur `/` + 3 piliers | « URL dans Google » ou demandée |
| 4 | [Publisher Center](https://publishercenter.google.com/) | Demande Google News / Discover (média civique) | Dossier soumis |
| 5 | [PageSpeed Insights](https://pagespeed.web.dev/) | Mesure mobile + desktop | Score baseline |
| 6 | [Rich Results Test](https://search.google.com/test/rich-results) | Tester accueil + une analyse | JSON-LD OK |
| 7 | GA4 (option) | Créer propriété + flux web → coller `G-…` | Env + rebuild + deploy Ω |
| 8 | GTM (option) | Conteneur + tags Search Console/GA4 | Env + deploy Ω |
| 9 | [Trends](https://trends.google.com/) | Veille « présidentielle 2027 », « premier tour » | Brief rédaction |
| 10 | Keyword Planner | Clusters sémantiques (si compte Ads) | Note éditoriale |

---

## 4. Commandes

```bash
cd ~/iarbre/le-media-du-premier-tour
npm run seo:assets          # robots + 4 sitemaps
npm run build:fast          # sans renifleur
# puis deploy L1+ Ω :
# cd mediconvoi/backend && npm run deploy-lmdpt-ovh
```

Vérifications post-deploy :

```bash
curl -sI https://lmdpt.iarbre.org/robots.txt | head -5
curl -s https://lmdpt.iarbre.org/sitemap-index.xml | head -20
curl -s https://lmdpt.iarbre.org/sitemap-news.xml | head -20
```

---

## 5. Garde-fous DOE / RGPD

- Pas de black-hat, pas de keyword stuffing partisan.
- **GA4 / GTM / Ads** : consentement requis en FR avant `analytics_storage=granted` — bannière cookies = chantier séparé L1+.
- Tant que Consent Mode = `denied`, les hits utiles GA4 restent limités (modèle consentement).
- **Cloudflare Web Analytics** (`PUBLIC_CF_WEB_ANALYTICS_TOKEN`) est **indépendant** de ce Consent Mode : beacon cookieless, chargé sans attendre le consentement pubs. Voir `docs/SYNC-OPS.md` (OVH KS-5-B).
- Confidentialité (`/confidentialite`) doit refléter l’activation réelle des IDs.

---

## 6. KPI Search Console (30 j)

| KPI | Cible indicative |
|-----|------------------|
| Pages indexées | ≥ 40 |
| Impressions | tendance ↑ |
| Clics organiques | baseline puis +20 % |
| Erreurs couverture | 0 bloquantes |
| Core Web Vitals | « Bon » mobile prioritaire |
