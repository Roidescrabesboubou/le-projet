# Salle de jeux — instructions pour Claude

Site qui regroupe des mini-jeux (solo, party, en ligne, défis du jour, IA).
En ligne : https://roidescrabesboubou.github.io/le-projet/ (GitHub Pages, mise à jour 1 à 2 min après un push).

## Règles du projet
- Réponds en français.
- Chaque mise à jour est commitée et poussée sur `main` (pas de branche, pas de PR).
- HTML, CSS et JavaScript « vanilla » : pas de framework, pas de npm, pas d'étape de build.
- Un jeu = un dossier `jeux/<slug>/`, avec parfois un fichier de données à côté (`mots.js`, `questions.js`…).
- Git : `C:\Program Files\Git\cmd\git.exe` (Git pour Windows, identifiants GitHub enregistrés).
- Quand `firebase-regles.json` change, publie-le toi-même après le push : `firebase.cmd deploy --only database` (projet `salle-de-jeux-249d2`, déjà connecté, commande autorisée dans `.claude/settings.local.json`), puis dis-moi que c'est publié. Sous PowerShell, toujours `firebase.cmd` / `npm.cmd` (scripts .ps1 bloqués).

## Structure
```
index.html          accueil : cartes, records, défis du jour, filtres
admin/              panel admin en onglets : jeux (afficher/cacher, ordre, badges), catégories, comptes (accès IA, admin, suppression), modération (moderation.js), idées des joueurs, annonce
reglages/           pseudo, avatar, clés IA, test réseau, sauvegarde
firebase-regles.json  règles de sécurité Firebase (publiées par firebase.cmd deploy --only database)
jeux/_modele/       squelette à copier pour chaque nouveau jeu
jeux/commun/        code partagé
  base.css/base.js    style + en-tête 🏠 ❓ ⚙️, pseudo, records
  catalogue.js        liste des jeux (slug, titre, emoji, état dispo/bientot/cache, ia)
  garde.js            bloque les jeux cachés, charge groupe.js
  reseau.js           salles en ligne (code ou lien), relais MQTT public
  ia.js               appels IA avec les clés des Réglages
  dico.js             dictionnaire commun (mot + définitions) : Mot du jour, Mots croisés, Mots fléchés
  soiree.js/css       salon en ligne commun des jeux de soirée (quiaditca, emojis, cadran, menteur, pireconseil, aveugle) : le jeu fournit nouvelle/action/publique/privee/rendre, l'hôte fait tourner G
  dle.js/dle.css      moteur commun des -dle à tableau (loldle, onepiecedle, pokedle, anidle, electrodle) : chaque jeu = une config
  casino.js/css       portefeuille propre à chaque jeu (casino/<jeu>/<uid>, pas de jetons partagés) des 7 jeux de casino récents, sélecteur de mise, heure calée, hasard commun, mises des autres en direct (casinoLive/<jeu>)
  casinototal.js      classement « Les plus riches du casino » : somme des jetons de roulette/, blackjack/ et casino/<jeu>/ par compte (bouton dans la catégorie Casino de l'accueil et dans chaque jeu de casino ; le Poker n'a pas de jetons en ligne)
  classement.js, series.js, medailles.js, jetons.js, compte.js, groupe.js, cartes.js
jeux/<slug>/        un dossier par jeu
```

## Ajouter un jeu
1. Copier `jeux/_modele/` vers `jeux/<slug>/`.
2. Ajouter l'entrée dans `jeux/commun/catalogue.js` (même slug), le slug dans la bonne catégorie de `SALLE_CATEGORIES` (fin de `catalogue.js`), et ses mots-clés dans `MOTS_CLES` (`index.html`).
3. S'il a un classement : ajouter le slug dans `firebase-regles.json` (puis le publier avec `firebase.cmd deploy --only database`).
4. Tester, commit, push sur `main`.

L'état choisi dans le panel admin passe avant celui de `catalogue.js`.

