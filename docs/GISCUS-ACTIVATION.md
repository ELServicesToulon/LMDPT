# Activation Giscus — checklist (P7-4)

Discussions **désactivées** sur `ELServicesToulon/LMDPT` (juil. 2026). Sans catégorie « Débats », les embeds restent en mode lien GitHub.

## IDs connus

| Variable | Valeur |
|----------|--------|
| `PUBLIC_GISCUS_REPO` | `ELServicesToulon/LMDPT` |
| `PUBLIC_GISCUS_REPO_ID` | `R_kgDOTGlsIg` |

`PUBLIC_GISCUS_CATEGORY_ID` → obtenu après création de la catégorie.

## Activation en une commande (token admin repo)

```bash
cd ~/iarbre/le-media-du-premier-tour

GITHUB_TOKEN=ghp_VOTRE_TOKEN npm run giscus:setup -- \
  --create-category \
  --create-discussions \
  --write-env ../../Mediconvoi/backend/.env
```

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
