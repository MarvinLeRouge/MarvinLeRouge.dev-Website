---
title: Triton
tagline: Simulation au tour par tour d'une recherche au sonar par une flotte de drones autonomes, guidée par une carte de probabilités bayésienne.
stack: [Python, NumPy, FastAPI, WebSocket, Vue 3, TypeScript, Canvas, Docker]
repo: https://github.com/MarvinLeRouge/Triton
screenshot:
  src: ../images/example.png
  alt: 'Capture provisoire, en attendant une vue de la simulation Triton en cours'
keywords: [Python, Algorithmes probabilistes, Simulation multi-agents, Tests et CI/CD]
recruiter:
  problem: Chercher une cible qui se cache, sans jamais connaître sa position exacte. C'est le cas de la recherche en mer, où un capteur imparfait ne dit jamais avec certitude où se trouve ce qu'on cherche, et où chaque décision se prend à partir d'une estimation.
  built: Une simulation complète, du moteur de calcul à l'affichage. Une flotte de drones équipés de sonars traque un navire fugitif sur une grille. Chaque drone tient sa propre carte des positions probables de la cible, mise à jour par inférence bayésienne après chaque balayage sonar, et choisit où aller selon une stratégie de recherche. La cible, elle, esquive et tente de s'infiltrer.
  result: Six phases de développement sur sept sont terminées, du modèle de détection sonar à la coordination de la flotte. Le projet est encore en développement et s'exécute en local avec Docker Compose ; l'audit de sécurité et une démo en ligne sont prévus dans la dernière phase.
lastAction: 'Coordination multi-drones : fusion périodique des cartes et regroupement de la flotte'
adrs:
  - title: 'ADR-0002 : sonar en cône et probabilité de détection à décroissance exponentielle'
    url: https://github.com/MarvinLeRouge/Triton/blob/16c2dc2b1dfa365adb2a108af2e7dd1bc3f51187/docs/adr/0002-cone-shaped-sonar-pod-exponential-decay.md
  - title: 'ADR-0003 : carte de probabilités bayésienne avec diffusion temporelle'
    url: https://github.com/MarvinLeRouge/Triton/blob/16c2dc2b1dfa365adb2a108af2e7dd1bc3f51187/docs/adr/0003-bayesian-probability-map-temporal-diffusion.md
  - title: 'ADR-0004 : stratégies de recherche interchangeables et machine à états de détection'
    url: https://github.com/MarvinLeRouge/Triton/blob/16c2dc2b1dfa365adb2a108af2e7dd1bc3f51187/docs/adr/0004-search-strategies-detection-state-machine.md
  - title: 'ADR-0006 : une carte par drone, fusionnée périodiquement'
    url: https://github.com/MarvinLeRouge/Triton/blob/16c2dc2b1dfa365adb2a108af2e7dd1bc3f51187/docs/adr/0006-per-drone-maps-periodic-fusion.md
  - title: 'ADR-0007 : regroupement de la flotte avec un espacement minimal'
    url: https://github.com/MarvinLeRouge/Triton/blob/16c2dc2b1dfa365adb2a108af2e7dd1bc3f51187/docs/adr/0007-fleet-regroup-minimum-spacing.md
order: 5
draft: true
---

Triton est un projet personnel : j'ai voulu associer des concepts militaires à des idées venues de mes loisirs. Pour cette première étape, c'est la recherche d'un fuyard au sonar. Le cœur du sujet est la théorie de la recherche : décider où chercher quand on ne sait jamais vraiment où est la cible.

### Architecture

