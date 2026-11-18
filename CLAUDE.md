# Salle de jeux — instructions pour Claude

Site de mini-jeux (défis du jour, soirée, apéro, duels, casino, IA, arcade).
En ligne : https://roidescrabesboubou.github.io/le-projet/ (GitHub Pages, 1 à 2 min après un push).

## Règles du projet
- Réponds en français.
- Chaque mise à jour est commitée et poussée sur `main` (pas de branche, pas de PR).
- HTML, CSS et JS « vanilla » : pas de framework, pas de npm, pas de build (exception : `serveur/`).
- Un jeu = un dossier `jeux/<slug>/` (+ parfois un fichier de données : `mots.js`, `questions.js`…).
- Git : `C:\Program Files\Git\cmd\git.exe`.
- Quand `firebase-regles.json` change, publie-le toi-même après le push : `firebase.cmd deploy --only database`, puis dis-moi que c'est publié. Sous PowerShell : `firebase.cmd` / `npm.cmd` / `npx.cmd` (scripts .ps1 bloqués).

## Documentation dans Obsidian (lire seulement ce qui sert)
Le détail est dans le coffre `F:\obsi\brain\2 - PROJETS\` :
- `Salle de jeux.md` : état, décisions, **à faire** (tests, décisions en attente, idées), historique. Lis-la en début de session de travail.
- `Salle de jeux\Salle de jeux - Quintuplées.md` : **à lire avant de toucher `quintuplees`**.
- `Salle de jeux\Salle de jeux - Table de Légendes.md` : avant de toucher `jdr`.
- `Salle de jeux\Salle de jeux - Apéro.md` : avant de toucher `apero.js`, `lasoiree` ou un jeu d'apéro.
- `Salle de jeux\Salle de jeux - Détails des jeux.md` : règles et points techniques des autres jeux (défis, soirée, casino, duels, solo).
- `Salle de jeux\Salle de jeux - Architecture.md` : code partagé, catégories de l'accueil, chemins Firebase, détail du réseau et de l'IA.
- `Salle de jeux\Salle de jeux - Catalogue des jeux.md`, `… - Journal.md`, `… - Outils Claude.md`.

Pour une petite tâche, ne lis pas ces notes si le code suffit.
**Quand tu changes un jeu, mets à jour sa note** (et sa version). En fin de session de travail : résumé dans `F:\obsi\brain\0 - INBOX\Sessions\`, puis note du projet (État actuel, À faire, Historique) et une ligne dans le Journal ; Catalogue si un jeu est ajouté, renommé ou caché.

## Structure
```
index.html        accueil (catégories, recherche MOTS_CLES, records, défis, boîte à idées)
admin/            panel admin (jeux, catégories, comptes, modération, idées, annonce)
reglages/         pseudo, avatar, clés IA, test réseau, sauvegarde
firebase-regles.json  règles de sécurité (seule protection : tout tourne dans le navigateur)
serveur/          serveur Cloudflare (Workers + Durable Objects) pour le temps réel
jeux/_modele/     squelette d'un nouveau jeu
jeux/commun/      base.css/js (en-tête, pseudo, records, outils des défis), catalogue.js,
                  garde.js, reseau.js, ia.js, dico.js, soiree.js, apero.js, dle.js,
                  casino.js, casinototal.js, classement.js, series.js, medailles.js,
                  jetons.js, compte.js, groupe.js, cartes.js
