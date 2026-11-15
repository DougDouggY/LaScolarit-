# LaScolarit-

Jeu statique : les fichiers jouables se trouvent dans `dist`.

L’accueil propose uniquement la visite libre du collège (`campus-view.html`).
Les anciens modes 2D, campagne et monde test utilisant l’ancienne carte ont été supprimés.
La journée avec IA (`campus-journee.html`) utilise la même carte actuelle que la visite libre.

## Développement collaboratif

`main` est la source principale. Chaque personne travaille dans sa propre branche,
pousse ses changements et ouvre une pull request vers `main`. Récupérer les
derniers changements de `main` avant de commencer et résoudre les conflits avant
la fusion. Ne pas modifier directement la branche historique `gh-pages`.

Le workflow `.github/workflows/pages.yml` vérifie les pull requests et chaque
push sur `main`, y compris les fusions. Il exécute
`node checks/campus-day-check.cjs` (qui inclut les contrôles du campus), puis
publie exactement le dossier `dist` si les contrôles réussissent. Une pull request
ne publie pas le site. Les déploiements sont sérialisés. Aucun secret personnel
n'est nécessaire : les actions officielles utilisent le jeton GitHub du workflow.

## Activation unique de la publication automatique

Dans **Settings → Pages → Build and deployment → Source**, sélectionner
**GitHub Actions** à la place de la publication depuis `gh-pages`.
Conserver la branche `gh-pages` pendant la transition ; le workflow ne la modifie
pas. Le site conserve son adresse : https://dougdouggy.github.io/LaScolarit-/.

Dans **Actions → Validate and deploy GitHub Pages**, vérifier qu'une exécution
sur `main` réussit, avec les jobs `validate` puis `deploy`. Au besoin, utiliser
**Run workflow** sur `main` après avoir activé GitHub Actions dans Pages.
Vérifier ensuite l'accueil et la visite du collège sur le site public.
Les éventuelles règles de protection de l'environnement `github-pages` doivent
autoriser `main` ; une règle de validation humaine demandera une approbation.

Après cette activation, chaque fusion dans `main` publie automatiquement la
nouvelle version si les contrôles passent. En cas d'échec des contrôles, aucune
nouvelle version n'est déployée. Consulter les logs dans Actions pour diagnostiquer
le problème. Un retour arrière se fait par un revert sur `main`, suivi du même
workflow.

## Vérification locale

Depuis la racine du dépôt :

```sh
node checks/campus-day-check.cjs
python3 -m http.server 8000 --directory dist
```

Node.js 24 et Python 3 suffisent ; aucune compilation ni installation npm n'est
nécessaire. Respecter les contraintes de plan décrites dans `COLLEGE-VALIDATED.md`.

## Élève GLB de test

L’élève est un PNJ indépendant, visible et en promenade dès le chargement de la cour.
Le joueur reste en première personne ; les ordres ne déplacent jamais sa caméra.
Dans la visite libre, appuyer sur **H** ou sur **Élève · H** pour ouvrir le menu.
Actions : marcher jusqu’en français, courir au portail, se promener dans la cour,
suivre le joueur au rez-de-chaussée, s’arrêter et revenir au départ. Le menu
permet aussi de regarder vers le modèle, de suspendre le test et de régler sa vitesse.
Les déplacements utilisent les obstacles du collège et ouvrent les portes.

Le deuxième modèle fourni remplace le premier dans `dist/assets/characters/eleve.glb`.
Il contient un squelette et huit animations : `walk`, `run`, `dance_01`, `laugh_01`,
`flip`, `run_upstairs`, `press-up` et `sit`. Marche et course sont synchronisées
avec les trajets ; les autres clips se testent sur place depuis le menu.
Les translations horizontales du bassin sont neutralisées pour laisser la navigation
gérer les collisions. La montée de marches reste une démonstration au sol ;
le test de déplacement actuel reste au rez-de-chaussée.
Le chargeur GLTF local provient de Three.js r159, compatible avec le moteur du jeu ;
sa licence MIT est dans `dist/vendor/three-LICENSE.txt`. Aucun CDN n’est nécessaire.

Contrôle navigateur facultatif, avec Playwright et Chromium disponibles et le serveur
local lancé : `node checks/pupil-browser-check.cjs`. Il vérifie le chargement du GLB,
sa taille, les trajets, les animations natives, le suivi, l’arrêt, la pause et le menu H.

Un deuxième élève articulé est conservé dans `dist/assets/characters/eleve-2.glb`.
Les deux élèves se promènent dans la cour. Dans H, le sélecteur « Élève à commander »
choisit la cible des ordres ; les trajets, animations, vitesses et pauses sont indépendants.

Le troisième élève utilise `dist/assets/characters/eleve-3.glb`.
Chaque élève a sa propre allure, un décalage de pas, un générateur aléatoire indépendant
et des durées de pause différentes. En mode libre, ils alternent promenade, observation,
rire ou quelques pas de danse selon leur profil. Les destinations et gestes autonomes
sont réservés pour éviter les choix simultanés identiques. Ils ne se suivent pas automatiquement.
Les ordres explicites du menu H restent prioritaires pour l’élève sélectionné.

La caméra en première personne est à 1,40 m au-dessus du sol, à hauteur d’yeux d’enfant, y compris dans les escaliers.
