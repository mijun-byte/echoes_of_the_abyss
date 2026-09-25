# Activer la coop à deux sur ton site

La version de ce dossier ajoute **Coop en ligne · 2 joueurs** au menu. Le site GitHub Pages continue à servir le jeu ; un petit serveur Node.js transmet les messages entre les deux ordinateurs. Le serveur doit être déployé une fois avant de pouvoir jouer à distance.

## 1. Mettre les fichiers sur GitHub

Dans `https://github.com/mijun-byte/echoes_of_the_abyss`, utilise **Add file → Upload files** pour remplacer les fichiers du jeu par le contenu de ce dossier, puis valide avec **Commit changes**.

`index.html`, `game.js`, `style.css`, `coop-config.js`, `render.yaml`, `assets/` et `server/` doivent être à la racine du dépôt. N’envoie ni le ZIP lui-même ni un dossier supplémentaire autour de ces fichiers. Le dossier `server/node_modules` n’est pas à envoyer.

Attends la fin du déploiement GitHub Pages. Le lien du jeu reste :

https://mijun-byte.github.io/echoes_of_the_abyss/

## 2. Déployer le serveur sur Render

1. Connecte-toi à https://dashboard.render.com/ avec ton compte.
2. Choisis **New → Web Service**, puis connecte le dépôt `mijun-byte/echoes_of_the_abyss`.
3. Renseigne les valeurs suivantes :

| Champ | Valeur |
| --- | --- |
| Branch | `main` (ou la branche où tu as mis ces fichiers) |
| Root Directory | `server` |
| Runtime / Language | `Node` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/health` |

4. Dans les variables d’environnement, ajoute **ALLOWED_ORIGINS** = **https://mijun-byte.github.io** (sans le chemin du dépôt, sans slash final). Tu peux aussi définir **NODE_VERSION** = **22**.
5. Choisis l’offre d’hébergement qui te convient en vérifiant le prix affiché, puis lance le déploiement. Une seule instance suffit ; les salons sont conservés dans sa mémoire, donc ne configure pas plusieurs instances.
6. Quand le service est prêt, copie son URL `https://NOM-DU-SERVICE.onrender.com`. En ouvrant `/health` à la fin de cette URL, tu dois voir `{"ok":true,"protocol":2}`.

Le fichier `render.yaml` fournit aussi les paramètres de déploiement pour une installation via Blueprint. Aucune offre payante n’a été souscrite ni aucun serveur déployé par la préparation de ces fichiers.

