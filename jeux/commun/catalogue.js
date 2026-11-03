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
    desc: "Plus de 750 questions dans 16 thèmes (histoire, sciences, animés, mythologie, Marseille…). Réponds vite pour marquer gros ! En solo, à plusieurs sur un écran ou en ligne, chacun sur son appareil.",
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
