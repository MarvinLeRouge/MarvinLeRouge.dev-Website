---
title: GeoChallenge-Tracker
tagline: Application web qui suit automatiquement la progression des challenges de géocaching, à partir des trouvailles importées en GPX.
stack: [Python, FastAPI, MongoDB, Vue 3, TypeScript, Leaflet, Docker]
repo: https://github.com/MarvinLeRouge/GeoChallenge-Tracker
screenshot:
  src: ../images/geochallenge-tracker.png
  full: ../images/geochallenge-tracker-full.avif
  alt: 'Matrice difficulté / terrain de GeoChallenge-Tracker : les 81 combinaisons complétées, avec le nombre de caches trouvées pour chacune, deux tours de matrice terminés et la combinaison qui manque pour le suivant'
keywords: [API REST, Python / FastAPI, MongoDB, Données géospatiales]
recruiter:
  problem: En géocaching, une cache "challenge" ne peut être validée qu'une fois remplie une condition sur ses trouvailles passées, par exemple une cache pour chacune des 81 combinaisons de difficulté et de terrain, une pour chaque jour de l'année, ou un nombre donné de caches d'un certain type dans un pays. Les géocacheurs suivent ces conditions à la main, dans des tableurs, sur des milliers de trouvailles.
  built: Une application web complète, avec une API FastAPI de plus de 50 endpoints sur MongoDB et une interface Vue 3 avec cartes interactives. Elle importe les trouvailles depuis des fichiers GPX, détecte les caches challenge, décrit les règles de chaque challenge sous forme de données, calcule la progression et propose les caches qui la feraient avancer, y compris autour d'un point donné.
  result: Je l'utilise dans ma propre pratique du géocaching, et de vrais testeurs l'utilisent aussi. Le projet a traversé un audit de sécurité complet (OWASP Top 10, ASVS), dont toutes les remarques ont été corrigées.
lastAction: Réduction de la duplication de code, côté backend et frontend
adrs:
  - title: 'ADR-0001 : proxy de tuiles auto-hébergé avec cache disque'
    url: https://github.com/MarvinLeRouge/GeoChallenge-Tracker/blob/265288c756ad95701e32c61c4d1d400c8f53ac0e/docs/adr/0001-self-hosted-tile-proxy-with-disk-cache.md
  - title: "ADR-0002 : synchronisation des challenges côté serveur après l'import"
    url: https://github.com/MarvinLeRouge/GeoChallenge-Tracker/blob/265288c756ad95701e32c61c4d1d400c8f53ac0e/docs/adr/0002-server-side-challenge-sync-after-import.md
  - title: 'ADR-0005 : carte des trouvailles par zone administrative'
    url: https://github.com/MarvinLeRouge/GeoChallenge-Tracker/blob/265288c756ad95701e32c61c4d1d400c8f53ac0e/docs/adr/0005-choropleth-map-administrative-zones.md
  - title: 'ADR-0008 : passage du hachage des mots de passe de bcrypt à Argon2id'
    url: https://github.com/MarvinLeRouge/GeoChallenge-Tracker/blob/265288c756ad95701e32c61c4d1d400c8f53ac0e/docs/adr/0008-password-hashing-bcrypt-to-argon2id.md
order: 3
draft: false
---

GeoChallenge-Tracker part d'une pratique personnelle : je suis géocacheur, et je voulais que l'outil fasse les comptes à ma place. C'est aussi le projet le plus complet du portfolio, du parsing de fichiers GPX à la carte interactive, en passant par la sécurité de l'authentification.

### Architecture

