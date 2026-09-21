# Echoes of the Abyss — Reborn · Progression & Boutique

Décompresse entièrement le ZIP, puis ouvre `index.html` dans Edge, Chrome ou Firefox. Garde `game.js`, `style.css` et le dossier `assets` à côté de ce fichier. Aucun logiciel à installer pour jouer.

## Coop en ligne à deux joueurs

Le bouton **Coop en ligne · 2 joueurs** permet de créer ou rejoindre un salon privé. Chacun garde ses couleurs, accessoires et achats permanents ; l’or et le butin sont individuels. **Maintiens E près d’un partenaire à terre pendant 2 secondes pour le réanimer.**

L’hôte dirige les changements de salle et les décisions après un boss. Les pauses sont partagées et chacun choisit ses améliorations de niveau. La sauvegarde solo reste intacte ; une expédition coop interrompue ne peut pas être reprise.

**Avant le premier jeu à distance, il faut déployer le serveur fourni.** Suis **COOP-DEPLOIEMENT.md** : fichiers à mettre sur GitHub, paramètres du serveur et adresse à renseigner dans le jeu. GitHub Pages seul ne suffit pas. Les défis cosmétiques et les éclats se gagnent en solo dans cette première version.

## Roulette de l’Abîme

Au menu principal, ouvre **Roulette de l’Abîme**. Choisis 100, 1 000 ou 10 000 PO, ou saisis une mise entière personnalisée (minimum 1 PO), puis sélectionne ton pari et lance la roue. Les mises utilisent uniquement les pièces d’or fictives déjà en banque, jamais l’or porté dans une expédition.

- Rouge/noir et pair/impair : versement de **2 fois la mise** en cas de victoire.
- Numéro exact de 0 à 36 : versement de **36 fois la mise**.
- Les versements comprennent la mise initiale. Exemple : miser 100 PO sur rouge et gagner verse 200 PO, soit un bénéfice de 100 PO.
- La roue compte 37 cases équiprobables. Le **zéro est vert** et fait perdre tous les paris simples ; un pari exact sur zéro peut gagner.
- La mise doit être couverte par la banque. Les boutons sont bloqués pendant les 3,8 secondes d’animation.
- Le tirage et le nouveau solde sont sauvegardés ensemble avant l’animation. Recharger ou fermer le jeu pendant qu’elle tourne conserve la perte ou le gain ; le dernier résultat reste consultable à la réouverture. Si la sauvegarde échoue, la mise n’est pas effectuée.

Pour essayer : utilise **ABYSSE10M** dans la boutique, puis retourne au menu et ouvre la roulette. Tes équipements, accessoires et expédition sauvegardée sont conservés.

## Nouvelle mise à jour : combat et accessoires

### Deux armes équipées

Tu portes une arme active et une arme en réserve. **Tab** les échange ; un bouton dans l’inventaire fait la même chose. Les deux emplacements sont visibles en bas à gauche. Une nouvelle expédition commence avec l’arme choisie et une épée en réserve (un arc si tu commences à l’épée).

Ramasser une troisième arme remplace l’arme active : l’ancienne tombe au sol et reste récupérable. Si la réserve est vide, l’ancienne arme y est rangée. Les recharges sont conservées lors des échanges ; changer d’arme annule la charge du laser. Seule l’arme active applique ses effets, dont le ralentissement de la hache. Une ancienne sauvegarde commence avec une réserve vide.

### Boss en deux phases

À 50 % de leurs PV, les gardiens passent en phase II avec une transformation protégée de 1,2 seconde. Même un coup très puissant ne saute pas cette transition. Les zones et trajectoires dangereuses sont annoncées avant les attaques.

- Chevalier : doubles charges et ondes de choc.
- Mage : salves tournantes et plusieurs sceaux explosifs.
- Gardien terrestre : cercles de pics et lignes de faille.

La phase et les attaques en préparation sont conservées dans la sauvegarde.

### Combos élémentaires

- **Feu → Foudre** : la boule de feu ajoute une brûlure de 18 dégâts par seconde pendant 3 secondes. La foudre sur une cible en feu consomme la brûlure et provoque une explosion de surcharge de 60 dégâts de base dans un rayon de 100. Cendre vive peut aussi préparer ce combo.
- **Terre → Laser** : l’éruption ralentit les ennemis de 55 % pendant 4 secondes ; les boss de 25 % pendant 2 secondes. Le laser inflige 25 % de dégâts supplémentaires aux cibles ainsi ralenties.

