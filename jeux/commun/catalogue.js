/* ============================================================
   CATALOGUE DES JEUX (partagé par l'accueil, le panel admin
   et la protection des jeux cachés)

   Pour ajouter un jeu :
     1. copie le dossier jeux/_modele/ en jeux/<slug>/ (il est déjà
        branché sur la base commune : garde.js, base.css, base.js) ;
     2. ajoute une entrée ci-dessous avec le même slug.
   Modules communs (dans jeux/commun/) :
     base.css / base.js → style, en-tête 🏠❓⚙️, pseudo, records
     reseau.js          → jeu en ligne (salles avec code)
     groupe.js          → amis + groupe 👥 (chargé par garde.js) ; un jeu
                          en ligne sans reseau.js appelle Groupe.salleCreee(code)
     ia.js              → appels IA avec les clés des ⚙️ Réglages
     classement.js      → top 10 en ligne · series.js → séries -dle

   etat par défaut :
     "dispo"   → visible et jouable
     "bientot" → affiché grisé, sans lien
     "cache"   → absent de l'accueil
   ia: true → jeu qui utilise une IA : réservé aux comptes autorisés
     dans le panel admin (sauf invités arrivés par un lien de salle).
   Le panel admin (/admin/) peut changer l'état et le badge de
   chaque jeu sans toucher au code : son choix passe avant celui-ci.
   ============================================================ */