![Architecture de GeoChallenge-Tracker : fichiers GPX ou ZIP, import et détection des challenges, MongoDB avec index géospatial, puis règles en arbre d'expression compilées en requêtes MongoDB, progression et caches cibles, interface Vue 3 avec cartes Leaflet](../diagrams/geochallenge-tracker-fr.svg)

Le backend FastAPI suit un découpage hexagonal : routes, domaine, services, cœur technique et accès aux données sont séparés. L'import lit les exports GPX ou ZIP des applications de géocaching, enregistre les caches et les trouvailles dans MongoDB, puis repère les caches challenge parmi elles. Chaque challenge porte ses règles sous forme d'arbre d'expression, compilé en requête MongoDB pour mesurer la progression et chercher les caches cibles. Le frontend Vue 3 affiche les matrices, les calendriers et les cartes ; les tuiles de carte passent par un proxy nginx avec cache disque.

### Décisions clés

- **Les règles comme données, pas comme code.** Plutôt qu'un vérificateur écrit à la main pour chaque type de challenge, une règle est un arbre d'expression : des conditions (type, taille, difficulté, terrain, pays, date de pose, attributs) combinées par des opérateurs logiques, plus des agrégats (sommes, nombre de pays distincts, matrice complète). L'arbre est validé, normalisé, puis compilé en requête MongoDB. Un nouveau challenge se décrit, il ne se programme pas.
- **Laisser la base faire la géométrie.** Les recherches par rayon ou par rectangle s'appuient sur un index géospatial sphérique de MongoDB, plutôt que sur un filtrage en Python après coup. La base ne renvoie que les caches de la zone, même sur des milliers de points.
- **Un proxy de tuiles plutôt qu'un appel direct à OpenStreetMap.** Les tuiles sont servies par un nginx qui répartit les requêtes entre plusieurs serveurs OSM et garde une copie sur disque. Le projet reste dans les règles d'usage d'OSM, et une tuile déjà vue ne repart plus sur le réseau.
- **La synchronisation dans la même requête que l'import.** Au départ, le frontend lançait la mise à jour des challenges par un second appel, après l'import. Un onglet fermé entre les deux, et les challenges restaient faux sans le moindre signal. Le backend l'enchaîne désormais lui-même et renvoie son résultat avec celui de l'import.

### Une difficulté

La carte des trouvailles par département demandait de ranger chaque cache dans une zone. J'ai prévu trois passes : le point est-il dans un polygone ; sinon, que répond le géocodage inverse de Nominatim ; sinon, quel est le polygone le plus proche, à moins d'une dizaine de kilomètres. Cette dernière passe existait pour une bonne raison : les contours sont simplifiés, et une cache au bord de la mer peut tomber juste à côté de son département.

Puis j'ai trouvé des caches à Llívia, une enclave espagnole en plein territoire français, à quelques kilomètres de la frontière. Ce cas a fait apparaître deux problèmes. Le premier est la précision du tracé d'une frontière, départementale ou nationale : près d'une limite, un contour simplifié peut placer un point du mauvais côté. Le second est l'imbrication : un polygone peut en contenir un autre qui appartient à une autre entité. Dans les données, le polygone des Pyrénées-Orientales a bien un trou à la place de l'enclave ; mais un point tombé dans ce trou ne trouvait aucun département, et la troisième passe le rattachait au plus proche.

La correction s'appuie sur le pays plutôt que sur la distance. Le géocodage inverse renvoie désormais le code pays : un point identifié comme étranger est exclu du repli par proximité, et les caches sont filtrées par pays avant même l'affectation. La leçon m'est restée : un repli raisonnable dans le cas général devient faux dès que la géographie réelle sort du modèle.

### Qualité

Le backend est testé avec pytest, le frontend avec Vitest, et les deux suites tournent à chaque modification dans une CI GitHub Actions, avec un suivi de couverture séparé par partie sur Codecov ; les badges du README donnent les chiffres à jour. La CI audite aussi les dépendances (pip-audit, npm audit). Un audit de sécurité complet, mené sur la grille OWASP Top 10 et ASVS, a donné lieu à des corrections ciblées : limitation du débit sur l'authentification, révocation des jetons de rafraîchissement, passage du hachage à Argon2id avec migration transparente des anciens comptes, plafond sur la taille décompressée des archives importées. Les décisions sont consignées dans des ADR.

### Chronologie

- **Septembre 2025 :** socle de l'application (API FastAPI, MongoDB, frontend Vue 3), premiers tests frontend, cache des tuiles de carte.
- **Automne 2025 :** challenges utilisateur, sauvegarde et restauration de la base, import GPX multi-format, matrice et calendrier.
- **Printemps 2026 :** passage derrière Traefik, mis en place pour servir toutes mes applications en sous-domaines, envoi d'emails, carte des trouvailles par zone administrative.
- **Été 2026 :** audit de sécurité complet et corrections, audit de l'interface (mode sombre, accessibilité).
- **Depuis :** campagne de couverture de tests, harmonisation de la CI, durcissement des conteneurs.

### Ce que je referais autrement

Je mettrais les tests et la CI en place dès le départ. Pendant des mois, les fonctionnalités se sont empilées avec une couverture partielle, et il a fallu une campagne dédiée pour rattraper le retard, route par route. Ce rattrapage a surtout coûté en confiance : chaque refactorisation de cette période se faisait sans filet complet. Écrits au fil de l'eau, ces tests auraient coûté moins cher, et auraient guidé la conception plutôt que la constater après coup.