Les dégâts élémentaires profitent du multiplicateur de dégâts du personnage. Les effets actifs sont visibles autour des ennemis.

### Cinq reliques avec contrepartie

Ces objets se trouvent pendant l’expédition, notamment chez le marchand. Ils sont signalés par un cadre corail et une description explicite. Leurs effets durent pour l’expédition et chaque relique ne peut être prise qu’une fois.

| Relique | Avantage | Contrepartie |
| --- | --- | --- |
| Pacte de verre | +65 % dégâts | −30 % PV maximum |
| Bourse du chaos | +75 % or | +18 points de chance d’élites dans les prochaines salles, plafond 85 % |
| Sang du berserker | +45 % vitesse d’attaque | −35 % efficacité des soins |
| Bottes du sacrifice | +30 % vitesse | +30 % dégâts reçus avant armure |
| Éclat instable | +40 % dégâts | +30 % durée de recharge des sorts et pouvoirs |

### Chapeaux, lunettes et défis

Ouvre **Personnaliser le personnage**, choisis un chapeau et des lunettes sous les palettes, puis clique sur **Enregistrer l’apparence**. Ces accessoires sont purement cosmétiques : tu gardes le personnage et ses statistiques. Une **casquette** et des **lunettes rondes** sont offertes. Les autres se débloquent dans **Défis & accessoires**, accessible au menu et depuis Pause.

| Objectif | Récompense |
| --- | --- |
| Vaincre un boss | Chapeau de fête |
| Vaincre un boss sans subir de dégâts pendant son combat | Couronne |
| Éliminer 25 ennemis à la hache | Casque viking |
| Toucher 3 ennemis avec un seul tir de laser | Lunettes laser |
| Déclencher 10 surcharges Feu + Foudre | Chapeau de mage |
| Atteindre l’étage 5 | Fleur |
| Porter 3 reliques maudites différentes | Monocle |
| Vaincre 3 boss | Auréole |

Les objectifs se réalisent dans une seule expédition ; les accessoires débloqués restent acquis après la mort et dans les nouvelles parties. Les couleurs et les accessoires sont sauvegardés dans le navigateur.

## Personnaliser le personnage

Depuis le menu principal ou le menu Pause, clique sur **Personnaliser le personnage**.

- Choisis indépendamment une couleur de **tête** et une couleur de **corps** parmi 10 : Menthe, Rouge, Bleu, Vert, Or, Violet, Rose, Blanc, Orange, Ardoise.
- L’aperçu utilise le même dessin que le personnage en jeu : sa silhouette reste identique, avec **100 combinaisons** possibles.
- Clique sur **Enregistrer l’apparence** pour appliquer le choix. Depuis Pause, reprends ensuite ta partie pour voir le résultat.
- **Annuler** conserve l’apparence précédente. **Apparence d’origine** prépare le retour au duo Menthe / Menthe sans accessoires ; enregistre pour le confirmer.

La personnalisation est gratuite et cosmétique. Elle s’applique aux nouvelles parties, aux parties reprises et aux traînées du dash. Les couleurs sont conservées localement dans le même navigateur, indépendamment de l’expédition : elles ne disparaissent pas à la mort. Les sauvegardes antérieures fonctionnent sans modification.

## Ajustement visuel des armes

Le laser et la hache équipés sont environ 40 % plus petits et rapprochés des mains du personnage. L’effet de charge du laser a été réduit en proportion. Les dégâts, portées et vitesses sont conservés.

## Nouveautés : or, objets illustrés et deux armes

La monnaie s’appelle désormais **pièces d’or**, abrégée **PO**. Le changement est visuel : tes soldes, tes prix et tes achats sont conservés. Le code ABYSSE10M donne toujours dix millions, désormais en pièces d’or.

Les 15 objets passifs ramassables ont des icônes distinctes : bague, bottes, amulette, cape, potion, etc. Les icônes apparaissent au sol, dans l’inventaire et dans la boutique. Le cadre indique la rareté ; le nom et la fiche de l’objet le plus proche facilitent le ramassage. Une pression sur E ramasse ou achète un seul objet à la fois.