window.SALLE_CATALOGUE = [
  {
    slug: "quintuplees",
    title: "Les Quintuplées",
    emoji: "💞",
    desc: "Jeu de séduction avec IA : choisis une des cinq sœurs Nakano et gagne son cœur, seul ou jusqu'à 4 joueurs, en local ou en ligne.",
    tags: ["IA", "Histoire", "Multijoueur"],
    colors: ["#f6a6c1", "#8e5bd0"],
    etat: "dispo",
    ia: true
  },
  {
    slug: "poker",
    title: "Poker",
    emoji: "♠️",
    desc: "Texas Hold'em sans limite : choisis les jetons de départ et les blindes, puis affronte l'ordi, tes amis sur le même téléphone ou en ligne (2 à 8 joueurs). Le dernier qui a encore des jetons rafle tout !",
    tags: ["Cartes", "Casino", "Multijoueur", "Solo"],
    colors: ["#2fa36b", "#1d2b4f"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "blackjack",
    title: "Blackjack",
    emoji: "🂡",
    desc: "Bats le croupier sans dépasser 21. Tu reçois des jetons chaque jour, et c'est tout : aucun autre moyen d'en gagner que de jouer. Gère ton tapis et grimpe au classement des plus riches !",
    tags: ["Cartes", "Casino", "Quotidien", "Solo"],
    colors: ["#d9475a", "#1f7d52"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "coupdefeu",
    title: "Coup de Feu",
    emoji: "🔥",
    desc: "Deck-building culinaire façon Balatro : compose des recettes avec tes cartes-ingrédients, recrute ta brigade et tiens ta cuisine face aux services et aux critiques. Partie du jour identique pour tous, plus une partie libre.",
    tags: ["Cartes", "Réflexion", "Quotidien", "Solo"],
    colors: ["#ff9a3d", "#c2362b"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "defense",
    title: "Défense du Château",
    emoji: "🏰",
    desc: "Tower defense à construire toi-même : place tes camps, trace les chemins jusqu'au château et poste tes tours. Chaque boss tué fait un tirage pour une nouvelle tour ou un nouveau chemin, du commun au secret. Dépense ton or dans l'arbre d'améliorations pour aller toujours plus loin.",
    tags: ["Stratégie", "Collection", "Solo"],
    colors: ["#7cc35a", "#8a5a2b"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "blindtest",
    title: "Blind Test",
    emoji: "🎧",
    desc: "Écoute l'extrait et trouve le titre, l'artiste ou l'œuvre : hits, années 80 à 2010, rap FR, génériques TV, BO de films et jeux vidéo, openings et endings d'animé. En solo, avec des buzzers sur un écran ou en ligne, chacun sur son appareil.",
    tags: ["Musique", "Quiz", "Party", "Solo", "Multijoueur"],
    colors: ["#ff4f7b", "#3d3aa8"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "dessin",
    title: "Dessine & Devine",
    emoji: "🎨",
    desc: "Un joueur dessine, les autres devinent ! 19 thèmes (dont Animé) et près de 1 500 mots, plus tes propres mots. En ligne ou sur un seul écran.",
    tags: ["Dessin", "Multijoueur", "Party"],
    colors: ["#ffb37a", "#5b6bd0"],
    etat: "dispo",
  },
  {
    slug: "telephone",
    title: "Téléphone dessiné",
    emoji: "📞",
    desc: "Le téléphone arabe en dessins : écris une phrase, le suivant la dessine, le suivant devine le dessin… puis découvrez ensemble les albums et leurs dérapages. En ligne ou en se passant un seul appareil.",
    tags: ["Dessin", "Multijoueur", "Party"],
    colors: ["#b48cf2", "#ff6b8b"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "encheres",
    title: "La Grande Enchère",
    emoji: "🔨",
    desc: "Des personnages d'un animé sont mis aux enchères un par un : One Piece, Naruto, Dragon Ball, Jujutsu Kaisen… Gère ton argent, surenchéris ou laisse filer, et monte l'équipe la plus forte ! À deux, sur un seul écran ou en ligne.",
    tags: ["Stratégie", "Multijoueur", "Animé"],
    colors: ["#d9822b", "#5b6bd0"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "eveil",
    title: "Éveil",
    emoji: "👊",
    desc: "Frappe, entraîne-toi et grimpe de Novice du village à Au-delà des limites : pompes, vieux maître, salle de gravité, clones d'ombre… Ta puissance continue de monter même page fermée. Attrape les rivaux et transcende pour repartir plus fort !",
    tags: ["Clicker", "Solo", "Animé"],
    colors: ["#e4572e", "#f2c14e"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "mainmise",
    title: "Mainmise",
    emoji: "🌆",
    desc: "Prends le contrôle de Cité Néon : achète des quartiers, construis jusqu'à la tour, négocie avec tes rivaux et ruine-les à coups de loyers. De 2 à 6 joueurs, contre l'ordi, sur un seul écran ou en ligne.",
    tags: ["Plateau", "Stratégie", "Multijoueur", "Solo"],
    colors: ["#ff2e93", "#19e3ff"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "categorie",
    title: "Devine ta Catégorie",
    emoji: "🏷️",
    desc: "Les autres t'inventent une catégorie secrète (« il lui manque un œil », « a des pouvoirs magiques »…). Cite des personnages, ils te disent s'ils sont dedans, un peu ou pas du tout… et devine ta catégorie ! Sur un seul téléphone ou en ligne, de 2 à 12 joueurs.",
    tags: ["Party", "Multijoueur", "Animé"],
    colors: ["#f2a65a", "#2a9d8f"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "imposteur",
    title: "L'Imposteur",
    emoji: "🕵️",
    desc: "Tout le monde a le même mot secret… sauf l'imposteur, qui a un mot proche ou rien du tout. Donnez chacun un indice, puis votez pour le démasquer ! Sur un seul téléphone ou en ligne, de 3 à 12 joueurs.",
    tags: ["Mots", "Multijoueur", "Party"],
    colors: ["#8b6cf0", "#e8607a"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "wordle",
    title: "Mot du jour",
    emoji: "🟩",
    desc: "Le Wordle en français : devine le mot de 5 lettres en 6 essais. Un nouveau mot chaque jour à minuit, plus une partie libre illimitée.",
    tags: ["Mots", "Quotidien", "Solo"],
    colors: ["#7fd6a3", "#e0a526"],
    etat: "dispo",
  },
  {
    slug: "loldle",
    title: "LoL-dle",
    emoji: "⚔️",
    desc: "Devine le champion de League of Legends grâce à ses caractéristiques : genre, poste, espèce, région, année… Un nouveau champion chaque jour, plus une partie libre.",
    tags: ["Quotidien", "Solo", "Jeux vidéo"],
    colors: ["#c8aa6e", "#0a8fa8"],
    etat: "dispo",
  },
  {
    slug: "anidle",
    title: "Anidle",
    emoji: "🎌",
    desc: "Devine le personnage d'anime : genre, espèce, cheveux, pouvoirs, rôle, œuvre, format, année… Plus de 300 personnages de 75 œuvres, un nouveau chaque jour, plus une partie libre.",
    tags: ["Quotidien", "Solo", "Animé"],
    colors: ["#d6417d", "#5b6bd0"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "onepiecedle",
    title: "One Piece-dle",
    emoji: "🏴‍☠️",
    desc: "Devine le personnage de One Piece : affiliation, fruit du démon, haki, prime, taille, origine, premier arc… Un nouveau personnage chaque jour, plus une partie libre.",
    tags: ["Quotidien", "Solo", "Animé"],
    colors: ["#f2c14e", "#d63d3d"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "pokedle",
    title: "Pokédle",
    emoji: "⚡",
    desc: "Devine le Pokémon mystère parmi les 1 025 : types, couleur, stade d'évolution, taille, poids, génération… Un nouveau Pokémon chaque jour, plus une partie libre par génération.",
    tags: ["Quotidien", "Solo", "Jeux vidéo"],
    colors: ["#ffcb05", "#e53b3b"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "paysdle",
    title: "Paysdle",
    emoji: "🌍",
    desc: "Trouve le pays mystère en 8 essais grâce à la distance, la direction, le continent, la population et la langue. Un nouveau pays chaque jour.",
    tags: ["Géographie", "Quotidien", "Solo"],
    colors: ["#7cc6e8", "#2fa36b"],
    etat: "dispo",
  },
  {
    slug: "motscroises",
    title: "Mots croisés",
    emoji: "✏️",
    desc: "Remplis la grille à l'aide des définitions, au clavier ou au doigt. Une nouvelle grille chaque jour à minuit, plus des grilles au hasard à volonté.",
    tags: ["Mots", "Quotidien", "Solo"],
    colors: ["#5bb5ad", "#f2be5c"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "motsfleches",
    title: "Mots fléchés",
    emoji: "🏹",
    desc: "Les définitions sont directement dans la grille : suis les flèches et remplis les mots. Une nouvelle grille chaque jour à minuit, plus des grilles au hasard à volonté.",
    tags: ["Mots", "Quotidien", "Solo"],
    colors: ["#e0955a", "#5b6bd0"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "sudoku",
    title: "Sudoku du jour",
    emoji: "🔢",
    desc: "Une grille de sudoku par jour, la même pour tout le monde : facile en début de semaine, difficile le week-end. Notes, indices, chrono et séries de jours. Plus des grilles libres à volonté en 3 niveaux.",
    tags: ["Réflexion", "Quotidien", "Solo"],
    colors: ["#7fa3f0", "#f2a55a"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "connexions",
    title: "Connexions",
    emoji: "🔗",
    desc: "16 mots, 4 groupes secrets : retrouve ce qui les relie sans faire plus de 4 erreurs. Attention aux pièges ! Une nouvelle grille chaque jour.",
    tags: ["Mots", "Quotidien", "Solo"],
    colors: ["#f2d36b", "#bb8be0"],
    etat: "dispo",
  },
  {
    slug: "blocs",
    title: "Blocs",
    emoji: "🧱",
    desc: "Le classique des blocs qui tombent : complète des lignes, enchaîne les combos et grimpe de niveau. Pièce en réserve, aperçu des suivantes et top 10 des scores. Nouveau : Versus en ligne de 2 à 8 joueurs, envoie des lignes à tes adversaires et sois le dernier en vie !",
    tags: ["Arcade", "Solo", "Multijoueur"],
    colors: ["#4fc3e8", "#b06bd8"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "labyrinthe",
    title: "Souris gourmande",
    emoji: "🐭",
    desc: "Mange toutes les miettes du labyrinthe en échappant aux chats. Un morceau de fromage et c'est toi qui les chasses ! Niveaux de plus en plus rapides et top 10.",
    tags: ["Arcade", "Solo"],
    colors: ["#f2d36b", "#2c2350"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "shikaku",
    title: "Shikaku",
    emoji: "📐",
    desc: "Découpe la grille en rectangles : chacun contient un seul nombre, égal à son nombre de cases. Une grille 7×7 par jour, 11×11 par semaine, 25×25 par mois, et du 5×5 au 25×25 en partie libre, avec classement au temps partout.",
    tags: ["Réflexion", "Quotidien", "Solo"],
    colors: ["#f0a36b", "#5b6bd0"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "sentiers",
    title: "Sentiers",
    emoji: "🐾",
    desc: "Trace des sentiers dans la forêt pour relier les terriers aux arbres fruitiers de leur couleur, avant qu'un arbre ne déborde. Plus la partie avance, plus ça bouchonne !",
    tags: ["Réflexion", "Solo"],
    colors: ["#7fb85a", "#c9853e"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "demineur",
    title: "Démineur",
    emoji: "💣",
    desc: "Découvre toutes les cases sans faire exploser de mine. Trois difficultés, drapeaux au clic droit ou à l'appui long, et classement des meilleurs temps.",
    tags: ["Réflexion", "Solo"],
    colors: ["#8fcf9f", "#e8607a"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "quiz",
    title: "Quiz Culture G",
    emoji: "🧠",
    desc: "Plus de 750 questions dans 16 thèmes (histoire, sciences, animés, mythologie, Marseille…) et des manches spéciales : blind test, répliques cultes, emojis, drapeaux, intrus. Réponds vite pour marquer gros ! En solo, à plusieurs sur un écran ou en ligne, chacun sur son appareil.",
    tags: ["Quiz", "Multijoueur", "Party", "Solo"],
    colors: ["#9b84f5", "#ff8a3d"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "puissance4",
    title: "Puissance 4",
    emoji: "🔴",
    desc: "Aligne 4 jetons avant ton adversaire ! Contre l'ordi (3 niveaux), à deux sur le même écran ou en ligne contre un ami avec un code de salle.",
    tags: ["Réflexion", "Multijoueur", "Solo"],
    colors: ["#ff6b6b", "#f7c948"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "geoguessr",
    title: "GéoGamer",
    emoji: "🗺️",
    desc: "Retrouve où a été prise la capture d'écran sur la carte du jeu. Plus tu cliques près, plus tu marques de points.",
    tags: ["Jeux vidéo", "Solo"],
    colors: ["#6cc4a1", "#3b5bdb"],
    etat: "cache",
  },
  {
    slug: "encore-un-autre",
    title: "Encore un autre",
    emoji: "🕹️",
    desc: "Une idée de jeu à venir. Patience !",
    tags: ["Arcade"],
    etat: "bientot",
    sansPage: true
  }
];
