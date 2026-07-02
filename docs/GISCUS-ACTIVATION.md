# Activation Giscus — checklist (P7-4)

**État prod (juil. 2026)** : Discussions activées, catégorie **Débats**, app Giscus installée sur `ELServicesToulon/LMDPT`. Widget vérifié sur `/debats/vote-utile-pluralite/`.

## IDs connus

| Variable | Valeur |
|----------|--------|
| `PUBLIC_GISCUS_REPO` | `ELServicesToulon/LMDPT` |
| `PUBLIC_GISCUS_REPO_ID` | `R_kgDOTGlsIg` |
| `PUBLIC_GISCUS_CATEGORY` | `Débats` |
| `PUBLIC_GISCUS_CATEGORY_ID` | `50431033` |

Fallbacks codés dans `src/config/discussion.ts` pour le build OVH sans `.env`.

## Activation en une commande (token admin repo)

**Ne pas** utiliser le texte `ghp_VOTRE_TOKEN` — c’est un placeholder. Il faut un **vrai** Personal Access Token.

### Créer le token

1. [github.com/settings/tokens](https://github.com/settings/tokens) → **Fine-grained** (recommandé) ou **Classic**
2. Accès au repo **ELServicesToulon/LMDPT** avec permissions **Administration** (pour activer Discussions) + **Contents** read
3. Classic : coche **`repo`** (accès complet aux repos privés si besoin)
4. Copier le token (il ne s’affiche qu’une fois)

### Lancer le script

```bash
cd ~/iarbre/le-media-du-premier-tour

# Remplacer par votre vrai token (ghp_… ou github_pat_…)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx npm run giscus:setup -- \
  --create-category \
  --create-discussions \
  --write-env ../../Mediconvoi/backend/.env
```

Alternative sans historique shell : `read -s GITHUB_TOKEN && export GITHUB_TOKEN` puis la commande `npm run giscus:setup …`

Puis :

1. Installer [l’app Giscus](https://github.com/apps/giscus) sur le repo
2. `cd Mediconvoi/backend && npm run deploy-lmdpt-ovh`
3. Vérifier `/debats/vote-utile-pluralite` — widget en bas de page

## Manuel (sans script)

1. Repo → **Settings** → **Features** → **Discussions** ✓
2. Créer catégorie **Débats**
3. [giscus.app](https://giscus.app) → copier `category-id`
4. Ajouter dans `Mediconvoi/backend/.env` :
   ```
   PUBLIC_GISCUS_REPO_ID=R_kgDOTGlsIg
   PUBLIC_GISCUS_CATEGORY_ID=DIC_…
   ```
5. Créer 3 fils (titres = questions des débats) ou relancer `--create-discussions`

## Débats à créer

| `discussion_id` | Page |
|-----------------|------|
| `vote-utile-pluralite` | `/debats/vote-utile-pluralite` |
| `desistements-second-tour` | `/debats/desistements-second-tour` |
| `assemblee-premier-tour` | `/debats/assemblee-premier-tour` |