| Nouvelle arme | Fonctionnement | Déblocage comme arme de départ |
| --- | --- | --- |
| **Canon laser** | Maintiens le clic gauche : charge de **1,4 s**, puis rayon de **240 dégâts de base** qui traverse tous les ennemis alignés. Récupération de **0,8 s** après le tir. Relâcher avant la fin annule la charge. | **80 000 PO** |
| **Hache du tourbillon** | Clic gauche : frappe à **360°**, **52 dégâts de base**, portée 105 et une attaque toutes les **1,1 s**. Déplacements et dash **25 % plus lents** tant que la hache est équipée. | **40 000 PO** |

Les deux armes peuvent aussi apparaître en butin et chez le marchand, sans achat de déblocage préalable. Elles bénéficient des raretés et des bonus de dégâts. La vitesse d’attaque réduit la charge du laser et sa récupération ; sa charge garde un minimum de 0,25 s. Le laser traverse les ennemis mais s’arrête aux murs. Il tire un seul rayon, sans effet du bonus de projectiles supplémentaires.

Pour les essayer tout de suite : ouvre la boutique, utilise **ABYSSE10M**, achète le déblocage, puis choisis l’arme dans **« Arme de la prochaine expédition »**. Lance une **nouvelle partie**. Une partie sauvegardée conserve son arme actuelle. Remplacer la hache rend immédiatement la vitesse normale sans perdre les bonus des bottes ou améliorations.

Une jauge indique la charge du laser. Les effets spéciaux de chaque arme et leurs statistiques figurent dans l’inventaire. La charge est annulée lors d’une pause, d’un changement de salle, d’un changement d’arme ou d’une reprise de sauvegarde.

### Images trouvées sur Internet

23 icônes issues de **Game-icons.net**, distribuées sous **CC BY 3.0**, sont incluses dans `assets/icons`. Elles fonctionnent hors ligne. Les couleurs ont été adaptées à l’interface du jeu, les silhouettes conservées. Sources et attributions individuelles : **CREDITS-IMAGES.html**, également accessible depuis « Comment jouer ».

## Tester immédiatement : code de triche

1. Depuis le menu, ouvre **Boutique · équipements permanents**.
2. Dans le champ « Code de triche », saisis **ABYSSE10M**, puis clique sur **Activer le code** (ou appuie sur Entrée).
3. Tu reçois **10 000 000 PO dans la banque**, sans effacer ton solde ni tes achats. Le code peut être réutilisé.
4. Achète les équipements et les sorts souhaités, retourne au menu et lance une **nouvelle expédition** pour les utiliser.

## Trois sorts à acheter

Les sorts sont débloqués définitivement, utilisables avec toutes les armes et cumulables avec les pouvoirs des boss. Vise avec la souris puis appuie sur la touche correspondante, ou clique sur son bouton dans la barre des sorts (la dernière visée est conservée). Chaque sort possède sa propre recharge, affichée à l’écran. Aucun mana ni consommable requis.

| Sort | Prix | Touche | Effet de base | Recharge |
| --- | --- | --- | --- | --- |
| Boule de feu | 25 000 PO | **F** | Projectile explosif : 90 dégâts dans un rayon de 110, sans dégâts au joueur | 4 s |
| Chaîne de foudre | 75 000 PO | **R** | 100 dégâts sur la première cible, puis −20 % à chaque rebond, jusqu’à 5 cibles. Étourdissement de 0,7 s, réduit à 0,25 s sur les boss | 7 s |
| Éruption terrestre | 150 000 PO | **T** | Pics de terre au curseur, à 300 maximum : 140 dégâts dans un rayon de 120, recul et protection totale du joueur pendant 1,5 s | 10 s |

Les dégâts des sorts augmentent avec ton multiplicateur de dégâts ; leurs valeurs actuelles apparaissent dans l’inventaire. La foudre cherche une cible dans la direction visée, à 600 maximum, puis rebondit entre des ennemis séparés de 240 maximum. Sans première cible, elle ne consomme pas sa recharge. La boule de feu explose sur un ennemi, un mur ou en fin de trajet.

