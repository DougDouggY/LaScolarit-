# LaScolarit-

Jeu statique : les fichiers jouables se trouvent dans `dist`.

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
