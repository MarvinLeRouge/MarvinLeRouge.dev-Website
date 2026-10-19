[🇫🇷 Version française](docs/i18n/fr/CONTRIBUTING.fr.md) | 🇬🇧 English version

---

# Contributing to MarvinLeRouge.dev-Website

This is the source of a personal website. Bug reports and fixes (broken links, accessibility issues, rendering problems) are welcome. Content changes (texts, project sheets) are not accepted from outside contributors.

## Prerequisites

- **Node.js 24** (see `.nvmrc`)
- **gitleaks** on your `PATH`: the pre-commit hook refuses to commit without it ([releases](https://github.com/gitleaks/gitleaks/releases))
- **git-cliff** (optional): regenerates `CHANGELOG.md` after each commit, skipped with a notice if missing

## Local setup

```bash
git clone https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website.git
cd MarvinLeRouge.dev-Website
npm install      # also installs the Husky git hooks
npx playwright install chromium   # browser for the end-to-end tests, once
npm run dev
```

## Quality checks

| Command                | Purpose                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run lint`         | ESLint (TypeScript and Astro rules)                                                                           |
| `npm run format:check` | Prettier                                                                                                      |
| `npm run check`        | Astro and TypeScript diagnostics                                                                              |
| `npm run build`        | Static build into `dist/`                                                                                     |
| `npm run test:cov`     | Vitest unit tests, 80% coverage gate on `src/scripts/`, `src/i18n/` and `src/content/`                        |
| `npm run test:e2e`     | Playwright and axe (WCAG 2.2 A and AA) on the built site, run `npm run build:e2e` first (adds the test sheet) |

The pre-commit hook runs ESLint and Prettier on staged files, `astro check`, and a gitleaks scan of the staged changes. The post-commit hook regenerates `CHANGELOG.md` with git-cliff.

The CI runs all of the above on every pull request, plus an internal link check of `dist/` (lychee), `npm audit`, and a build and smoke test of the production Docker image (`scripts/smoke-docker.sh`). The `CI status` job aggregates the results and is the required check on `main`.

## Workflow

1. Create a branch off `main`.
2. Make your change.
3. Commit following the convention below.
4. Push and open a pull request against `main`.
5. CI must pass before review.

## Branch naming

`type/nnn-short-description`, where `nnn` is the roadmap task number (see [docs/roadmap.md](docs/roadmap.md)), for example `feat/005-view-switch`. Lowercase kebab-case.

## Commit convention

Follow [Conventional Commits](https://www.conventionalcommits.org/): imperative mood, lowercase summary, no trailing period, mandatory `Modified files:` section.

```
<type>(<optional scope>): <short summary>

Modified files:
- path/to/file-a.ext - what was changed
- path/to/file-b.ext - what was changed
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `perf`, `ci`.

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold it.

## License

By contributing, you agree that your code contributions will be licensed under the project's [MIT License](LICENSE). Site content (texts, images) is not open to contributions.