Les achats deviennent actifs à la prochaine **nouvelle expédition**. « Continuer » garde les sorts de la partie sauvegardée et leurs recharges restantes. Les anciennes sauvegardes sont compatibles. Les touches de jeu sont ignorées pendant la saisie du code.

## Les trois améliorations

### 1. Des ennemis plus forts après chaque gardien

Chaque étage supplémentaire multiplie les PV des ennemis et des boss par 1,55, leurs dégâts par 1,23 et leurs récompenses en argent par 1,50. Leur vitesse augmente progressivement, avec un plafond de +55 % pour garder les déplacements esquivables. Les élites deviennent plus fréquents, jusqu’à 55 %.

Le cycle des trois gardiens continue sans remise à zéro de la difficulté. Par rapport à l’étage 1 :

| Étage | PV ennemis et boss | Dégâts ennemis et boss |
| --- | --- | --- |
| 1 | ×1 | ×1 |
| 4, après les trois premiers boss | ×3,72 | ×1,86 |
| 7 | ×13,87 | ×3,46 |
| 10 | ×51,64 | ×6,44 |

Les zones explosives et les pièges progressent également. Un boss rapporte au minimum 1 500 PO à l’étage 1, puis sa récompense augmente à chaque étage. Le bonus personnel d’argent s’applique aussi. Les prix du marchand dans le donjon ont été adaptés à cette nouvelle économie.

### 2. Encaisser après un boss et acheter au menu

Après chaque victoire, trois choix :

- **Descendre** : conserver ton personnage, ses pouvoirs et son argent pour continuer. Le butin laissé au sol est abandonné.
- **Récupérer le butin / consulter l’inventaire** : reprendre dans la salle sécurisée. Appuie ensuite sur **E près du portail** pour retrouver le choix.
- **Encaisser et retourner au menu** : terminer l’expédition et transférer tout l’argent restant vers la banque permanente. Les éclats de fin d’expédition sont aussi attribués. La boutique s’ouvre ensuite.

L’argent dépensé chez le marchand n’est plus disponible pour être encaissé. Mourir fait perdre l’argent encore en jeu ; l’argent déjà en banque et les achats restent acquis. Le retour ordinaire au menu via Pause sauvegarde la partie, sans encaisser. Le bouton Continuer permet de la reprendre.

Les achats de la boutique sont **uniques, permanents et cumulables**. Ils s’appliquent automatiquement aux **nouvelles expéditions**, sans modifier une partie sauvegardée en cours. Une relique ne peut pas être achetée deux fois.

| Objet | Prix | Effets |
| --- | --- | --- |
| Talisman du voyageur | 1 000 PO | +15 PV max |
| Gants de l’éclaireur | 3 000 PO | +10 % vitesse d’attaque |
| Cotte du sanctuaire | 7 500 PO | +4 armure, +25 PV max |
| Rubis de guerre | 15 000 PO | +25 % dégâts |
| Bottes du crépuscule | 30 000 PO | +15 % vitesse, recharge du dash −15 % |
| Œil des profondeurs | 60 000 PO | +10 points de critique, multiplicateur critique +0,30 |
| **Couronne du Roi déchu** | **100 000 PO** | **+60 % dégâts, +100 PV max, +5 armure** |
| **Cœur du Néant** | **500 000 PO** | **+100 % dégâts, +40 % vitesse d’attaque, +8 % vol de vie** |
| **Héritage de l’Abîme** | **1 000 000 PO** | **+200 % dégâts, +300 PV max, +15 armure, +2 projectiles** |

Les multiplicateurs de dégâts et de vitesse d’attaque se multiplient entre eux. Les projectiles supplémentaires concernent les armes à distance. Les trois reliques suprêmes rendent les premiers étages plus accessibles, tandis que la difficulté continue d’augmenter dans les profondeurs.

### 3. Inventaire détaillé avec I

L’inventaire présente l’arme équipée, sa rareté, ses dégâts de base, ses dégâts par coup avec les bonus, sa cadence, son DPS hors critique et son bonus secondaire. Le DPS est indiqué par projectile et ne comprend pas les pouvoirs.

Il présente aussi les statistiques actuelles du personnage : PV, armure, vitesse, critique, multiplicateur critique, vol de vie, esquive, recharge du dash, projectiles, soins et gains d’argent.

