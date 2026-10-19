🇫🇷 Version française | [🇬🇧 English version](../../../CONTRIBUTING.md)

---

# Contribuer à MarvinLeRouge.dev-Website

Ce dépôt contient les sources d'un site personnel. Les signalements et corrections de bugs (liens cassés, problèmes d'accessibilité, défauts d'affichage) sont les bienvenus. Les modifications de contenu (textes, fiches projet) ne sont pas acceptées de la part de contributeurs extérieurs.

## Prérequis

- **Node.js 24** (voir `.nvmrc`)
- **gitleaks** dans le `PATH` : le hook pre-commit refuse de commiter sans lui ([releases](https://github.com/gitleaks/gitleaks/releases))
- **git-cliff** (facultatif) : régénère `CHANGELOG.md` après chaque commit, ignoré avec un avertissement s'il est absent

## Installation locale

```bash
git clone https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website.git
cd MarvinLeRouge.dev-Website
npm install      # installe aussi les hooks git Husky
npx playwright install chromium   # navigateur des tests de bout en bout, une seule fois
npm run dev
```

## Contrôles qualité

| Commande               | Rôle                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run lint`         | ESLint (règles TypeScript et Astro)                                                                      |
| `npm run format:check` | Prettier                                                                                                 |
| `npm run check`        | Diagnostics Astro et TypeScript                                                                          |
| `npm run build`        | Build statique dans `dist/`                                                                              |
| `npm run test:cov`     | Tests unitaires Vitest, barrière de couverture de 80 % sur `src/scripts/`, `src/i18n/` et `src/content/` |
| `npm run test:e2e`     | Playwright et axe (WCAG 2.2 A et AA) sur le site construit, lancer `npm run build` avant                 |

Le hook pre-commit lance ESLint et Prettier sur les fichiers indexés, `astro check`, et un scan gitleaks des modifications indexées. Le hook post-commit régénère `CHANGELOG.md` avec git-cliff.

La CI exécute tous ces contrôles sur chaque pull request, ainsi qu'une vérification des liens internes de `dist/` (lychee), `npm audit`, et la construction et le test de fumée de l'image Docker de production (`scripts/smoke-docker.sh`). Le job `CI status` agrège les résultats : c'est le contrôle obligatoire sur `main`.

## Processus

1. Créer une branche à partir de `main`.
2. Faire la modification.
3. Commiter selon la convention ci-dessous.
4. Pousser et ouvrir une pull request vers `main`.
5. La CI doit passer avant la revue.

## Nommage des branches

`type/nnn-description-courte`, où `nnn` est le numéro de la tâche dans la feuille de route (voir [docs/roadmap.fr.md](../../roadmap.fr.md)), par exemple `feat/005-view-switch`. En minuscules, kebab-case.

## Convention de commit

Suivre les [Conventional Commits](https://www.conventionalcommits.org/fr/) : mode impératif, résumé en minuscules, sans point final, section `Modified files:` obligatoire. Les messages sont rédigés en anglais.

```
<type>(<scope facultatif>): <short summary>

Modified files:
- path/to/file-a.ext - what was changed
- path/to/file-b.ext - what was changed
```

Types : `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `ci`.

## Code de conduite

Ce projet suit le [code de conduite](CODE_OF_CONDUCT.fr.md). En participant, vous vous engagez à le respecter.

## Licence

En contribuant, vous acceptez que vos contributions de code soient publiées sous la [licence MIT](../../../LICENSE) du projet. Le contenu du site (textes, images) n'est pas ouvert aux contributions.