```

## Ajouter un jeu (ou `/nouveau-jeu`)
1. Copier `jeux/_modele/` vers `jeux/<slug>/`.
2. Entrée dans `jeux/commun/catalogue.js`, slug dans la bonne catégorie de `SALLE_CATEGORIES` (fin du fichier ; sinon il tombe dans Arcade et solo), mots-clés dans `MOTS_CLES` (`index.html`). Étiquette `Multijoueur` s'il a une salle en ligne.
3. Classement : ajouter le slug dans `firebase-regles.json` puis publier.
4. Tester, commit, push sur `main`. Ajouter le jeu dans les notes Obsidian (Catalogue, Détails des jeux).

L'état et les catégories choisis dans le panel admin passent avant le code.

## Choix techniques (essentiel)
- **Firebase** (`salle-de-jeux-249d2`) : comptes, classements (semaine remise à zéro le lundi 0 h heure de Paris + tous les temps), séries, médailles, groupes, jetons, état des jeux. Joueurs sans compte = identité anonyme (`Compte.anonyme()`, écriture via `Classement.ecrireMoi`).
- **IA** (`ia.js`) : appels depuis le navigateur avec la clé du joueur. Ordre du relais : IA principale et secours des Réglages, puis Groq, Mistral, OpenRouter, Claude Haiku 5.5, et **Gemini toujours en dernier** (c’est le seul payé ; `ordre` dans ia.js et `aiOrder` des Quintuplées). Gemini : gemini-3.1-flash-lite conseillé, relais 3.5-flash-lite puis 3.6-flash, OpenRouter (Gemma 4) et Groq (gpt-oss-120b). Relais pour un seul message ; JSON coupé = redemandé. Jeux `ia: true` réservés aux comptes autorisés (sauf invités par lien de salle).
- **En ligne** (`reseau.js`) : relais MQTT public HiveMQ → Mosquitto → EMQX (EMQX en dernier : perd des messages en temps réel ; code en 1). L'hôte fait tourner la partie. Serveur Cloudflare pour le temps réel (`Reseau.creer(jeu, {serveur: true})`, codes en 9, branché : Sumo) ; essai local `localStorage.salle_serveur = "ws://localhost:8787"` + config « serveur » de launch.json ; déployer : `npx.cmd wrangler deploy` dans `serveur/`. WebRTC de l'Arène coupé (`DIRECT = false`).
- **Casino** : un portefeuille par jeu, 1 000 jetons au départ, 500 le lendemain sous 50, rien d'autre.
- **Défis du jour** : utiliser `Base.jour`, `Base.rng`, `Base.melanger`, `Base.avantMinuit`, `Base.partager`. Ne jamais changer une date de départ ou une graine.
- Sources : Deezer, AnimeThemes, ccMixter (CC BY, crédits obligatoires). Pas de Spotify ni de ZoneSons.

## Les jeux (slug)
- IA : `quintuplees` (v16.1), `jdr` Table de Légendes
- Défis du jour : `chronologie`, `wordle`, `loldle`, `anidle`, `onepiecedle`, `pokedle`, `electrodle`, `paysdle`, `connexions`, `motscroises`, `motsfleches`, `sudoku`, `shikaku`, `chancedle`
- Soirée en ligne (soiree.js) : `quiaditca`, `emojis`, `cadran`, `menteur`, `pireconseil`, `aveugle`
- Apéro (apero.js, **tous cachés**) : `lasoiree` + `quipourrait`, `mainstable`, `shaker`, `couleurs`, `souffleur`, `silence`, `pose`, `contrat`, `western`, `ecrans`
- Party / en ligne : `dessin`, `telephone`, `quiz`, `blindtest`, `imposteur`, `categorie`, `encheres`, `freestyle`
- Duels / plateau : `sumo`, `serpents`, `puissance4`, `morpion`, `bataille`, `laser`, `mainmise`
- Casino : `poker`, `blackjack`, `roulette`, `crash`, `roue`, `course`, `machine`, `plinko`, `mines`, `grattage`
- Solo / action : `arene`, `assaut`, `dactylo`, `tour`, `minigolf`, `manufacture`, `rocade`, `defense`, `coupdefeu`, `eveil`, `blocs`, `labyrinthe`, `demineur`
- Caché : `geoguessr`

## Dette technique (à traiter quand on touche ces jeux)
- `quintuplees` garde son propre code IA (migration vers `ia.js` écartée) : tout changement de fournisseur est à faire dans ia.js ET dans les Quintuplées.
- `quiz`, `dessin`, `telephone`, `blindtest` : propre protocole et propre thème ; passer sur `base.css` demande de revoir leur style (`.btn`, `.ghost`, `.row`, `.hidden` en conflit).
