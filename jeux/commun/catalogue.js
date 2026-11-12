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
    slug: "freestyle",
    title: "Freestyle",
    emoji: "🎤",
    desc: "5 vraies prods de rap libres de droit (boom bap, old school, chill, trap), une boule rebondit sur les 4 temps de chaque ligne : pose le mot affiché sur le 4ᵉ temps, il rime avec celui de la ligne d'après. En solo ou en ligne à plusieurs : partagez-vous les lignes comme vous voulez. Juge au micro et enregistrement de ta prise.",
    tags: ["Musique", "Party", "Multijoueur", "Solo"],
    colors: ["#e0457b", "#ffc93c"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "arene",
    title: "Arène Éclair",
    emoji: "⚡",
    desc: "Un FPS nerveux en 3D : 5 armes (pistolet, mitraillette, pompe, sniper, lance-roquettes), double saut, dash, tremplins et rocket-jump. Réapparition en 2 secondes, le premier à 10 ou 20 frags gagne. Contre des bots ou en ligne jusqu'à 8.",
    tags: ["Action", "Multijoueur", "Solo"],
    colors: ["#ff8a1f", "#3ad6ff"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "manufacture",
    title: "Manufacture",
    emoji: "🏭",
    desc: "Un vrai jeu de plateau d'usine : explore une île en hexagones, pose extracteurs, machines et tapis, raffine le bois, le sable et le fer jusqu'aux automates, et honore les contrats de l'Exposition. De 1 à 4 joueurs, contre des bots, sur un écran ou en ligne.",
    tags: ["Plateau", "Stratégie", "Multijoueur", "Solo"],
    colors: ["#b5692a", "#3a7882"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "laser",
    title: "Bataille Laser",
    emoji: "🔦",
    desc: "Une bataille navale à coups de laser : cache tes miroirs, blocs et filtres colorés, puis tire des rayons chez l'adversaire. Où ressort le laser, et de quelle couleur ? Déduis où sont ses formes avant qu'il trouve les tiennes. Contre l'ordi, à deux ou en ligne.",
    tags: ["Réflexion", "Stratégie", "Multijoueur", "Solo"],
    colors: ["#7b4fe0", "#1d1a3a"],
    etat: "dispo",
    badge: "Nouveau"
  },
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
    slug: "jdr",
    title: "Table de Légendes",
    emoji: "🐉",
    desc: "Jeu de rôle façon Donjons & Dragons : le maître du jeu est une IA… ou l'un de vous, avec ses outils (éditeur de cartes, créatures, jets, récompenses). 7 univers, création des héros ensemble avec leur histoire, jets de dés, cartes quadrillées et combats tactiques au tour par tour. Seul ou jusqu'à 8 joueurs, sur un écran ou en ligne.",
    tags: ["IA", "Histoire", "Multijoueur", "Solo"],
    colors: ["#c0603a", "#3b2a5c"],
    etat: "dispo",
    badge: "Nouveau",
    ia: true
  },
  {
    slug: "crash",
    title: "Crash",
    emoji: "🚀",
    desc: "Une fusée pour tout le site : mise avant le décollage, le multiplicateur monte… encaisse avant l'explosion ! x1,5, x10, x100 ? Encaissement automatique et mises des autres joueurs en direct.",
    tags: ["Casino", "Multijoueur"],
    colors: ["#f97316", "#1d1150"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "plinko",
    title: "Plinko",
    emoji: "🔴",
    desc: "Lâche des billes sur une planche à clous : elles rebondissent jusqu'à une case qui multiplie ta mise, de x0,2 à x170. Trois niveaux de risque.",
    tags: ["Casino", "Solo"],
    colors: ["#db2777", "#3b1d5e"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "mines",
    title: "Mines",
    emoji: "💣",
    desc: "25 cases, des bombes cachées : chaque gemme trouvée fait grimper ton multiplicateur. Encaisse avant de tomber sur une bombe !",
    tags: ["Casino", "Solo"],
    colors: ["#0ea5a4", "#16324a"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "course",
    title: "Course de chevaux",
    emoji: "🏇",
    desc: "Une course toutes les 50 secondes, la même pour tout le site : mise sur ton cheval selon sa cote et sa forme, puis encourage-le jusqu'à la ligne d'arrivée !",
    tags: ["Casino", "Multijoueur"],
    colors: ["#15803d", "#ca8a04"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "roue",
    title: "Roue de la fortune",
    emoji: "💰",
    desc: "Une grande roue commune à tout le site : pose tes jetons sur x2, x4, x7, x12, x23 ou x48… et prie pour qu'elle s'arrête sur ta case.",
    tags: ["Casino", "Multijoueur"],
    colors: ["#9333ea", "#e2b93b"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "grattage",
    title: "Grattage",
    emoji: "🎟️",
    desc: "Achète un ticket et gratte-le au doigt : trois symboles identiques et c'est gagné, jusqu'à 500 fois le prix du ticket !",
    tags: ["Casino", "Solo"],
    colors: ["#ca8a04", "#7a4524"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "machine",
    title: "Machine à sous",
    emoji: "🎰",
    desc: "Tire le levier : 5 lignes, joker 🃏, tours gratuits avec les 🎁 et jackpot x1000 pour trois jokers alignés.",
    tags: ["Casino", "Solo"],
    colors: ["#e11d48", "#f2c14e"],
    etat: "dispo",
    badge: "Nouveau"
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
    tags: ["Cartes", "Casino", "Solo"],
    colors: ["#d9475a", "#1f7d52"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "roulette",
    title: "Roulette",
    emoji: "🎡",
    desc: "Une seule roulette pour tout le site : la roue tourne en boucle, tu vas et viens quand tu veux et tu vois les mises des autres en direct. 1 000 jetons chaque jour, et c'est tout : aucun autre moyen d'en gagner que de jouer. Grimpe au classement des plus riches !",
    tags: ["Casino", "Multijoueur"],
    colors: ["#c0303c", "#1f7d52"],
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
    slug: "quiaditca",
    title: "Qui a dit ça ?",
    emoji: "🕵️",
    desc: "Une question perso tombe (« ton pire achat ? »), tout le monde répond en secret… puis devinez qui a écrit chaque réponse ! Bluffez pour piéger les autres. En ligne, de 3 à 12 joueurs : parfait sur Discord.",
    tags: ["Party", "Multijoueur"],
    colors: ["#d9468f", "#f2c14e"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "emojis",
    title: "Traduction Emoji",
    emoji: "😂",
    desc: "Le téléphone arabe en emojis : une phrase est traduite en emojis, que le suivant retraduit en phrase, puis encore en emojis… Découvrez ensemble les dérapages et distribuez des ❤️. En ligne, de 3 à 12 joueurs.",
    tags: ["Party", "Multijoueur"],
    colors: ["#f29d16", "#5b6bd0"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "menteur",
    title: "Le Menteur",
    emoji: "🤥",
    desc: "Une anecdote vraie mais incroyable, avec un trou (« En 1932, l'Australie a fait la guerre à des ___ »). Chacun invente une fausse réponse crédible, puis trouvez la vraie au milieu des mensonges ! En ligne, de 3 à 12 joueurs.",
    tags: ["Party", "Multijoueur"],
    colors: ["#c2410c", "#5b6bd0"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "pireconseil",
    title: "Pire Conseil",
    emoji: "🙊",
    desc: "Une situation gênante tombe (« ton chef te surprend en train de dormir »). Chacun écrit en secret le pire conseil possible, puis vote anonyme pour le plus drôle. En ligne, de 3 à 12 joueurs.",
    tags: ["Party", "Multijoueur"],
    colors: ["#16a34a", "#f2c14e"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "aveugle",
    title: "Dessine à l'aveugle",
    emoji: "🙈",
    desc: "Chacun reçoit un mot secret et doit le dessiner… sans voir son dessin ! Puis les chefs-d'œuvre sont dévoilés un par un et tout le monde devine. Mode fantôme où le trait s'efface. En ligne, de 3 à 12 joueurs.",
    tags: ["Party", "Multijoueur", "Dessin"],
    colors: ["#7c3aed", "#ec4899"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "cadran",
    title: "Le Cadran",
    emoji: "🎯",
    desc: "Un demi-cadran va d'un mot à son opposé (Froid ↔ Chaud). Le devin voit la cible cachée et donne un indice, son équipe tourne l'aiguille, l'autre parie à gauche ou à droite… puis on ouvre le volet ! Deux équipes jusqu'à 10 points, ou tous ensemble. En ligne, de 2 à 12 joueurs.",
    tags: ["Party", "Multijoueur", "Mots"],
    colors: ["#2f8fce", "#e5484d"],
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
    slug: "electrodle",
    title: "Électrodle",
    emoji: "🔌",
    desc: "Devine l'appareil de la maison : pièce, catégorie, usage, énergie, prix, poids, année d'invention… Un nouvel appareil chaque jour, plus une partie libre.",
    tags: ["Quotidien", "Solo"],
    colors: ["#2f9fd6", "#f2be5c"],
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
    slug: "chronologie",
    title: "Chronologie",
    emoji: "⏳",
    desc: "Six événements (histoire, inventions, films, jeux vidéo, sport…) à ranger du plus ancien au plus récent, en 3 essais. Un nouveau défi chaque jour, plus une partie libre illimitée.",
    tags: ["Quotidien", "Histoire", "Solo"],
    colors: ["#d08a3c", "#2f8fce"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "morpion",
    title: "Morpion géant",
    emoji: "#️⃣",
    desc: "Neuf morpions dans un grand morpion : la case où tu joues envoie ton adversaire dans le petit morpion correspondant. Aligne trois petits morpions gagnés ! Contre l'ordi (3 niveaux), à deux ou en ligne.",
    tags: ["Plateau", "Stratégie", "Multijoueur", "Solo"],
    colors: ["#6d4cdb", "#ff6a2b"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "sumo",
    title: "Sumo",
    emoji: "🤼",
    desc: "Pousse les autres lutteurs hors de l'arène ! Fonce, charge, ramasse l'étoile pour devenir géant… et méfie-toi, l'arène rétrécit. Contre l'ordi, à deux sur un clavier ou en ligne jusqu'à 6.",
    tags: ["Arcade", "Action", "Multijoueur", "Solo"],
    colors: ["#dc2626", "#f2c14e"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "serpents",
    title: "Serpents",
    emoji: "🐍",
    desc: "Le snake à plusieurs : tous les serpents dans la même arène, mange des pommes pour grandir et fais foncer les autres dans ton corps. Le dernier en vie gagne ! Contre l'ordi, à deux sur un clavier ou en ligne jusqu'à 6.",
    tags: ["Arcade", "Multijoueur", "Solo"],
    colors: ["#16a34a", "#3b82f6"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "assaut",
    title: "Assaut Galactique",
    emoji: "👾",
    desc: "Repousse des vagues d'aliens et empile les augments après chaque vague : tir triple, missiles, drones, éclairs en chaîne, rebonds, météores… Boss toutes les 5 vagues. Solo avec top 10, coop jusqu'à 4 ou duel où tes éliminations envoient des ennemis aux autres.",
    tags: ["Arcade", "Action", "Multijoueur", "Solo"],
    colors: ["#7b5cff", "#4fd1ff"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "dactylo",
    title: "Dactylo Défense",
    emoji: "⌨️",
    desc: "Des mots tombent sur ta ville : tape-les au clavier pour les détruire ! Vagues de plus en plus rapides, multiplicateur, mots bonus et boss en phrases entières. Mots par minute et top 10.",
    tags: ["Arcade", "Mots", "Solo"],
    colors: ["#18a999", "#2a1f5a"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "minigolf",
    title: "Mini-golf",
    emoji: "⛳",
    desc: "Un parcours de 9 trous à faire en le moins de coups possible : tire comme un lance-pierre et évite le sable, l'eau, les bumpers, le vent et les moulins. Seul, ou de 2 à 4 sur un appareil ou en ligne : toutes les balles sont sur le terrain et se cognent !",
    tags: ["Arcade", "Multijoueur", "Solo"],
    colors: ["#2e9d4f", "#f2c14e"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "tour",
    title: "La Tour",
    emoji: "🏗️",
    desc: "Empile les blocs le plus haut possible : ce qui dépasse est coupé, la tour s'affine… Lâche-les pile dessus pour les faire regrandir. Un doigt suffit, et le top 10 t'attend. Duel en ligne jusqu'à 6 : mêmes blocs pour tous, la plus haute tour gagne.",
    tags: ["Arcade", "Multijoueur", "Solo"],
    colors: ["#e0663a", "#5b6bd0"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "chancedle",
    title: "Chancedle",
    emoji: "🎲",
    desc: "Un seul tirage par jour : un nombre entre 000 000 et 999 999, et que la chance ! Miroir, brelan, nombre premier, heure, date… chaque particularité rapporte un badge et des points. Du ⚪ Banal au 🔴 Mythique, classement des meilleurs tirages et album des badges.",
    tags: ["Quotidien", "Solo"],
    colors: ["#7b4fd6", "#f2be3c"],
    etat: "dispo",
    badge: "Nouveau"
  },
  {
    slug: "rocade",
    title: "Rocade",
    emoji: "🛣️",
    desc: "Trace le réseau routier de Paris, New York, Las Vegas, Londres, Tokyo ou Venise : ponts, tunnels, ronds-points, feux et autoroutes. La ville grandit chaque semaine, jusqu'à la paralysie !",
    tags: ["Réflexion", "Solo"],
    colors: ["#5b8fd0", "#e2783c"],
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
    slug: "bataille",
    title: "Bataille navale",
    emoji: "🚢",
    desc: "Place tes 5 navires en secret, puis tire case par case pour couler la flotte ennemie. Contre l'ordi (3 amiraux, du moussaillon à l'impitoyable), à deux sur le même écran avec écran caché entre les tours, ou en ligne contre un ami.",
    tags: ["Réflexion", "Multijoueur", "Solo"],
    colors: ["#2f7fd1", "#1cb6aa"],
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

/* ============================================================
   CATÉGORIES DE L'ACCUEIL (choisies avec le propriétaire du site)
   jeux : la liste par défaut. Le panel admin peut changer les
   catégories d'un jeu (reglages/cats/<slug> = "jour soiree", ou ""
   pour aucune) : ce choix passe avant la liste par défaut. Un jeu
   sans catégorie va dans « Arcade et solo ». Un nouveau jeu : ajoute
   son slug dans la bonne liste ci-dessous.
   ============================================================ */
window.SALLE_CATEGORIES = [
  {id: "jour", emoji: "📅", titre: "Défis du jour", c: ["#ffb020", "#ff6a2b"],
   desc: "Un nouveau défi chaque jour, le même pour tout le monde. Garde ta série et gagne des médailles.",
   jeux: ["wordle", "loldle", "onepiecedle", "pokedle", "electrodle", "anidle", "paysdle", "motscroises", "motsfleches", "sudoku", "connexions", "shikaku", "chancedle", "chronologie", "coupdefeu"]},
  {id: "soiree", emoji: "🎉", titre: "Soirée entre amis", c: ["#ff4f7b", "#8b4dff"],
   desc: "Des jeux de groupe où chacun joue sur son téléphone, il suffit d'un code de salle.",
   jeux: ["freestyle", "blindtest", "dessin", "telephone", "quiz", "imposteur", "categorie", "quiaditca", "emojis", "cadran", "menteur", "pireconseil", "aveugle"]},
  {id: "duels", emoji: "⚔️", titre: "Duels et plateau", c: ["#3d6bff", "#22b8cf"],
   desc: "Contre l'ordinateur ou contre un ami, sur le même écran ou en ligne.",
   jeux: ["puissance4", "morpion", "sumo", "serpents", "tour", "minigolf", "assaut", "bataille", "laser", "mainmise", "manufacture", "encheres"]},
  {id: "casino", emoji: "🎰", titre: "Casino", c: ["#0f7a4a", "#d4a017"],
   desc: "Poker, blackjack et roulette avec de faux jetons : 1 000 pour commencer.",
   jeux: ["poker", "blackjack", "roulette", "crash", "roue", "course", "machine", "plinko", "mines", "grattage"]},
  {id: "ia", emoji: "🤖", titre: "Histoires avec l'IA", c: ["#5b2bd8", "#ff6a9a"],
   desc: "Des aventures racontées par une IA.",
   jeux: ["quintuplees", "jdr"]},
  {id: "arcade", emoji: "🕹️", titre: "Arcade et solo", c: ["#1f9a66", "#9bd34a"],
   desc: "Arcade, réflexion et gestion : des records à battre quand tu as un moment.",
   jeux: ["arene", "assaut", "serpents", "sumo", "dactylo", "tour", "minigolf", "blocs", "labyrinthe", "demineur", "rocade", "defense", "eveil"]}
];

/* Liste finale des catégories : celles du code, modifiées ou masquées
   depuis le panel admin (reglages/categories/<id> = {titre, emoji, desc,
   c1, c2, o, suppr}), plus celles créées dans le panel. Chaque catégorie
   reçoit sa liste de jeux (jeux), réglages admin compris. */
window.SALLE_CATS = function(regl){
  const perso = (regl && regl.categories) || {};
  const liste = window.SALLE_CATEGORIES.map((c, i) => ({...c, c: [...c.c], o: i * 10, code: true}));
  for(const [id, p] of Object.entries(perso)){
    if(!p || typeof p !== "object") continue;
    let c = liste.find(x => x.id === id);
    if(!c){
      if(!p.titre) continue;
      c = {id, emoji: "🎲", titre: "", desc: "", c: ["#8b4dff", "#ff4f7b"], jeux: [], o: 1000, code: false};
      liste.push(c);
    }
    if(typeof p.titre === "string" && p.titre) c.titre = p.titre;
    if(typeof p.emoji === "string" && p.emoji) c.emoji = p.emoji;
    if(typeof p.desc === "string") c.desc = p.desc;
    if(typeof p.c1 === "string") c.c[0] = p.c1;
    if(typeof p.c2 === "string") c.c[1] = p.c2;
    if(typeof p.o === "number") c.o = p.o;
    if(p.suppr === true) c.suppr = true;
  }
  return liste.filter(c => !c.suppr).sort((a, b) => a.o - b.o).map(c => ({...c, jeux: window.SALLE_JEUX_DE(c.id, regl)}));
};

/* Slugs d'une catégorie, réglages admin compris */
window.SALLE_JEUX_DE = function(catId, regl){
  const cats = (regl && regl.cats) || {};
  const defaut = (window.SALLE_CATEGORIES.find(c => c.id === catId) || {jeux: []}).jeux;
  return window.SALLE_CATALOGUE.map(g => g.slug).filter(s =>
    typeof cats[s] === "string" ? cats[s].split(" ").includes(catId) : defaut.includes(s));
};
