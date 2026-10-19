🇫🇷 Version française | [🇬🇧 English version](project-sheets.md)

---

# Fiches projet

Chaque fiche projet présente un projet en deux vues : une **vue recruteur** courte (lue en 30 secondes) et une **vue lead dev** détaillée. Une fiche existe une fois par langue.

## Fichiers

```
src/content/projects/
  fr/<slug>.md     version française, publiée sur /projets/<slug>/
  en/<slug>.md     version anglaise, publiée sur /en/projects/<slug>/
  images/          captures d'écran
```

Le même nom de fichier dans `fr/` et `en/` relie les deux versions d'une fiche (changement de langue, `hreflang`). Une fiche peut n'exister que dans une langue.

## Format

L'**en-tête** (frontmatter) contient la vue recruteur et les métadonnées. Il est validé au build : un champ manquant ou invalide fait échouer le build. Le **corps Markdown** est la vue lead dev.

```markdown
---
title: JobFlow
tagline: Une phrase qui dit ce que fait le projet.
stack: [Python, SQL] # au moins un élément
repo: https://github.com/MarvinLeRouge/JobFlow # https, GitHub uniquement
screenshot:
  src: ../images/jobflow.png # chemin relatif à la fiche
  alt: Ce que montre la capture # obligatoire, non vide
keywords: [Pipelines de données, Tests, CI] # 3 ou 4 mots-clés recruteur
recruiter:
  problem: Le problème de départ, en une ou deux phrases.
  built: Ce qui a été construit, en une ou deux phrases.
  result: Le résultat, en ordre de grandeur.
adrs: # facultatif
  - title: 'ADR-0002 : registre JSON indexé par Message-ID'
    url: https://github.com/MarvinLeRouge/JobFlow/blob/main/docs/adr/0002-....md
demo: https://... # facultatif, https
order: 1 # position dans l'index des projets
draft: true # true par défaut
---

Vue lead dev, à la première personne.

### Architecture

Les titres du corps commencent au niveau 3 (`###`) : le niveau 2 est le titre de la vue.
```

Un exemple complet se trouve dans `src/content/projects/fr/example.md` (un brouillon, jamais publié).

## Publication

- Une fiche est un **brouillon par défaut**. Les brouillons sont visibles avec `npm run dev` pour la relecture, et jamais construits en production.
- Publier une fiche demande un `draft: false` explicite, après relecture par le développeur.

## Règles d'écriture

Vérifiées par les tests unitaires :

- pas de tiret cadratin, guillemets et apostrophes droits uniquement ;
- les titres du corps commencent au niveau 3.

Vérifiées à la relecture :

- vue recruteur sobre et factuelle ; vue lead dev à la première personne, avec la pointe d'humour de la page d'accueil ;
- uniquement des faits stables ou des ordres de grandeur : pas de nombre exact de tests, de couverture, d'endpoints ni de versions, qui relèvent du README du projet et de ses badges ;
- aucune information confidentielle (CoExel : description générique uniquement).