Documentation officielle : [déployer une application Node](https://render.com/docs/deploy-node-express-app), [WebSockets sur Render](https://render.com/docs/websocket).

## 3. Brancher le jeu sur le serveur

Pour un premier essai, aucune autre modification n’est nécessaire :

1. Ouvre ton jeu → **Coop en ligne**.
2. Dans **Adresse du serveur**, mets `wss://NOM-DU-SERVICE.onrender.com/coop`.
3. Ton pote renseigne exactement la même adresse. L’adresse et le pseudo sont mémorisés sur chaque appareil.

Après une mise à jour du jeu ou du relais, actualisez tous les deux la page (Ctrl + F5). Cette version utilise le protocole coop 2 ; un ancien onglet ou un relais pas encore redéployé affichera un message de versions incompatibles.

Pour éviter de saisir cette adresse à chaque nouvel appareil, modifie ensuite `coop-config.js` dans GitHub :

```js
window.ABYSS_COOP_SERVER = "wss://NOM-DU-SERVICE.onrender.com/coop";
```

Valide la modification et attends la mise à jour GitHub Pages. Actualisez tous les deux le site avec **Ctrl + F5**. Le champ sera alors prérempli.

## 4. Jouer ensemble

- Choisissez votre apparence et vos achats au menu avant de rejoindre.
- Le premier joueur clique sur **Créer un salon privé**, puis communique le code à 10 caractères à son pote.
- Le second saisit ce code, clique sur **Rejoindre le salon**, peut personnaliser son apparence dans le salon, puis clique sur **Prêt**.
- Le créateur voit les personnages, les apparences et les états de présence ; il clique sur **Lancer l’expédition à deux** quand l’invité est prêt.
- Les commandes restent identiques : ZQSD/WASD/flèches, souris, Espace, Tab, E, F/R/T, clic droit.
- **Maintenir E pendant 2 secondes**, à moins de 75 pixels du partenaire tombé, le relève avec 35 % de ses PV et 2 secondes de protection.
- **I** ouvre l’équipement personnel ; **Échap** ouvre la pause. La pause s’applique aux deux joueurs ; celui qui l’a demandée reprend. Changer d’onglet met également en pause.
- L’hôte dirige les passages entre salles. Les deux joueurs doivent être debout pour changer de salle. Chacun choisit ses améliorations de niveau ; le combat reprend une fois les deux choix faits.
- Les ennemis et boss ont **65 % de PV en plus** par rapport au même étage solo. Leurs dégâts conservent la progression habituelle.
- Les ennemis visent le joueur debout le plus proche. Les projectiles alliés ne blessent pas le partenaire.
- Chaque objet généré existe en une copie par joueur. Les objets visibles et ramassables sont les tiens ; ton partenaire ne peut pas te les prendre. Jeter une arme la laisse uniquement à son propriétaire.
- L’or des ennemis est attribué à chacun avec son propre bonus de gain. Les achats chez le marchand sont individuels.
- Après un boss, l’hôte choisit de récupérer le butin, de descendre ou d’encaisser pour tous les deux. Chacun reçoit son propre or dans sa banque locale. Les pouvoirs des boss sont attribués aux deux joueurs.

## Sauvegardes et limites de cette première version

- La sauvegarde solo reste intacte. La coop ne remplace jamais ta partie solo, même en cas de mort.
- Couleurs, accessoires et achats permanents proviennent du navigateur de chaque joueur. Il n’y a pas de compte ni de synchronisation de progression entre appareils. Les couleurs acquises dans la version locale ne migrent pas automatiquement vers GitHub Pages.
- Une expédition coop est une session en direct : rechargement, déconnexion ou arrêt du serveur terminent le salon. Il n’y a pas encore de reconnexion ni de remplacement de l’hôte. Encaisse après un boss avant d’arrêter ; l’or non encaissé est perdu.
- L’encaissement inscrit le solde et un identifiant d’expédition en une seule écriture locale pour éviter un paiement en double. Si le stockage est indisponible, le jeu propose de réessayer.
- Les défis cosmétiques et les éclats du sanctuaire se gagnent en solo dans cette version. Les accessoires déjà débloqués et les bonus achetés sont utilisables en coop.
- L’ordinateur de l’hôte calcule la partie, le serveur ne fait que la transmettre. Cette coop est prévue pour jouer entre amis ; elle ne constitue pas un mode compétitif avec protection contre la triche de l’hôte.
- Le test automatique utilise deux processus Chromium distincts et un vrai serveur WebSocket local. Une connexion Internet à forte latence ou instable peut nécessiter des ajustements ; elle n’a pas été mesurée par ce test local.

## Tester en local avant déploiement (facultatif)

Il faut Node.js 22 ou plus récent et Python 3 pour le petit serveur de fichiers.

Dans un premier terminal, depuis le dossier du jeu :

```powershell
cd server
npm ci
npm start
```

Dans un deuxième terminal, depuis le dossier contenant `index.html` :

```powershell
python -m http.server 8080
```

Ouvre `http://localhost:8080` dans deux navigateurs différents (par exemple Chrome et Edge). Dans le menu coop, saisis `ws://localhost:3000/coop` sur les deux. Pour tester entre deux PC sur le réseau local, ajoute l’origine HTTP utilisée dans `ALLOWED_ORIGINS` et autorise le port 3000 dans le pare-feu de l’ordinateur serveur.

## Vérifications fournies

- `node tests/regression.cjs` : contrôles du solo et de la coop sans dépendances.
- Depuis `server/`, `npm test` : création/rejoindre, limite de deux joueurs, rôles, déconnexion, origine autorisée et paquets invalides.
- `node tests/coop-browser.cjs` : scénario avec deux navigateurs indépendants. Nécessite Playwright, Chromium et les dépendances de `server/`. Variable facultative `ABYSS_CHROMIUM_PATH` pour un exécutable Chromium spécifique.

Le scénario couvre les profils indépendants, les commandes réseau, le combat, le butin personnel, la pause, la réanimation, les choix de niveau, les phases des boss, l’encaissement propre à chaque joueur, la déconnexion et la préservation des sauvegardes solo.
