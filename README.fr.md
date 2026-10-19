🇫🇷 Version française | [🇬🇧 English version](README.md)

---

# 🌐 MarvinLeRouge.dev-Website

> _Sources de [marvinlerouge.dev](https://marvinlerouge.dev) : site personnel d'un développeur backend / data engineer, avec des fiches projet bilingues proposant une vue recruteur et une vue technique. Site statique construit avec Astro._

[![CI](https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website/actions/workflows/ci.yml/badge.svg)](https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website/actions/workflows/ci.yml)
[![Deploy](https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website/actions/workflows/build-deploy.yml)
[![Coverage](https://img.shields.io/codecov/c/github/MarvinLeRouge/MarvinLeRouge.dev-Website/main?flag=frontend&label=coverage&logo=codecov)](https://app.codecov.io/gh/MarvinLeRouge/MarvinLeRouge.dev-Website)
[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/github/license/MarvinLeRouge/MarvinLeRouge.dev-Website?cacheSeconds=3600)](LICENSE)

---

## À propos

Le site complète le profil GitHub : GitHub montre le code, le site explique la réflexion derrière (décisions de conception, difficultés, études de cas).

- Sortie entièrement statique : HTML et CSS, sans JavaScript côté client hormis de petites améliorations progressives.
- L'adresse de contact n'apparaît jamais en clair dans le HTML : un petit script l'affiche, avec une forme épelée en repli sans JavaScript.
- Français d'abord à la racine, anglais sous `/en/`. La langue choisie avec le sélecteur est mémorisée dans le navigateur (`localStorage`, sans cookie).
- Aucune mesure d'audience.
- L'accessibilité est une contrainte de conception, pas un ajout après coup.

---

## Stack technique

| Couche     | Technologie                                                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Générateur | ![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=white&style=flat-square)                                                                                                     |
| Langage    | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)                                                                                      |
| Lint       | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white&style=flat-square)                                                                                                  |
| Formatage  | ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black&style=flat-square)                                                                                            |
| Service    | ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=flat-square) ![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white&style=flat-square) |
| Tests      | Vitest, Playwright, axe-core, lychee                                                                                                                                                                 |
| Hooks git  | Husky, lint-staged, gitleaks, git-cliff                                                                                                                                                              |

---

## Développement

Nécessite Node.js 24 (voir `.nvmrc`) et gitleaks (voir [CONTRIBUTING.fr.md](docs/i18n/fr/CONTRIBUTING.fr.md)).

```bash
npm install          # dépendances et hooks git
npm run dev          # serveur de développement local avec rechargement à chaud
npm run build        # build statique dans dist/
npm run build:e2e    # idem, avec la fiche de test publiée dont les tests e2e ont besoin
npm run preview      # sert localement le site construit
npm run check        # diagnostics Astro et TypeScript
npm run lint         # ESLint
npm run format:check # Prettier
npm test             # tests unitaires (Vitest)
npm run test:cov     # tests unitaires avec la barrière de couverture
npm run test:e2e     # tests de bout en bout et d'accessibilité sur le site construit par build:e2e
npm run social-images # régénère les images d'aperçu des liens, favicon.ico et les icônes de l'avatar
npm run diagrams     # régénère les schémas des fiches projet (SVG) à partir de leurs sources Mermaid
```

### Docker

Les deux services passent par le Traefik local (réseau externe `traefik-public`). Ajouter `website.marvinlerouge.local` et `website-prod.marvinlerouge.local` à `/etc/hosts`.

```bash
docker compose up --build                 # serveur de dev avec rechargement à chaud sur http://website.marvinlerouge.local
docker compose --profile prod up --build  # image de production (Nginx) sur http://website-prod.marvinlerouge.local
scripts/smoke-docker.sh http://website-prod.marvinlerouge.local   # codes HTTP, en-têtes, cache
PLAYWRIGHT_BASE_URL=http://website-prod.marvinlerouge.local npm run test:e2e   # tests e2e avec la vraie CSP (tests de fiche sautés : pas de fiche de test dans l'image)
```

`docker-compose.prod.yml` décrit la stack de production, déployée sur le serveur par le workflow `Build & Deploy` après chaque merge sur `main`. Déploiement, retour arrière et diagnostic : [docs/operations.fr.md](docs/operations.fr.md).

---

## Structure du projet

```
src/
  assets/      polices et avatar auto-hébergés, licences des polices
  components/  sections de page réutilisables
  content/     fiches projet (Markdown, FR et EN) et leur schéma, voir docs/project-sheets.fr.md
  i18n/        langues, liens d'identité et tous les textes affichés (FR, EN)
  layouts/     gabarits de page (en-tête du document, structure commune)
  pages/       un fichier par route
  scripts/     scripts client (préférence de langue, affichage de l'email, sélecteur de vue des fiches, agrandissement des captures)
  styles/      feuilles de style globales
tests/
  e2e/         tests Playwright et axe sur le site construit
  unit/        tests Vitest des scripts client et de la logique des langues
public/        fichiers servis tels quels (favicons, icônes d'écran d'accueil, images d'aperçu des liens)
docker/        configuration Nginx de l'image de production
docs/          feuille de route, guide d'exploitation, guide des fiches projet et fichiers communautaires traduits
scripts/       utilitaires des hooks git, test de fumée Docker, générateurs d'images d'aperçu et de schémas
```

---

## Feuille de route

Voir [docs/roadmap.fr.md](docs/roadmap.fr.md).

---

## Licence

Le code source est publié sous [licence MIT](LICENSE). Le contenu du site (textes, fiches projet, études de cas, captures et images) n'est pas couvert par cette licence : tous droits réservés. Les polices de `src/assets/fonts/` (Bebas Neue, Share Tech Mono) sont distribuées sous SIL Open Font License 1.1, voir les fichiers de licence placés à côté.
