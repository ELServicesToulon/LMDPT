# Variables d'environnement — Giscus (rubrique Débats)

Configurer dans GitHub Actions (Settings → Secrets and variables → Actions) :

| Variable | Type | Description |
|----------|------|-------------|
| `PUBLIC_GISCUS_REPO_ID` | Secret | ID du repo (depuis giscus.app) |
| `PUBLIC_GISCUS_CATEGORY_ID` | Secret | ID de la catégorie « Débats » |
| `PUBLIC_GISCUS_REPO` | Variable | Défaut : `ELServicesToulon/LMDPT` |
| `PUBLIC_GISCUS_CATEGORY` | Variable | Défaut : `Débats` |

**Repo ID connu** (node_id GitHub) : `R_kgDOTGlsIg` → variable `PUBLIC_GISCUS_REPO_ID`.

**Catégorie « Débats »** : `50431033` → variable `PUBLIC_GISCUS_CATEGORY_ID`.

Ces valeurs sont aussi en fallback dans `src/config/discussion.ts` pour le déploiement OVH.

## Script d'activation

```bash
# Affiche les IDs (sans token)
node scripts/setup-giscus.mjs

# Active Discussions + crée la catégorie (token admin repo)
GITHUB_TOKEN=ghp_… node scripts/setup-giscus.mjs --create-category
```

## Activation manuelle GitHub Discussions

1. Repo [ELServicesToulon/LMDPT](https://github.com/ELServicesToulon/LMDPT) → Settings → General → Features → **Discussions**
2. Créer une catégorie **Débats**
3. Installer [Giscus](https://giscus.app) sur le repo et copier `repo-id` + `category-id`

En local, Giscus est désactivé par défaut (pas de `PUBLIC_GISCUS_REPO_ID`).
