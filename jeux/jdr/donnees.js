/* ============================================================
   TABLE DE LÉGENDES — données fixes (aucun token IA dépensé)
   Univers → origines (bonus de caractéristiques), classes
   (arme, talent, maîtrises), bestiaire par niveau (1 à 10),
   palette et décors des cartes.

   Pour ajouter un monstre : [id, nom, emoji, niveau, PV, CA, bonus d'attaque, dégâts, portée]
   (portée 1 = corps à corps). L'IA ne fait que citer l'id.
   Types de talents gérés par le moteur :
     soin_soi, soin (un allié à portée), soin_groupe, double (2 attaques),
     bonus (attaque + dés en plus), zone (dégâts autour d'une case),
     etourdir (attaque qui fait perdre un tour), bouclier (+2 CA au groupe)
   ============================================================ */
window.JDR = (function(){
  const STATS = ["FOR", "DEX", "CON", "INT", "SAG", "CHA"];
  const NOMS_STATS = {FOR: "Force", DEX: "Dextérité", CON: "Constitution", INT: "Intelligence", SAG: "Sagesse", CHA: "Charisme"};
  const TOUT = {FOR: 1, DEX: 1, CON: 1, INT: 1, SAG: 1, CHA: 1};

  const O = (nom, bonus, desc) => ({nom, bonus, desc});
  // K(id, nom, emoji, dé de vie, stat principale, maîtrises, CA de base, DEX max à la CA, [arme, dés, stat, portée], [talent, type, dés, utilisations par combat, portée, description], équipement, description)
  const K = (id, nom, emo, dv, stat, maitrises, ca, dex, a, t, kit, desc) => ({
    id, nom, emo, dv, stat, maitrises, ca, dex,
    arme: {nom: a[0], de: a[1], stat: a[2], portee: a[3]},
    cap: {nom: t[0], type: t[1], de: t[2], n: t[3], portee: t[4], desc: t[5]},
    kit, desc
  });
  const M = rows => rows.map(([id, nom, emo, niv, pv, ca, att, deg, portee]) => ({id, nom, emo, niv, pv, ca, att, deg, portee: portee || 1}));

  const UNIV = {
    fantasy: {
      nom: "Médiéval-fantastique", emo: "🐉",
      ambiance: "royaumes de chevaliers, de magie et de donjons, avec tavernes, forêts enchantées, ruines et dragons",
      monnaie: "pièces d'or",
      pal: {sol: "#d8c39a", herbe: "#8fbf6a", mur: "#6b5b4b", eau: "#5aa0d8", accent: "#c0603a"},
      deco: {T: "🌲", "^": "🪨", "=": "🪑", D: "🚪", C: "🧰", S: "🪜", "!": "🔥", "*": "✨"},
      origines: [
        O("Humain", TOUT, "polyvalent et ambitieux"),
        O("Elfe", {DEX: 2, INT: 1}, "gracieux, vision nocturne"),
        O("Nain", {CON: 2, FOR: 1}, "robuste et têtu"),
        O("Halfelin", {DEX: 2, CHA: 1}, "petit, chanceux et discret"),
        O("Demi-orc", {FOR: 2, CON: 1}, "puissant et endurant")
      ],
      classes: [
        K("gue", "Guerrier", "⚔️", 10, "FOR", ["FOR", "CON"], 16, 0, ["Épée longue", "1d8", "FOR", 1], ["Second souffle", "soin_soi", "1d10", 1, 0, "Récupère 1d10 + niveau PV"], ["cotte de mailles", "bouclier", "épée longue"], "Solide au contact, encaisse les coups."),
        K("rod", "Rôdeur", "🏹", 10, "DEX", ["DEX", "SAG"], 12, 99, ["Arc long", "1d8", "DEX", 8], ["Tir double", "double", "", 2, 0, "Deux attaques d'un coup"], ["arc long", "dague", "cape de voyage"], "Tireur précis, à l'aise en pleine nature."),
        K("vol", "Voleur", "🗡️", 8, "DEX", ["DEX", "INT"], 11, 99, ["Rapière", "1d6", "DEX", 1], ["Attaque sournoise", "bonus", "2d6", 3, 0, "+2d6 dégâts sur une attaque"], ["outils de crochetage", "dague", "cape sombre"], "Discret et agile, frappe là où ça fait mal."),
        K("mag", "Magicien", "🔮", 6, "INT", ["INT", "SAG"], 10, 99, ["Trait de feu", "1d10", "INT", 6], ["Boule de feu", "zone", "3d6", 1, 6, "3d6 dégâts à tous les ennemis autour d'une case"], ["grimoire", "bâton", "sacoche de composantes"], "Fragile mais dévastateur à distance."),
        K("cle", "Clerc", "✨", 8, "SAG", ["SAG", "CHA"], 16, 0, ["Masse d'armes", "1d6", "FOR", 1], ["Soins", "soin", "1d8", 3, 5, "Soigne un allié à 5 cases"], ["symbole sacré", "cotte d'écailles", "masse"], "Soigneur robuste, guidé par sa foi."),
        K("bar", "Barde", "🎵", 8, "CHA", ["CHA", "DEX"], 11, 99, ["Moquerie cruelle", "1d6", "CHA", 6], ["Chant revigorant", "soin_groupe", "1d6", 1, 0, "Soigne tous les alliés"], ["luth", "rapière", "habits colorés"], "Charmeur, soutient tout le groupe.")
      ],
      monstres: M([
        ["rat", "Rat géant", "🐀", 1, 7, 12, 3, "1d4+1"],
        ["gob", "Gobelin", "👺", 1, 9, 13, 4, "1d6+2"],
        ["goa", "Gobelin archer", "🏹", 1, 8, 13, 4, "1d6+2", 6],
        ["lou", "Loup", "🐺", 1, 11, 13, 4, "2d4+2"],
        ["squ", "Squelette", "💀", 2, 16, 13, 4, "1d6+2"],
        ["ban", "Bandit", "🥷", 2, 18, 12, 4, "1d8+2"],
        ["ara", "Araignée géante", "🕷️", 3, 28, 14, 5, "1d8+3"],
        ["orc", "Orc", "👹", 3, 30, 13, 5, "1d12+3"],
        ["gou", "Goule", "🧟", 4, 40, 13, 6, "2d6+3"],
        ["ogr", "Ogre", "🧌", 5, 60, 11, 6, "2d8+4"],
        ["nec", "Nécromancien", "🧙", 5, 45, 12, 7, "2d8+3", 6],
        ["tro", "Troll", "👾", 7, 85, 15, 8, "2d10+4"],
        ["vam", "Vampire", "🧛", 8, 100, 16, 9, "2d10+5"],
        ["dra", "Jeune dragon rouge", "🐉", 10, 150, 18, 10, "3d10+5", 4]
      ])
    },

    scifi: {
      nom: "Space opera", emo: "🚀",
      ambiance: "vaisseaux spatiaux, stations orbitales, planètes extraterrestres, empires galactiques et contrebandiers",
      monnaie: "crédits",
      pal: {sol: "#b9c3cf", herbe: "#7fb39a", mur: "#3d4656", eau: "#47c1d8", accent: "#3f7ad9"},
      deco: {T: "🌿", "^": "🪨", "=": "🖥️", D: "🚪", C: "📦", S: "🛗", "!": "⚡", "*": "💠"},
      origines: [
        O("Humain", TOUT, "débrouillard et adaptable"),
        O("Androïde", {INT: 2, CON: 1}, "logique, ne dort jamais"),
        O("Zorvien", {FOR: 2, CON: 1}, "colosse à quatre bras"),
        O("Néréide", {SAG: 2, CHA: 1}, "télépathe aux yeux d'argent"),
        O("Vulpin", {DEX: 2, SAG: 1}, "alien vif aux sens aiguisés")
      ],
      classes: [
        K("sol", "Soldat", "🪖", 10, "DEX", ["DEX", "CON"], 14, 2, ["Fusil laser", "1d10", "DEX", 7], ["Grenade", "zone", "3d6", 1, 5, "3d6 dégâts autour d'une case"], ["armure tactique", "fusil laser", "rations"], "Militaire aguerri, puissant à distance."),
        K("con", "Contrebandier", "🔫", 8, "DEX", ["DEX", "CHA"], 12, 99, ["Blaster", "1d8", "DEX", 6], ["Tir rapide", "double", "", 2, 0, "Deux tirs d'un coup"], ["blaster", "veste en cuir", "faux papiers"], "Pilote charmeur, toujours une combine."),
        K("med", "Médecin", "💉", 8, "SAG", ["SAG", "INT"], 12, 99, ["Pistolet paralysant", "1d6", "DEX", 5], ["Nanosoins", "soin", "2d4", 3, 5, "Soigne un allié à 5 cases"], ["trousse médicale", "scanner"], "Garde l'équipage en vie."),
        K("psi", "Psion", "🌀", 8, "SAG", ["SAG", "CHA"], 11, 99, ["Onde psychique", "1d8", "SAG", 6], ["Stase", "etourdir", "1d6", 2, 6, "Attaque qui paralyse la cible un tour"], ["cristal focalisateur", "robe"], "Maître des pouvoirs de l'esprit."),
        K("ing", "Ingénieur", "🔧", 8, "INT", ["INT", "DEX"], 13, 2, ["Pistolet à rivets", "1d8", "INT", 5], ["Bouclier déflecteur", "bouclier", "", 1, 0, "+2 CA à tout le groupe pour le combat"], ["boîte à outils", "drone de réparation"], "Répare tout, protège le groupe."),
        K("gla", "Gladiateur", "🗡️", 10, "FOR", ["FOR", "CON"], 15, 1, ["Lame vibrante", "1d10", "FOR", 1], ["Coup puissant", "bonus", "2d8", 2, 0, "+2d8 dégâts sur une attaque"], ["lame vibrante", "plastron"], "Combattant d'arène redoutable au contact.")
      ],
      monstres: M([
        ["drn", "Drone de sécurité", "🛸", 1, 8, 13, 4, "1d6+1", 6],
        ["pir", "Pirate de l'espace", "🏴", 1, 11, 12, 4, "1d8+1", 6],
        ["ver", "Ver des sables", "🪱", 1, 12, 11, 4, "1d6+2"],
        ["ins", "Insectoïde", "🦗", 2, 18, 13, 4, "1d8+2"],
        ["mer", "Mercenaire", "🔫", 3, 26, 14, 5, "2d6+2", 7],
        ["rob", "Robot de combat", "🤖", 3, 32, 15, 5, "1d10+3"],
        ["xen", "Xénomorphe", "👽", 4, 42, 14, 6, "2d6+3"],
        ["cyb", "Cyborg d'élite", "🦾", 5, 55, 16, 7, "2d8+3", 6],
        ["ten", "Horreur tentaculaire", "🦑", 6, 75, 14, 7, "2d8+4"],
        ["mec", "Méca de siège", "🦿", 8, 105, 17, 9, "3d8+4", 7],
        ["rei", "Reine de la ruche", "👑", 10, 155, 17, 10, "3d10+5"]
      ])
    },

    postapo: {
      nom: "Post-apocalypse", emo: "☢️",
      ambiance: "monde dévasté après la guerre nucléaire : déserts radioactifs, ruines de villes, abris souterrains, gangs et mutants",
      monnaie: "capsules",
      pal: {sol: "#cdb58a", herbe: "#a3a86a", mur: "#5e4a3a", eau: "#7da35a", accent: "#d9822b"},
      deco: {T: "🌵", "^": "🪨", "=": "🛢️", D: "🚪", C: "🧰", S: "🪜", "!": "☢️", "*": "⚙️"},
      origines: [
        O("Survivant", TOUT, "a tout vu, s'adapte à tout"),
        O("Mutant", {FOR: 2, CON: 1}, "corps déformé mais puissant"),
        O("Goule", {CON: 2, SAG: 1}, "résiste aux radiations"),
        O("Enfant de l'abri", {INT: 2, CHA: 1}, "instruit, naïf"),
        O("Nomade", {DEX: 2, SAG: 1}, "connaît les routes du désert")
      ],
      classes: [
        K("pil", "Pillard", "🪓", 10, "FOR", ["FOR", "CON"], 13, 2, ["Hache de pompier", "1d10", "FOR", 1], ["Rage", "double", "", 2, 0, "Deux attaques d'un coup"], ["hache", "armure de pneus"], "Brute qui fonce dans le tas."),
        K("tir", "Tireur", "🎯", 8, "DEX", ["DEX", "SAG"], 12, 99, ["Fusil de chasse", "1d10", "DEX", 8], ["Tir visé", "bonus", "2d6", 2, 0, "+2d6 dégâts sur un tir"], ["fusil", "jumelles"], "Abat tout ce qui bouge de loin."),
        K("bri", "Bricoleur", "🔧", 8, "INT", ["INT", "DEX"], 12, 99, ["Pistolet bricolé", "1d8", "DEX", 5], ["Cocktail Molotov", "zone", "2d8", 2, 5, "2d8 dégâts autour d'une case"], ["outils", "ferraille"], "Fabrique des merveilles avec des déchets."),
        K("tou", "Toubib", "🩹", 8, "SAG", ["SAG", "INT"], 12, 99, ["Machette", "1d6", "DEX", 1], ["Stimpack", "soin", "2d4", 3, 5, "Soigne un allié à 5 cases"], ["stimpacks", "machette"], "Seul médecin à cent kilomètres."),
        K("che", "Chef de bande", "📣", 8, "CHA", ["CHA", "FOR"], 13, 2, ["Revolver", "1d8", "CHA", 5], ["Harangue", "soin_groupe", "1d6", 1, 0, "Soigne tous les alliés"], ["revolver", "manteau de cuir"], "Meneur charismatique.")
      ],
      monstres: M([
        ["rad", "Rat radioactif", "🐀", 1, 7, 11, 3, "1d4+1"],
        ["chi", "Chien sauvage", "🐕", 1, 10, 12, 4, "1d6+2"],
        ["pil", "Pillard", "🪓", 1, 11, 12, 4, "1d8+1"],
        ["pti", "Pillard tireur", "🔫", 2, 14, 12, 4, "1d8+2", 6],
        ["gou", "Goule enragée", "🧟", 2, 18, 12, 4, "1d8+2"],
        ["sco", "Scorpion géant", "🦂", 3, 30, 14, 5, "1d10+3"],
        ["mut", "Super-mutant", "💪", 4, 45, 14, 6, "2d8+3"],
        ["drn", "Drone militaire", "🛸", 4, 35, 15, 6, "2d6+3", 7],
        ["bru", "Brute irradiée", "☢️", 6, 75, 14, 7, "2d10+3"],
        ["cha", "Char rouillé", "🚜", 8, 110, 18, 9, "3d8+4", 6],
        ["beh", "Béhémoth", "🦍", 10, 160, 16, 10, "3d10+6"]
      ])
    },

    horreur: {
      nom: "Horreur cosmique (1920)", emo: "🐙",
      ambiance: "années 1920 en Nouvelle-Angleterre : villes portuaires brumeuses, manoirs, cultes secrets et créatures indicibles venues d'ailleurs",
      monnaie: "dollars",
      pal: {sol: "#9d9486", herbe: "#5f7354", mur: "#3b3540", eau: "#36546b", accent: "#6b4b8a"},
      deco: {T: "🌳", "^": "🪦", "=": "🪑", D: "🚪", C: "📦", S: "🪜", "!": "🕯️", "*": "📜"},
      origines: [
        O("Citadin", TOUT, "sait se fondre dans la foule"),
        O("Ouvrier", {FOR: 2, CON: 1}, "endurci par l'usine"),
        O("Universitaire", {INT: 2, SAG: 1}, "a lu trop de livres interdits"),
        O("Mondain", {CHA: 2, INT: 1}, "fortuné, a ses entrées partout"),
        O("Vagabond", {DEX: 2, SAG: 1}, "a dormi dans tous les fossés")
      ],
      classes: [
        K("det", "Détective", "🕵️", 8, "DEX", ["DEX", "SAG"], 12, 99, ["Revolver", "1d8", "DEX", 6], ["Coup d'œil", "bonus", "2d6", 2, 0, "+2d6 dégâts sur un point faible"], ["revolver", "loupe", "carnet"], "Observe tout, tire juste."),
        K("box", "Boxeur", "🥊", 10, "FOR", ["FOR", "CON"], 12, 99, ["Poings", "1d8", "FOR", 1], ["Enchaînement", "double", "", 2, 0, "Deux coups d'un coup"], ["bandages", "casquette"], "Encaisse et rend les coups."),
        K("occ", "Occultiste", "📿", 6, "INT", ["INT", "SAG"], 11, 99, ["Signe des Anciens", "1d10", "INT", 5], ["Bannissement", "etourdir", "2d6", 2, 5, "Attaque qui fait perdre un tour"], ["grimoire", "craie", "amulette"], "Connaît les mots qu'il ne faut pas dire."),
        K("med", "Médecin", "🩺", 8, "SAG", ["SAG", "INT"], 11, 99, ["Pistolet de poche", "1d6", "DEX", 5], ["Premiers soins", "soin", "1d8", 3, 2, "Soigne un allié à 2 cases"], ["sacoche de médecin", "laudanum"], "Recoud les vivants, examine les morts."),
        K("jou", "Journaliste", "📸", 8, "CHA", ["CHA", "DEX"], 11, 99, ["Derringer", "1d6", "CHA", 5], ["Discours rassurant", "soin_groupe", "1d6", 1, 0, "Soigne tous les alliés"], ["appareil photo", "derringer"], "Fouineur, sait faire parler les gens.")
      ],
      monstres: M([
        ["rat", "Nuée de rats", "🐀", 1, 9, 11, 3, "1d6+1"],
        ["cul", "Cultiste", "🕯️", 1, 10, 11, 4, "1d6+2"],
        ["chi", "Chien des catacombes", "🐕", 1, 11, 12, 4, "1d6+2"],
        ["gan", "Gangster", "🎩", 2, 16, 12, 4, "1d8+2", 6],
        ["gou", "Goule", "🧟", 2, 20, 12, 4, "1d8+2"],
        ["pro", "Profond", "🐟", 3, 30, 13, 5, "1d10+3"],
        ["sor", "Sorcier du culte", "🔮", 4, 38, 12, 6, "2d6+3", 6],
        ["cho", "Chose sans nom", "👁️", 5, 60, 13, 7, "2d8+3"],
        ["bya", "Byakhee", "🦇", 6, 70, 14, 7, "2d8+4"],
        ["sho", "Shoggoth", "🫧", 8, 120, 14, 9, "3d8+5"],
        ["ava", "Avatar indicible", "🐙", 10, 165, 17, 10, "3d10+6", 3]
      ])
    },

    cyberpunk: {
      nom: "Cyberpunk", emo: "🌃",
      ambiance: "mégalopole futuriste sous la pluie et les néons, mégacorporations toutes-puissantes, gangs, implants cybernétiques et réseau",
      monnaie: "eurodollars",
      pal: {sol: "#5a5670", herbe: "#4f8a6b", mur: "#2b2838", eau: "#2fa6c9", accent: "#ff2e93"},
      deco: {T: "🌿", "^": "🧱", "=": "💻", D: "🚪", C: "📦", S: "🛗", "!": "⚡", "*": "💾"},
      origines: [
        O("Humain", TOUT, "pas (encore) trop d'implants"),
        O("Gamin des rues", {DEX: 2, CHA: 1}, "connaît chaque ruelle"),
        O("Corpo", {INT: 2, CHA: 1}, "ancien cadre d'une mégacorpo"),
        O("Nomade", {CON: 2, SAG: 1}, "clan des routes"),
        O("Augmenté", {FOR: 2, DEX: 1}, "plus de chrome que de chair")
      ],
      classes: [
        K("sol", "Solo", "🔫", 10, "DEX", ["DEX", "CON"], 14, 2, ["Pistolet intelligent", "1d10", "DEX", 7], ["Rafale", "double", "", 2, 0, "Deux tirs d'un coup"], ["pistolet intelligent", "gilet pare-balles"], "Mercenaire, tueur professionnel."),
        K("net", "Netrunner", "💻", 6, "INT", ["INT", "DEX"], 11, 99, ["Piratage", "1d10", "INT", 6], ["Court-circuit", "etourdir", "2d6", 2, 6, "Attaque qui fait perdre un tour"], ["cyberdeck", "lunettes RA"], "Pirate des réseaux et des implants."),
        K("tec", "Techie", "🛠️", 8, "INT", ["INT", "FOR"], 13, 2, ["Fusil à pompe", "1d10", "DEX", 3], ["Grenade IEM", "zone", "2d8", 2, 5, "2d8 dégâts autour d'une case"], ["outils", "fusil à pompe"], "Bricole armes et machines."),
        K("doc", "Charcudoc", "💉", 8, "SAG", ["SAG", "INT"], 12, 99, ["Pistolet", "1d8", "DEX", 5], ["Injecteur", "soin", "2d6", 3, 4, "Soigne un allié à 4 cases"], ["injecteurs", "pistolet"], "Médecin de rue sans licence."),
        K("lam", "Lame", "🗡️", 10, "DEX", ["DEX", "FOR"], 13, 99, ["Katana monomoléculaire", "1d10", "DEX", 1], ["Lames mantis", "bonus", "2d8", 2, 0, "+2d8 dégâts sur une attaque"], ["katana", "lames mantis"], "Bretteur augmenté ultra-rapide.")
      ],
      monstres: M([
        ["voy", "Voyou de gang", "🔪", 1, 10, 12, 4, "1d6+2"],
        ["tir", "Tireur de gang", "🔫", 1, 9, 12, 4, "1d6+2", 6],
        ["drn", "Drone de surveillance", "🛸", 1, 7, 14, 3, "1d6+1", 6],
        ["vig", "Vigile corpo", "👮", 2, 17, 14, 4, "1d8+2", 6],
        ["psy", "Cyberpsycho", "🤪", 3, 32, 13, 6, "2d6+2"],
        ["gla", "Glace noire", "🧊", 3, 25, 15, 5, "2d6+3", 8],
        ["mer", "Mercenaire augmenté", "🦾", 4, 44, 15, 6, "2d8+2", 6],
        ["ass", "Assassin optique", "🥷", 5, 52, 16, 7, "2d8+3"],
        ["mec", "Méca de police", "🤖", 7, 90, 17, 8, "2d10+4", 7],
        ["pro", "Prototype Dragon", "🐲", 10, 150, 18, 10, "3d10+5", 6]
      ])
    },

    pirates: {
      nom: "Pirates des Caraïbes", emo: "🏴‍☠️",
      ambiance: "mers des Caraïbes au XVIIIe siècle : navires, îles tropicales, ports animés, trésors enfouis, malédictions et vaudou",
      monnaie: "doublons",
      pal: {sol: "#e8d4a2", herbe: "#9bc46a", mur: "#7a5232", eau: "#3f9ad1", accent: "#c9482f"},
      deco: {T: "🌴", "^": "🪨", "=": "🛢️", D: "🚪", C: "💰", S: "🪜", "!": "🔥", "*": "🗺️"},
      origines: [
        O("Flibustier", TOUT, "né sur un pont de navire"),
        O("Matelot", {FOR: 2, CON: 1}, "dur à la tâche"),
        O("Gentilhomme", {CHA: 2, INT: 1}, "noble déchu"),
        O("Insulaire", {DEX: 2, SAG: 1}, "connaît les îles et leurs secrets"),
        O("Évadé", {DEX: 2, CON: 1}, "a fui les galères")
      ],
      classes: [
        K("bre", "Bretteur", "🤺", 10, "DEX", ["DEX", "CHA"], 13, 99, ["Sabre", "1d8", "DEX", 1], ["Botte secrète", "double", "", 2, 0, "Deux coups d'un coup"], ["sabre", "chapeau à plume"], "Escrimeur flamboyant."),
        K("can", "Canonnier", "💣", 10, "CON", ["CON", "DEX"], 13, 2, ["Tromblon", "1d10", "DEX", 3], ["Baril de poudre", "zone", "3d6", 1, 4, "3d6 dégâts autour d'une case"], ["tromblon", "poudre"], "Aime ce qui fait boum."),
        K("chi", "Chirurgien de bord", "🩹", 8, "SAG", ["SAG", "INT"], 12, 99, ["Pistolet", "1d8", "DEX", 5], ["Rhum et bandages", "soin", "1d8", 3, 2, "Soigne un allié à 2 cases"], ["scie", "rhum", "bandages"], "Ampute d'abord, pose des questions ensuite."),
        K("vau", "Vaudou", "🪬", 8, "SAG", ["SAG", "CHA"], 11, 99, ["Malédiction", "1d8", "SAG", 6], ["Poupée", "etourdir", "1d8", 2, 6, "Attaque qui fait perdre un tour"], ["poupée", "gris-gris"], "Parle aux esprits."),
        K("cap", "Capitaine", "🏴‍☠️", 8, "CHA", ["CHA", "FOR"], 14, 2, ["Pistolet et sabre", "1d8", "CHA", 4], ["Harangue", "soin_groupe", "1d6", 1, 0, "Soigne tous les alliés"], ["longue-vue", "pistolet", "tricorne"], "Meneur d'hommes.")
      ],
      monstres: M([
        ["cra", "Crabe géant", "🦀", 1, 9, 13, 3, "1d6+1"],
        ["mat", "Matelot ivre", "🍺", 1, 10, 11, 4, "1d6+2"],
        ["sol", "Soldat de la Marine", "💂", 1, 11, 13, 4, "1d8+1", 5],
        ["req", "Requin", "🦈", 2, 20, 12, 4, "2d4+2"],
        ["bou", "Boucanier", "🗡️", 2, 18, 13, 4, "1d8+2"],
        ["squ", "Marin squelette", "💀", 3, 28, 13, 5, "1d10+2"],
        ["noy", "Noyé maudit", "🧟", 4, 40, 13, 6, "2d6+3"],
        ["sir", "Sirène", "🧜", 5, 50, 14, 7, "2d8+3", 5],
        ["fan", "Capitaine fantôme", "👻", 7, 85, 15, 8, "2d10+4"],
        ["kra", "Kraken", "🐙", 10, 170, 16, 10, "3d10+6", 3]
      ])
    },

    japon: {
      nom: "Japon des yōkai", emo: "⛩️",
      ambiance: "Japon féodal mythique : villages, sanctuaires, forêts de bambous brumeuses, samouraïs, ninjas et yōkai",
      monnaie: "ryō",
      pal: {sol: "#e3d2b4", herbe: "#9cbf75", mur: "#5b4636", eau: "#6aaed6", accent: "#c8323c"},
      deco: {T: "🎋", "^": "🪨", "=": "🏮", D: "⛩️", C: "🎁", S: "🪜", "!": "🔥", "*": "📜"},
      origines: [
        O("Humain", TOUT, "simple mortel courageux"),
        O("Kitsune", {DEX: 2, CHA: 1}, "renard métamorphe malicieux"),
        O("Tengu", {DEX: 2, SAG: 1}, "homme-corbeau des montagnes"),
        O("Sang d'oni", {FOR: 2, CON: 1}, "descendant d'ogre"),
        O("Élu des kami", {SAG: 2, INT: 1}, "touché par les esprits")
      ],
      classes: [
        K("sam", "Samouraï", "⚔️", 10, "FOR", ["FOR", "CHA"], 16, 0, ["Katana", "1d10", "FOR", 1], ["Iaijutsu", "double", "", 2, 0, "Deux frappes d'un coup"], ["katana", "armure laquée"], "Guerrier d'honneur."),
        K("nin", "Ninja", "🥷", 8, "DEX", ["DEX", "INT"], 12, 99, ["Shuriken", "1d6", "DEX", 5], ["Frappe de l'ombre", "bonus", "3d6", 2, 0, "+3d6 dégâts sur une attaque"], ["shuriken", "grappin", "fumigènes"], "Invisible jusqu'au coup fatal."),
        K("onm", "Onmyōji", "📜", 6, "SAG", ["SAG", "INT"], 11, 99, ["Ofuda", "1d10", "SAG", 6], ["Sceau des cinq éléments", "zone", "3d6", 1, 6, "3d6 dégâts autour d'une case"], ["ofuda", "éventail"], "Exorciste et maître des sceaux."),
        K("moi", "Moine", "🧘", 8, "DEX", ["DEX", "SAG"], 12, 99, ["Bâton", "1d8", "DEX", 1], ["Paume du dragon", "etourdir", "1d8", 2, 1, "Frappe qui fait perdre un tour"], ["bâton", "chapelet"], "Corps et esprit ne font qu'un."),
        K("mik", "Miko", "🎐", 8, "SAG", ["SAG", "CHA"], 12, 99, ["Arc sacré", "1d8", "SAG", 6], ["Purification", "soin", "1d8", 3, 6, "Soigne un allié à 6 cases"], ["arc sacré", "clochettes"], "Prêtresse soigneuse des sanctuaires.")
      ],
      monstres: M([
        ["kap", "Kappa", "🐢", 1, 10, 13, 4, "1d6+2"],
        ["ron", "Rōnin", "🗡️", 1, 11, 13, 4, "1d8+1"],
        ["kit", "Kitsune malicieux", "🦊", 1, 9, 13, 4, "1d6+2", 5],
        ["bak", "Bakeneko", "🐈", 2, 17, 13, 4, "1d8+2"],
        ["ash", "Ashigaru archer", "🏹", 2, 15, 12, 4, "1d8+2", 7],
        ["ten", "Tengu", "🪶", 3, 28, 14, 5, "1d10+3"],
        ["oni", "Oni", "👹", 4, 48, 13, 6, "2d8+3"],
        ["jor", "Jorōgumo", "🕷️", 5, 55, 14, 7, "2d8+3"],
        ["gas", "Gashadokuro", "💀", 7, 95, 15, 8, "2d10+5"],
        ["oro", "Orochi", "🐍", 10, 165, 17, 10, "3d10+6", 2]
      ])
    }
  };

  return {STATS, NOMS_STATS, UNIV};
})();
