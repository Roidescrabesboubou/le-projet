/* ============================================================
   CATALOGUE DES JEUX (partagé par l'accueil, le panel admin
   et la protection des jeux cachés)

   Pour ajouter un jeu : crée un dossier jeux/<slug>/index.html,
   ajoute une entrée ci-dessous, et mets dans la page du jeu :
     <script src="../commun/garde.js"></script>

   etat par défaut :
     "dispo"   → visible et jouable
     "bientot" → affiché grisé, sans lien
     "cache"   → absent de l'accueil
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
    desc: "Le classique des blocs qui tombent : complète des lignes, enchaîne les combos et grimpe de niveau. Pièce en réserve, aperçu des suivantes et top 10 des scores.",
    tags: ["Arcade", "Solo"],
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