Chaque objet passif affiche son effet. Les doublons sont regroupés avec leur quantité. Les objets permanents actifs sont inclus. Les bonus secondaires d’arme critique, cadence, vol de vie et dégâts élémentaires sont appliqués au combat.

## Commandes

- ZQSD, WASD ou flèches : déplacement.
- Souris : viser ; clic gauche : attaquer.
- Espace : dash.
- Tab : échanger l’arme active et celle en réserve.
- F : boule de feu ; R : chaîne de foudre ; T : éruption terrestre (après achat et nouvelle partie).
- E : interagir, acheter chez le marchand, ramasser, utiliser le portail.
- 1 / 2 / 3 : sélectionner un pouvoir ; clic droit : le lancer.
- I : inventaire ; M : carte ; Échap : pause.

## Sauvegardes

Les clés de sauvegarde de la version fournie sont conservées. Les sauvegardes version 1 sont chargées puis converties vers la version 2. Les ennemis déjà présents dans une ancienne sauvegarde gardent leurs valeurs enregistrées ; les nouveaux ennemis utilisent la nouvelle progression.

Pour retrouver la progression, utilise le même navigateur et remplace les fichiers dans le dossier habituel du jeu, après avoir conservé une copie de l’ancienne version. Le stockage des fichiers ouverts directement peut dépendre du navigateur et du chemin : déplacer le dossier peut rendre l’ancienne sauvegarde inaccessible. Ne vide pas les données du navigateur. Les sauvegardes sont locales et ne sont pas incluses dans ce ZIP.

Le choix après boss, les montées de niveau en attente, les bonus précis de l’arme et le butin conservé dans les salles sont sauvegardés. Un identifiant d’expédition empêche d’encaisser deux fois une partie déjà terminée.

## Vérifications

Syntaxe JavaScript vérifiée. **82 contrôles automatisés de logique réussis**, avec un DOM et un Canvas simulés. Ils couvrent notamment la progression, l’encaissement, les achats, le code de triche, les sorts, les nouvelles armes, les icônes, la sauvegarde et le ramassage.

Pour les relancer avec Node.js : `node tests/regression.cjs`.

Un **test dans Chromium réel** a également réussi : saisie du code, boutique de 14 articles, chargement des images, achats et sélection d’arme, charge du laser et dégâts sur deux cibles, inventaire, butin, sauvegarde/reprise et accès à la boutique dans une fenêtre de 1000 × 650. Les captures ont été inspectées pour vérifier la lisibilité des icônes et des interfaces. Ce contrôle ne remplace pas une longue session de jeu pour affiner l’équilibrage.

Le test navigateur optionnel est fourni dans `tests/browser.cjs`. Il nécessite Playwright et un navigateur Chromium installés pour le développement ; ces dépendances ne sont pas nécessaires pour jouer en ouvrant index.html. Le test ajoute ses accès internes uniquement à la copie de game.js servie par son serveur temporaire.

La personnalisation a aussi été vérifiée dans Chromium : 20 boutons de couleur, aperçu réactif, sauvegarde et rechargement, annulation, remise aux couleurs d’origine, modification depuis Pause, reprise de partie, statistiques conservées et affichage en fenêtre réduite. Test optionnel : `node tests/customization-browser.cjs` (mêmes dépendances que le test navigateur précédent).

Les nouveaux ajouts ont été vérifiés dans Chromium avec `tests/features-browser.cjs` : huit défis, accessoires offerts et gagnés, échanges par Tab et inventaire, phase II, contrepartie des reliques, sauvegarde/reprise et fenêtre réduite. Les 82 contrôles de logique couvrent aussi les combos, les recharges conservées, les attaques des boss et les déblocages permanents.

Test supplémentaire : `tests/roulette-browser.cjs` vérifie les mises, les verrouillages pendant l’animation, les résultats, le rechargement pendant un tirage et les petites fenêtres.

La coop a été vérifiée avec deux processus Chromium distincts et un vrai relais WebSocket local. Les 82 contrôles de logique incluent désormais le chargement des profils, le butin individuel, la mort des deux joueurs, les changements d’étage et l’encaissement avec reprise sur erreur. Le test serveur contrôle les salons, les rôles, les origines autorisées et les paquets invalides. Voir `COOP-DEPLOIEMENT.md` pour l’installation et les limites de la version.
