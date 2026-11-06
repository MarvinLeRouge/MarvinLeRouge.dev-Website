---
title: Engineering-Radar
tagline: Local audit system that scores the quality of my repositories against a versioned methodology, from the output of well-known analysis tools.
stack: [Python, FastAPI, SQLModel, SQLite, Vue 3, TypeScript, Docker]
repo: https://github.com/MarvinLeRouge/Engineering-Radar
screenshot:
  src: ../images/engineering-radar.png
  full: ../images/engineering-radar-full.avif
  alt: 'Engineering-Radar Trends tab on its own repository: history of the global score and of the Security and Maintainability categories, then history of the risk weighted by severity'
keywords: [Software quality, Static analysis, Python / FastAPI, Vue.js]
recruiter:
  problem: A portfolio of about ten repositories, across several stacks. Each project improves on its own, but the whole stays uneven, review findings get forgotten and quality drifts. Tracking it by hand does not last.
  built: A local audit system, with a Python CLI, a FastAPI API and a Vue 3 dashboard. It runs 34 well-known analysis tools according to each repository's stack, then scores their results on 30 criteria, against a versioned quality framework. Every score rests on evidence, and the top findings feed an improvement roadmap.
  result: Four repositories are audited, Engineering-Radar itself among them. I use it several times a week, to improve the quality of the repositories as well as that of the audit. 8 of the framework's 15 categories are covered.
lastAction: Explanatory note on finding verdicts, kept from one audit to the next
adrs:
  - title: 'ADR-0004: a pinned toolchain, installed by the radar'
    url: https://github.com/MarvinLeRouge/Engineering-Radar/blob/47a701fdd820dc4b2632f3e636615f9bd8de30d2/docs/adr/0004-toolchain-installation-strategy.md
  - title: 'ADR-0006: choosing the pilot repositories'
    url: https://github.com/MarvinLeRouge/Engineering-Radar/blob/47a701fdd820dc4b2632f3e636615f9bd8de30d2/docs/adr/0006-pilot-repository-selection.md
  - title: 'ADR-0008: human confirmation before judgment-based scores'
    url: https://github.com/MarvinLeRouge/Engineering-Radar/blob/47a701fdd820dc4b2632f3e636615f9bd8de30d2/docs/adr/0008-traefik-criterion-and-confirmation-gate.md
  - title: 'ADR-0011: a human verdict on every finding'
    url: https://github.com/MarvinLeRouge/Engineering-Radar/blob/47a701fdd820dc4b2632f3e636615f9bd8de30d2/docs/adr/0011-human-verdict-false-positive-feedback.md
order: 1
draft: false
---

Engineering-Radar comes from an observation about my own portfolio: each repository had its strengths and its gaps, and I had no reliable overall view. Rather than a checklist kept by hand, I wanted a repeatable measure, backed by well-known tools, and able to track progress over time.

### Architecture

![Engineering-Radar architecture: portfolio repositories, detection of sub-projects and their stack, pinned analysis tools, normalization into findings and scores against the framework, SQLite database, then FastAPI API and Vue 3 dashboard](../diagrams/engineering-radar-en.svg)

The system is split into four packages. `radar-core` holds the data model, with its migrations. `radar-audit` is a CLI: it detects each repository's sub-projects and their stack, runs the matching tools with crash isolation, then normalizes their raw output into findings and scores, criterion by criterion. `radar-api` serves the reports, findings, score history and roadmap, with protected write routes for human verdicts. `radar-dashboard`, in Vue 3, shows the report, the roadmap and the trends of each repository.

### Key decisions

- **Methodology before code.** The quality framework (categories, criteria, weights, critical penalties) was frozen and versioned before the first line of code, then calibrated on two pilot repositories with different stacks. A score has to stay comparable over time: a change of method never silently rewrites history.
- **Pinned tools, installed by the radar.** Tool versions are the radar's, not the audited repository's. Otherwise, a plain dependency update in the repository would move its score.
- **Three states per criterion, never a silent zero.** A criterion is scored, not applicable with a reason, or not audited yet. A tool that crashes is missing data, not a flawless repository.
- **The human stays in charge.** Judgment-based criteria go through a confirmation before they count. Every finding can get a verdict, false positive or won't fix, with a note explaining it; that verdict is kept from one audit to the next.

### A difficulty

The first pilot audit, run by hand on GeoChallenge-Tracker, reported six secrets found by Gitleaks in the git history. In the framework, a confirmed secret is a critical penalty: the Security category is capped, however good the rest is.

All six results were false positives: fake tokens, in test files, on variables named `fake_token`. The tool was right on the form, the string did look like an API key, but wrong on the substance. Applied as is, the rule would have sunk the score of a project with no real secret at all.

I drew two mechanisms from it. First a pre-filter: a result in a test folder, on a `fake_`, `mock_` or `dummy_` variable, or in an example configuration file, is kept at low confidence instead of being counted as confirmed. Then the human verdict, already planned in the design, which handles the remaining cases. It then had to be made durable: at first, a new audit recreated the findings and lost the verdicts. Each finding now carries a stable fingerprint, which carries the verdict over from one audit to the next. The lesson: a deterministic tool gives a reproducible result, not necessarily a real problem.

### Quality

The Python packages are tested with pytest and the dashboard with Vitest. The GitHub Actions CI runs each suite on every change and enforces a minimum coverage threshold for each package. Ruff, mypy, ESLint and Prettier run before each commit and in CI. Engineering-Radar audits itself, several times a week: its own findings feed its roadmap. Decisions are recorded in ADRs.

### Timeline

- **Late August 2026:** architecture, tool selection and evaluation, quality framework frozen then calibrated on two pilot repositories; then data model and audit engine.
- **September 2026:** architecture, code quality, testing, security, maintainability, DevOps, documentation and observability categories; API and dashboard.
- **October 2026:** finding prioritization, score calibration, global score and history per repository, CI, verdicts kept across audits.
- **November 2026:** regular self-audit, explanatory notes on verdicts, git-ignored files excluded from every analysis, documentation refresh.
- **Coming next:** quality badge for READMEs (in progress), Performance category, categories 10 to 15, portfolio-wide analysis.

### What I would do differently

I would set up CI from day one. It arrived almost two months after the first commit, while CI presence and health are among the criteria the tool checks in other projects. As long as it was missing, the tests only ran on my machine, and the project did not meet its own definition of quality.