![Architecture de Triton : moteur Python avec modèle sonar, cartes de probabilités bayésiennes et stratégies de recherche, puis API FastAPI qui diffuse l'état de chaque tour par WebSocket, et rendu Vue 3 sur Canvas avec la grille, les cônes sonar et la carte de chaleur](../diagrams/triton-fr.svg)

Le projet est découpé en trois couches testables séparément. Le moteur, en Python avec NumPy, ne dépend d'aucune interface ni d'aucun transport : il fait avancer la simulation tour par tour, chaque entité se déplace et écoute une fois, les cartes de probabilités sont mises à jour, puis l'issue est évaluée. L'API FastAPI diffuse l'état de chaque tour par WebSocket. Le frontend Vue 3 dessine sur Canvas la grille, les drones, les cônes sonar et la carte de chaleur des probabilités. Docker Compose et Traefik sont là depuis la première phase, avec le même routage en développement et en production.

### Décisions clés

- **Une détection probabiliste plutôt que binaire.** Un drone écoute dans un cône orienté selon son cap, et la probabilité de détection décroît de façon exponentielle avec la distance. Elle dépend aussi du bruit de la cible, plus facile à entendre quand elle bouge, et de l'attention du drone, qui augmente quand il enchaîne les contacts. Un seul paramètre suffit à régler la décroissance, sans toucher à la géométrie.
- **Raisonner sur une carte de croyance, pas sur une dernière position connue.** Chaque cellule de la grille porte une probabilité de présence, révisée par mise à jour bayésienne après chaque balayage, qu'il y ait détection ou non. Entre deux balayages, une diffusion étale la probabilité vers les cellules voisines pour tenir compte des déplacements de la cible. Une telle carte peut garder plusieurs hypothèses à la fois, par exemple quand la cible a pu partir dans deux directions.
- **Plusieurs stratégies de recherche, plutôt qu'une seule.** Les stratégies partagent une même interface : l'une fonce vers la cellule la plus probable à portée, l'autre couvre méthodiquement les zones au-dessus de la moyenne. Elles sont réattribuées au hasard, drone par drone, en cours de partie, pour que la flotte ne se comporte pas comme un seul drone répété. En ajouter une nouvelle ne demande que d'implémenter l'interface, ce qui en fait un terrain d'essai pour comparer les approches.
- **Une carte par drone, fusionnée régulièrement.** Au départ, toute la flotte partageait une seule carte. Quand l'autonomie des drones est devenue un objectif, ce choix est devenu un frein : chaque drone tient désormais sa propre carte, alimentée par ses seuls balayages, et les cartes sont fusionnées tous les dix tours en un consensus redistribué à la flotte.

### Une difficulté

Quand un drone confirme un contact, les autres abandonnent leur recherche pour le rejoindre. Pour éviter que toute la flotte s'aligne sur un même axe, j'avais imposé un espacement minimal entre drones, calculé à partir de la portée du sonar : huit cases. La logique était cohérente en elle-même, et les tests passaient.

La relecture finale, chiffres à l'appui, a montré autre chose : 83 % des tours de regroupement laissaient des drones immobiles. Les drones apparaissent à six cases ou moins les uns des autres, donc déjà sous l'espacement minimal ; toute position trop proche étant refusée, un drone déjà trop près ne pouvait plus bouger du tout. La correction ne refuse plus que les déplacements qui réduisent encore l'écart. J'ai aussi mesuré une variante, qui calculait l'occupation des cases à partir de la position du drone de tête avant son déplacement : elle empilait deux drones sur la même case dans environ 26 % des tours de regroupement, et je l'ai écartée.

La leçon est consignée dans l'ADR : un paramètre déduit d'une autre constante du moteur doit être confronté aux vraies valeurs de configuration, pas seulement à sa propre cohérence.

### Qualité

Le moteur et l'API sont testés avec pytest, le frontend avec Vitest, et les deux suites tournent à chaque modification dans une CI GitHub Actions, avec un suivi de couverture séparé par partie sur Codecov ; les badges du README donnent les chiffres à jour. Le code Python est vérifié par ruff et mypy, le frontend par ESLint, oxlint et le compilateur TypeScript. Le hasard du moteur (détections, changements de stratégie) passe par un générateur injectable, ce qui rend chaque comportement reproductible en test. Les décisions de conception sont consignées dans des ADR, et la documentation est bilingue.

### Chronologie

- **Juin 2026 :** cadrage, socle du projet (grille, entités, chaîne complète du moteur jusqu'à l'affichage, Docker et Traefik), puis modèle de détection sonar.
- **Août 2026 :** carte de probabilités bayésienne et carte de chaleur, stratégies de recherche et machine à états de détection, comportement de la cible, coordination de la flotte.
- **Septembre et octobre 2026 :** harmonisation de la CI, documentation bilingue et ADR.
- **À venir :** paramétrage des scénarios, rejouabilité, audit de sécurité, travail sur le design et démo en ligne.

### Ce que je referais autrement

Je planifierais plus en détail dès le départ l'audit de sécurité et la démo. Les phases ont été pensées autour du moteur, et la démo est arrivée en fin de liste. Prévue dès le début, elle aurait pu être mise en ligne tôt et évoluer phase après phase, avec un audit de sécurité mené au même rythme plutôt qu'en bloc à la fin.
