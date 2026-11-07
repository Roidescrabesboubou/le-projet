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
admin/              panel admin : afficher/cacher, ordonner, badges, modération (moderation.js)
reglages/           pseudo, avatar, clés IA, test réseau, sauvegarde
firebase-regles.json  règles de sécurité Firebase (publiées par firebase.cmd deploy --only database)
jeux/_modele/       squelette à copier pour chaque nouveau jeu
jeux/commun/        code partagé
  base.css/base.js    style + en-tête 🏠 ❓ ⚙️, pseudo, records
  catalogue.js        liste des jeux (slug, titre, emoji, état dispo/bientot/cache, ia)
  garde.js            bloque les jeux cachés, charge groupe.js
  reseau.js           salles en ligne (code ou lien), relais MQTT public
  ia.js               appels IA avec les clés des Réglages
  dle.js/dle.css      moteur commun des -dle à tableau (loldle, onepiecedle, pokedle, anidle) : chaque jeu = une config
  classement.js, series.js, medailles.js, jetons.js, compte.js, groupe.js, cartes.js
jeux/<slug>/        un dossier par jeu
```

## Ajouter un jeu
1. Copier `jeux/_modele/` vers `jeux/<slug>/`.
2. Ajouter l'entrée dans `jeux/commun/catalogue.js` (même slug).
3. S'il a un classement : ajouter le slug dans `firebase-regles.json` (puis le publier avec `firebase.cmd deploy --only database`).
4. Tester, commit, push sur `main`.

L'état choisi dans le panel admin passe avant celui de `catalogue.js`.

## Choix techniques
- **Firebase** (projet `salle-de-jeux`) : comptes, classements (top semaine remis à zéro le lundi 0 h, heure de Paris, et tous les temps), séries, médailles, groupes, jetons, état des jeux réglé dans l'admin.
- **IA** : appels directs depuis le navigateur, la clé reste dans le navigateur. Gemini en principal, Claude Haiku 5.5 en secours automatique. Les jeux `ia: true` sont réservés aux comptes autorisés (sauf invités venus par un lien de salle).
- **En ligne** : pas de serveur à moi. Salles avec code/lien via un relais public ; c'est l'hôte qui fait tourner la partie.
- **Sources externes** : Deezer (extraits 30 s) et AnimeThemes (openings). Spotify écarté (plus d'extraits depuis fin 2024). ZoneSons écarté tant qu'ils n'ont pas donné leur accord.
- **Casino** : 1 000 jetons au premier passage ; sous 50 jetons, 500 offerts le lendemain ; aucun autre moyen d'en gagner.

## Les jeux (slug → nom)
- IA : `quintuplees` Les Quintuplées (v12.4), `jdr` Table de Légendes (jusqu'à 8 joueurs, MJ IA ou joueur)
- Défis du jour (séries, pastille « x / 11 ») : `wordle` Mot du jour, `loldle`, `anidle`, `onepiecedle`, `pokedle`, `paysdle`, `connexions`, `motscroises`, `motsfleches`, `sudoku`, `shikaku`
- Party / en ligne : `dessin`, `telephone`, `quiz` (Culture G, manches spéciales), `blindtest`, `imposteur`, `categorie`, `encheres`
- Duels / plateau : `puissance4`, `bataille` (navale), `laser` (Bataille Laser), `mainmise` (façon Monopoly)
- Casino : `poker`, `blackjack`, `roulette`
- Solo / gestion / action : `arene` (Arène Éclair, FPS), `manufacture`, `rocade`, `defense` (Défense du Château), `coupdefeu` (Coup de Feu), `eveil`, `blocs`, `labyrinthe` (Souris gourmande), `demineur`
- Caché : `geoguessr` (GéoGamer — moteur prêt, manque des captures de vrais jeux)
- Emplacement « Bientôt » : « Encore un autre »

## Dette technique (à traiter en priorité quand on touche ces jeux)
- `quintuplees` a encore son propre code IA : à migrer vers `ia.js` (le réseau est déjà passé sur `reseau.js`, ntfy.sh abandonné : quota quotidien épuisé).
- `quiz`, `dessin`, `telephone`, `blindtest` : la connexion passe par `Reseau.canal` (reseau.js), mais chacun garde son propre protocole (hello/st/bye) et son propre en-tête/thème. Passer sur `base.css` demande de revoir tout leur style (classes `.btn`, `.ghost`, `.row`, `.hidden` en conflit). (Tous les défis du jour sont passés sur `base.js`.)
- Défis du jour : utiliser `Base.jour`, `Base.rng`, `Base.melanger`, `Base.avantMinuit`, `Base.partager` plutôt que les recopier. Ne jamais changer une date de départ ou une graine : ça change la grille du jour.

## Reste à faire
Tests réels à faire (seulement testé avec un relais simulé) :
- Partie en ligne sur deux appareils : Bataille Laser, L'Imposteur, Devine ta Catégorie, Bataille navale.
- Extraits Deezer dans le Quiz.
- Ressenti souris de l'Arène Éclair.
- Glisser-déposer de l'admin au doigt.

Décisions en attente :
- Table de Légendes : lever la restriction « jeu IA » maintenant qu'un joueur peut être MJ ?
- GéoGamer : fournir des captures ou le laisser caché.
- Blind Test : écrire à ZoneSons, ou monter ma propre base de répliques (YouTube + Firebase).
- Bataille Laser : ajouter la variante où l'on prédit la sortie du laser ?

Idées pas encore faites : Qui suis-je ? (IA), Interrogatoire (IA), Le marchandage (IA).