Accueil : 6 catégories choisies avec moi (`SALLE_CATEGORIES` à la fin de `catalogue.js`, adresse `#jeux/<catégorie>`), chacune avec la liste de ses jeux par défaut : Défis du jour, Soirée entre amis, Duels et plateau, Casino, Histoires avec l'IA, Arcade et solo. L'onglet 🗂️ Catégories du panel admin crée, renomme, réordonne, masque ou supprime des catégories (`reglages/categories/<id>` = {titre, emoji, desc, c1, c2, o, suppr}) et change les catégories d'un jeu (`reglages/cats/<slug>` = "jour soiree", "" = aucune) ; ces choix passent avant le code. `SALLE_CATS(regl)` (catalogue.js) donne la liste finale, utilisée par l'accueil et l'admin. **Nouveau jeu : l'ajouter dans la bonne liste** (sinon il tombe dans Arcade et solo). Un jeu peut être dans plusieurs listes. Pas de page « tous les jeux ». Les jeux `ia: true` sont cachés de l'accueil sauf pour les comptes avec accès IA. Barre de recherche : nom, description, étiquettes et mots-clés de `MOTS_CLES` (`index.html`, ex. « tetris » → blocs) : **ajoute des mots-clés pour chaque nouveau jeu**. En groupe 👥 d'au moins 2 membres, seuls les jeux étiquetés `Multijoueur` s'affichent (seul dans son groupe, on voit tout) : mets cette étiquette à tout jeu qui a une salle en ligne. Message de bienvenue à la 1re visite (`salle_bienvenue_vue`). Boîte à idées en bas de l'accueil : `idees/<id>` = {t, n, u, d, s} (une par minute et par identité via `idees_dernier/<uid>`, lisible seulement par les admins), rangées dans l'onglet 💡 Idées de l'admin (nouvelle / à garder / faite / écartée).

## Choix techniques
- **Firebase** (projet `salle-de-jeux`) : comptes, classements (top semaine remis à zéro le lundi 0 h, heure de Paris, et tous les temps), séries, médailles, groupes, jetons, état des jeux réglé dans l'admin.
- **Joueurs sans compte** : identité Firebase anonyme (`Compte.anonyme()`, fournisseur « Anonyme » activé dans Authentication). Séries, résultats du jour, scores, Éveil, Shikaku, Coup de Feu sont rangés sous cet uid (`Classement.ecrireMoi`) : personne ne peut modifier l'entrée d'un autre. `scores/<jeu>/<uid>` = record de tous les temps, `scores_semaine/<jeu>/<uid>` = record de la semaine (champ `w`).
- **IA** : appels directs depuis le navigateur, la clé reste dans le navigateur. Gemini en principal, Claude Haiku 5.5 en secours automatique. Les jeux `ia: true` sont réservés aux comptes autorisés (sauf invités venus par un lien de salle).
- **En ligne** : pas de serveur à moi. Salles avec code/lien via un relais public ; c'est l'hôte qui fait tourner la partie.
  L'Arène Éclair essaie en plus une connexion directe WebRTC (invité ↔ hôte, l'hôte fait suivre) : le relais ne sert qu'à se trouver, et reste en secours si le direct échoue. Indicateur « ⚡ Direct / 🌐 Relais ». À étendre à `reseau.js` si ça marche bien.
