# Finition du jeu coop

Source : ce dossier. Le site est publié à https://mijun-byte.github.io/echoes_of_the_abyss/echoes-of-the-abyss-coop/.

## Étapes et validation

1. Menu et lobby : décor de cathédrale, boutons accessibles, invitation, mise à jour des fichiers sans effacer les sauvegardes.
2. Personnages : quatre silhouettes 2D, tenues, couleurs, accessoires, rotation de l’aperçu, hasard, sauvegarde et synchronisation du salon.
3. Salons : paramètres autoritaires, carte, difficulté, taille, chat, expulsion, états prêt et messages compréhensibles.
4. Donjons : trois tailles qui changent les salles, combats et ressources ; décors variés et rendu mis en cache.
5. Boss et effets : silhouettes distinctes, annonces, télégraphes, transitions et effets bornés.
6. Profil et polish : statistiques locales, audio, graphismes, commandes et confirmations.

Chaque étape est vérifiée en solo et avec deux navigateurs indépendants (hôte et invité), puis commitée et poussée. Les clés de sauvegarde existantes restent compatibles.

La coopération reste à deux joueurs. Les grands donjons allongent l’exploration. Les salons restent privés par code : aucun annuaire public ni compte distant n’existe actuellement. Les apparences sont dessinées en Canvas 2D ; la rotation est celle d’un aperçu stylisé, pas un modèle 3D.

## État de livraison — 25 septembre 2026

Étape 1 livrée : fond de cathédrale intégré dans `assets/abyss-cathedral.png`, menu responsive, boutons avec états survol/focus/désactivé, lobby remanié, lien d’invitation copiable et code prérempli. `boot.js` lit `build.json` sans cache pour charger les scripts et le style de la même version. Le bouton d’actualisation du menu coop conserve le stockage local. Le pseudo mémorisé est normal et reste modifiable dans le formulaire coop.

Validation : 82 contrôles de régression solo/coop, puis deux processus Chrome indépendants pour le salon, l’apparence synchronisée, le bouton prêt, les mouvements et attaques invité, le butin individuel, la pause, la réanimation, les améliorations, les boss, l’encaissement et la conservation des sauvegardes solo.

Les étapes 2 à 6 restent à réaliser. Les couleurs et accessoires sont déjà modifiables depuis le salon ; les nouveaux skins, tenues et la rotation ne sont pas encore implémentés. Le chat, l’expulsion, les paramètres de carte/difficulté/taille, les nouveaux décors/boss et le profil statistique restent également à faire. La priorité demandée ensuite a été de pousser rapidement cette étape stable.

## Reprendre sans clé USB

Le dépôt contient le code, les images et les tests. Cloner sur le disque interne, puis ouvrir son sous-dossier `echoes-of-the-abyss-coop` dans l’éditeur :

```powershell
git clone https://github.com/mijun-byte/echoes_of_the_abyss.git C:\Users\joahl\Projects\echoes_of_the_abyss
```

Le jeu fonctionne aussi en ouvrant `index.html` localement. Pour les tests du relais, installer Node.js puis exécuter `npm ci` dans `server/` et `node --test server/test.cjs` depuis le dossier du jeu. Les tests de logique se lancent avec `node tests/regression.cjs` ; le test à deux navigateurs nécessite Playwright et Chromium (`tests/coop-browser.cjs`).

Les parties, achats et apparences personnels restent dans le stockage du navigateur : ils ne sont pas envoyés sur GitHub. Le dossier de travail d’origine était sur `D:` ; le push ne déplace pas ce dossier automatiquement. Incrémenter `build.json` à chaque prochaine livraison qui modifie les fichiers du jeu.
