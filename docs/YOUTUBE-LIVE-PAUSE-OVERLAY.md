# YouTube — Superposition pour les pauses (live LMDPT)

**Chaîne** : `UCqSj6qYmHXtM1pSLc-DVCVA`  
**Studio** : https://studio.youtube.com/channel/UCqSj6qYmHXtM1pSLc-DVCVA/livestreaming  

### Superposition configurée (Studio — juil. 2026)

| Champ | Valeur |
|-------|--------|
| **Page Live Apps overlay** | https://www.youtube.com/live_apps/overlay?id=ChhVQ3FTajZxWW1IWHRNMXBTTGMtRFZDVkESC0htN04zMFZtRDgz |
| **Channel ID (dans l’id)** | `UCqSj6qYmHXtM1pSLc-DVCVA` |
| **Ressource liée** | `Hm7N30VmD83` (id YouTube 11 car. — vidéo ou asset de superposition) |
| **Watch (si c’est une vidéo)** | https://www.youtube.com/watch?v=Hm7N30VmD83 |

> Ouvre le lien **connecté au compte propriétaire de la chaîne**. Sans session Google LMDPT, la page Live Apps ne charge pas le panneau.

## À quoi ça sert

Pendant une **pause pub** (mid-roll), si YouTube n’a pas d’annonce à diffuser, la **superposition** s’affiche à la place.  
Elle doit aussi être gérée côté **encodeur tiers** (OBS, Streamlabs…) pour coller à la pause côté Studio.

## Options Studio

| Option | Quand l’utiliser | Recommandation LMDPT |
|--------|------------------|----------------------|
| **Utiliser la superposition par défaut** | Compte à rebours = durée de la pause | **OK pour le 1er live** (simple, zéro prep) |
| **Choisir parmi vos vidéos** | Écran de marque (logo, message) | **Préféré dès le 2e live** — vidéo déjà uploadée sur la chaîne |

## Vidéo de pause LMDPT (prête)

Fichiers dans le repo :

| Fichier | Usage |
|---------|--------|
| `public/brand/live-pause-overlay.mp4` | **Uploader sur YouTube** → choisir comme superposition |
| `public/brand/live-pause-overlay.png` | Source image / fond OBS |
| `public/brand/live-pause-overlay.svg` | Source vectorielle |

Message affiché :

- **PAUSE** — Le débat reprend dans un instant  
- Ligne DOE : Faits officiels · Sans filtre · Vote pour, pas contre  
- Site : lmdpt.iarbre.org  

## Procédure Studio (superposition personnalisée)

1. Ouvrir [Studio → Contenu](https://studio.youtube.com/) (chaîne LMDPT).
2. **Importer** `live-pause-overlay.mp4` (visibilité : **Non répertoriée** conseillée — pas pour le public en VOD).
3. Aller dans **Paramètres → Superposition pour les pauses** (ou flux live → paramètres).
4. Choisir **Choisir parmi vos vidéos** → sélectionner cette vidéo.
5. Enregistrer.

Tant que la vidéo n’est **pas sur la chaîne**, l’option « choisir parmi vos vidéos » restera vide.

## Encodeur tiers (OBS)

La superposition Studio **ne remplace pas** toujours l’écran côté encodeur.

### Scène OBS recommandée

1. Scène **Live** : cam / guest / slides.  
2. Scène **Pause LMDPT** : source image `live-pause-overlay.png` (plein écran 1920×1080) ou média `live-pause-overlay.mp4` en boucle.  
3. Pendant une pause pub : basculer manuellement sur **Pause LMDPT** (ou hotkey).  
4. Fin de pause : revenir sur **Live**.

### Raccourcis suggérés

| Touche | Action |
|--------|--------|
| F8 | Scène Live |
| F9 | Scène Pause |

## Recommandation opérationnelle

| Phase | Choix |
|-------|--------|
| Streaming pas encore activé | Rien à brancher en prod site |
| 1er test live | **Superposition par défaut** (compte à rebours) |
| Lives débats réguliers | Vidéo LMDPT uploadée + scène OBS Pause |
| Site public | `PUBLIC_YOUTUBE_ENABLED` seulement après streaming OK + GO |

## Garde-fous DOE

- Pas de sondage, pas de « favori », pas de tier list sur l’écran pause.  
- Texte neutre, pédagogique, aligné charte.  
- Pas de logo de parti sur la pause générique.