- **Sources externes** : Deezer (extraits 30 s) et AnimeThemes (openings). ccMixter (instrus Creative Commons du Freestyle, copiées dans le dépôt, crédits affichés dans le jeu : obligatoires en CC BY). Spotify écarté (plus d'extraits depuis fin 2024). ZoneSons écarté tant qu'ils n'ont pas donné leur accord.
- **Casino** : 1 000 jetons au premier passage (une fois par jeu : chaque jeu de casino a son propre portefeuille, les jetons ne passent pas d'un jeu à l'autre) ; sous 50 jetons, 500 offerts le lendemain ; aucun autre moyen d'en gagner.

## Les jeux (slug → nom)
- IA : `quintuplees` Les Quintuplées (v12.4), `jdr` Table de Légendes (jusqu'à 8 joueurs, MJ IA ou joueur)
  - `jdr/campagne.js` : campagnes du MJ (cartes + calque d'objets, PNJ avec ressenti par héros et souvenirs, lore, créatures, rencontres, notes), écran « 📚 Mes campagnes », assistant IA du MJ. Tout reste dans le localStorage du MJ (`jdr_camps`) ; export/import JSON. Règle : rien de la campagne n'entre dans `G` (diffusé à tous) sauf une carte affichée, via `pubObjets` (sans objets cachés ni notes secrètes), et la carte du monde montrée, via `Monde.pub` (sans lieux cachés, notes secrètes ni liens).
  - `jdr/monde.js` : carte du monde de la campagne (`C.monde`), sans quadrillage, en SVG vectoriel : fond selon l'univers, terrains peints au pinceau (taches `[x,y,r,terrain]` fusionnées par un filtre), lieux, décor, routes, noms de régions, 🚩 position du groupe. Un lieu peut avoir sa propre carte (`C.mondes[id]`, lien `sm`, parent `p`, imbriquable, 30 max) ; montrée aux joueurs dans `G.monde.sous` si le lieu n'est pas caché. Onglet « 🌍 Monde » du MJ ; les joueurs la voient avec le bouton « 🌍 Carte du monde » (`G.monde`). Chargé avant campagne.js.
- Défis du jour (séries, pastille « x / 15, avec Coup de Feu ») : `chronologie` Chronologie (6 événements à ranger, 3 essais ; `evenements.js` : ajouter à la fin), `wordle` Mot du jour, `loldle`, `anidle`, `onepiecedle`, `pokedle`, `electrodle` Électrodle (appareils de la maison), `paysdle`, `connexions`, `motscroises`, `motsfleches`, `sudoku`, `shikaku`, `chancedle` Chancedle (un tirage de 000000 à 999999 par jour, badges et rangs ; `badges.js` partagé, `donnees.js` = raretés précalculées à regénérer si un badge change)
- Soirée en ligne (soiree.js, en ligne seulement, 3 à 12) : `quiaditca` Qui a dit ça ?, `emojis` Traduction Emoji, `cadran` Le Cadran (demi-roue de 10 crans entre deux mots, dès 2 joueurs), `menteur` Le Menteur (anecdotes vraies à trou dans `questions.js`, chacun invente une fausse réponse), `pireconseil` Pire Conseil (`situations.js`), `aveugle` Dessine à l'aveugle (mots de `dessin/mots.js`, dessin envoyé en traits 400×300, mode fantôme)
- Party / en ligne : `dessin`, `telephone`, `quiz` (Culture G, manches spéciales), `blindtest`, `imposteur`, `categorie`, `encheres`, `freestyle` (5 instrus ccMixter en CC BY dans `prods/`, recoupées à 42 mesures : 1er temps à 0,2 s, BPM mesuré dans `PRODS` ; boule sur 4 temps, rimes ; salle en ligne synchronisée sur l'horloge de l'hôte, lignes à se répartir)
- Duels / plateau : `sumo` Sumo (physique chez l'hôte, 20 envois/s ; ordis, 2 sur un clavier, en ligne 2 à 6), `serpents` Serpents (snake à plusieurs sur grille 34×26, l'hôte envoie l'état à chaque pas ; ordis, 2 sur un clavier, en ligne 2 à 6), `puissance4`, `morpion` Morpion géant (ultimate : ordi MCTS 3 niveaux, à deux, en ligne), `bataille` (navale), `laser` (Bataille Laser), `mainmise` (façon Monopoly)
- Casino : `poker`, `blackjack`, `roulette` (chacun son portefeuille) ; avec casino.js, chacun son portefeuille aussi : `crash` Crash (fusée commune, tours calculés depuis l'heure, chaîne remise à zéro chaque heure, encaissement auto), `roue` Roue de la fortune (roue commune toutes les 30 s, 50 cases), `course` Course de chevaux (course commune toutes les 50 s, cotes et arrivée tirées du numéro de course), `machine` Machine à sous (3×3, 5 lignes, joker, tours gratuits, retour ~98 % simulé), `plinko` Plinko (12 rangs, 3 risques ~99 %), `mines` Mines (5×5, x0,97 du jeu équitable), `grattage` Grattage (3 tickets, ~92 %)
- Solo / gestion / action : `arene` (Arène Éclair, FPS), `assaut` Assaut Galactique (shoot'em up à vagues, augments roguelite + 3 augments sans limite quand tout est au max, boss ; résistance des aliens `dur(w)` exponentielle après la vague 10, élites cerclés d'or ; coop en ligne où l'hôte calcule tout et envoie l'état 15 fois/s, duel où chacun a sa partie et s'envoie des plongeurs), `dactylo` Dactylo Défense (mots de dico.js, top 10), `tour` La Tour (empilement, top 10 ; duel en ligne 2 à 6 : mêmes blocs, chacun envoie sa hauteur), `minigolf` Mini-golf (9 trous dans TROUS, record local ; 2 à 4 sur un appareil ou en ligne, toutes les balles sur le terrain, la plus loin du trou joue, en ligne l'hôte calcule la physique), `manufacture`, `rocade`, `defense` (Défense du Château), `coupdefeu` (Coup de Feu), `eveil`, `blocs`, `labyrinthe` (Souris gourmande), `demineur`
- Caché : `geoguessr` (GéoGamer — moteur prêt, manque des captures de vrais jeux)
- Emplacement « Bientôt » : « Encore un autre »

## Dette technique (à traiter en priorité quand on touche ces jeux)
- `quintuplees` a encore son propre code IA : à migrer vers `ia.js` (le réseau est déjà passé sur `reseau.js`, ntfy.sh abandonné : quota quotidien épuisé).
- `quiz`, `dessin`, `telephone`, `blindtest` : la connexion passe par `Reseau.canal` (reseau.js), mais chacun garde son propre protocole (hello/st/bye) et son propre en-tête/thème. Passer sur `base.css` demande de revoir tout leur style (classes `.btn`, `.ghost`, `.row`, `.hidden` en conflit). (Tous les défis du jour sont passés sur `base.js`.)
- Défis du jour : utiliser `Base.jour`, `Base.rng`, `Base.melanger`, `Base.avantMinuit`, `Base.partager` plutôt que les recopier. Ne jamais changer une date de départ ou une graine : ça change la grille du jour.

## Reste à faire
Tests réels à faire (seulement testé avec un relais simulé) :
- Arène Éclair en ligne sur deux appareils (connexion directe WebRTC, dont un en 4G).
- Partie en ligne sur deux appareils : Bataille Laser, L'Imposteur, Devine ta Catégorie, Bataille navale, Freestyle (calage du son entre téléphones).
- Extraits Deezer dans le Quiz.
- Ressenti souris de l'Arène Éclair.
- Freestyle : juge au micro (reconnaissance vocale) et rendu des prods à l'oreille.
- Glisser-déposer de l'admin au doigt.
- Duels de La Tour et du Mini-golf : testés dans 2 onglets ; en ligne, l'hôte du Mini-golf doit garder la page affichée (la physique tourne chez lui).
- Qui a dit ça ?, Traduction Emoji, Le Cadran, Le Menteur, Pire Conseil, Dessine à l'aveugle : testés avec le vrai relais mais dans 3 onglets du même navigateur ; reste une vraie soirée sur plusieurs appareils (Dessine à l'aveugle : dessin au doigt sur téléphone).
- Sumo et Serpents en ligne : testés dans 2 onglets ; l'hôte doit garder la page affichée (la partie tourne chez lui), et le ressenti du Snake en ligne (délai des virages) reste à juger sur deux appareils.
- Table de Légendes : assistant IA, PNJ qui parlent, souvenirs des PNJ avec une vraie clé (testés seulement avec des réponses simulées) ; éditeur de carte et carte du monde au doigt sur un vrai téléphone.

Décisions en attente :
- GéoGamer : fournir des captures ou le laisser caché.
- Blind Test : écrire à ZoneSons, ou monter ma propre base de répliques (YouTube + Firebase).
- Bataille Laser : ajouter la variante où l'on prédit la sortie du laser ?

Idées pas encore faites : Qui suis-je ? (IA), Interrogatoire (IA), Le marchandage (IA).
