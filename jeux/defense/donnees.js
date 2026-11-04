/* ============================================================
   DÉFENSE DU CHÂTEAU : les données du jeu (tours, chemins, camps, arbre)
   Tous les chiffres sont des valeurs de départ, à équilibrer ici.
   ============================================================ */
window.TD = (function(){
  /* chance : probabilité de base au tirage d'un boss (camp Forêt, sans chance) */
  const RARETES = [
    {nom: "Commun",     couleur: "#a8adb5", chance: 1/3,        stock: 1,     qte: [3, 5], boss: 5},
    {nom: "Peu commun", couleur: "#5fc46f", chance: 1/10,       stock: .6,    qte: [2, 3], boss: 5},
    {nom: "Rare",       couleur: "#4f9dee", chance: 1/40,       stock: .35,   qte: [1, 2], boss: 4},
    {nom: "Épique",     couleur: "#b06be8", chance: 1/200,      stock: .15,   qte: [1, 1], boss: 4},
    {nom: "Légendaire", couleur: "#f2a93b", chance: 1/2000,     stock: .05,   qte: [1, 1], boss: 3},
    {nom: "Mythique",   couleur: "#35d6c6", chance: 1/50000,    stock: .01,   qte: [1, 1], boss: 3},
    {nom: "Secret",     couleur: "#e8eaf0", chance: 1/25000000, stock: .001,  qte: [1, 1], boss: 2}
  ];

  /* dmg × cad = DPS. portee en cases. mode :
     mono, zone (rayon), cone, chaine (n), ligne (traverse tout), continu (5 fois/s), champ (tous à portée),
     mine (posée sur le trajet), silo (frappe tout le terrain), aura (ne tire pas).
     piege : se pose sur un chemin et frappe ce qui passe sur la case.
     Effets : ralentit, etourdit, brule, poison, recul (cases), vuln (dégâts reçus), execute (achève sous x % de PV),
     pct (% des PV actuels par seconde, 3 paliers), de (dégâts au dé), double (aller-retour), limite (par terrain). */
  const TOURS = [
    {id: "arbalete", nom: "Arbalète", emoji: "🏹", r: 0, dmg: 10, cad: 1, portee: 3, mode: "mono", txt: "Une seule cible"},
    {id: "mitrailleuse", nom: "Mitrailleuse", emoji: "🔫", r: 0, dmg: 3, cad: 3, portee: 2.5, mode: "mono", txt: "Tir rapide, courte portée"},
    {id: "catapulte", nom: "Catapulte", emoji: "☄️", r: 0, dmg: 12, cad: .5, portee: 3.5, mode: "zone", rayon: .8, txt: "Petite zone"},
    {id: "canon", nom: "Canon", emoji: "🧨", r: 0, dmg: 16, cad: .5, portee: 3, mode: "zone", rayon: .5, txt: "Boulet à très petite zone"},
    {id: "harpon", nom: "Harpon", emoji: "🔱", r: 0, dmg: 20, cad: .4, portee: 4, mode: "mono", recul: 1, txt: "Ramène l'ennemi d'une case en arrière"},
    {id: "barils", nom: "Barils explosifs", emoji: "🛢️", r: 0, dmg: 36, cad: .25, portee: 2, mode: "zone", rayon: 1.3, txt: "Grosse explosion, très lente, courte portée"},
    {id: "baliste_p", nom: "Baliste perçante", emoji: "📍", r: 0, dmg: 18, cad: .5, portee: 4, mode: "ligne", txt: "Traverse tous les ennemis alignés"},
    {id: "phare", nom: "Phare", emoji: "💡", r: 0, dmg: 0, cad: 0, portee: 2, mode: "aura", buffPortee: .2, txt: "+20 % de portée aux tours voisines"},
    {id: "pointes", nom: "Barrière à pointes", emoji: "🌵", r: 0, dmg: 12, cad: 1, piege: true, txt: "Blesse tout ce qui passe sur la case"},
    {id: "ours", nom: "Piège à ours", emoji: "🐻", r: 0, dmg: 30, cad: .25, etourdit: 1.5, piege: true, txt: "Immobilise 1,5 s, se réarme en 4 s"},

    {id: "baliste", nom: "Baliste", emoji: "🎯", r: 1, dmg: 60, cad: 1/3, portee: 6, mode: "mono", vise: "fort", txt: "Vise l'ennemi le plus résistant"},
    {id: "givre", nom: "Tour de givre", emoji: "❄️", r: 1, dmg: 6, cad: 1.5, portee: 3, mode: "mono", ralentit: {p: .2, d: 2}, txt: "Ralentit de 20 %"},
    {id: "bombarde", nom: "Bombarde", emoji: "💣", r: 1, dmg: 24, cad: .5, portee: 3.5, mode: "zone", rayon: 1.2, txt: "Zone moyenne"},
    {id: "triple", nom: "Triple canon", emoji: "🎇", r: 1, dmg: 7, cad: 3, portee: 3, mode: "mono", txt: "Trois canons tirent à tour de rôle"},
    {id: "guet", nom: "Tour de guet", emoji: "🔭", r: 1, dmg: 30, cad: .7, portee: 5, mode: "mono", txt: "Des mousquetaires qui voient loin"},
    {id: "caserne_a", nom: "Caserne alliée", emoji: "🛡️", r: 1, dmg: 15, cad: 1.2, portee: 2, mode: "mono", etourdit: .3, txt: "Des soldats retiennent l'ennemi"},
    {id: "goudron_l", nom: "Lance-goudron", emoji: "⚫", r: 1, dmg: 16, cad: .6, portee: 3.5, mode: "zone", rayon: 1, ralentit: {p: .25, d: 2}, txt: "Zone qui ralentit de 25 %"},
    {id: "boomerang", nom: "Boomerang", emoji: "🌙", r: 1, dmg: 16, cad: .8, portee: 3.5, mode: "ligne", double: true, txt: "Touche à l'aller et au retour"},
    {id: "marteau", nom: "Marteau à vapeur", emoji: "🔨", r: 1, dmg: 40, cad: .5, portee: 1.8, mode: "zone", rayon: 1, etourdit: .4, txt: "Écrase et étourdit au corps à corps"},
    {id: "cloche", nom: "Cloche de guerre", emoji: "🔔", r: 1, dmg: 0, cad: 0, portee: 2, mode: "aura", buffCad: .1, txt: "+10 % de cadence aux tours voisines"},
    {id: "mur", nom: "Mur de pierre", emoji: "🧱", r: 1, dmg: 0, cad: .25, etourdit: 1.2, piege: true, txt: "Bloque les ennemis 1,2 s toutes les 4 s"},
    {id: "barbele", nom: "Fil barbelé", emoji: "🕸️", r: 1, dmg: 20, cad: 1, ralentit: {p: .3, d: 1.5}, piege: true, txt: "Blesse et ralentit de 30 %"},

    {id: "flammes", nom: "Lance-flammes", emoji: "🔥", r: 2, dmg: 6, cad: 4, portee: 2.5, mode: "cone", brule: {dps: 8, d: 2}, txt: "Cône, brûlure de 8 DPS"},
    {id: "arc", nom: "Arc électrique", emoji: "⚡", r: 2, dmg: 30, cad: 1, portee: 3.5, mode: "chaine", n: 3, txt: "Touche 3 ennemis à la chaîne"},
    {id: "poison", nom: "Tour à poison", emoji: "🧪", r: 2, dmg: 10, cad: 1, portee: 3.5, mode: "mono", poison: {dps: 7, max: 35, d: 4}, txt: "Poison cumulable, 35 DPS max"},
    {id: "sniper", nom: "Sniper des collines", emoji: "🦅", r: 2, dmg: 220, cad: 1/3.5, portee: 9, mode: "mono", vise: "fort", txt: "Énormes dégâts, très longue portée, recharge lente"},
    {id: "cristal", nom: "Cristal arcanique", emoji: "🔮", r: 2, dmg: 35, cad: 1.2, portee: 3.5, mode: "mono", vuln: {p: .1, d: 2}, txt: "La cible subit +10 % de dégâts"},
    {id: "flak", nom: "Canon antiaérien", emoji: "🛩️", r: 2, dmg: 22, cad: 1.5, portee: 4.5, mode: "zone", rayon: .9, txt: "Explosions rapides en l'air"},
    {id: "riveteuse", nom: "Riveteuse", emoji: "🔧", r: 2, dmg: 3, cad: 5, portee: 3, mode: "continu", rampe: [25, 70], txt: "Monte de 25 à 70 DPS sur la même cible"},
    {id: "des", nom: "Tour de dés", emoji: "🎲", r: 2, dmg: 45, cad: 1, portee: 3.5, mode: "mono", de: true, txt: "Dégâts au hasard, jusqu'à près de ×2"},
    {id: "broyeur", nom: "Broyeur", emoji: "⚙️", r: 2, dmg: 8, cad: 5, portee: 2, mode: "cone", brule: {dps: 6, d: 1}, txt: "Cône court qui déchiquette"},
    {id: "tornade", nom: "Canon tornade", emoji: "🌪️", r: 2, dmg: 30, cad: .7, portee: 3.5, mode: "zone", rayon: 1.1, recul: .6, txt: "Repousse tout ce qui est dans la zone"},
    {id: "choc", nom: "Plaque de choc", emoji: "🔌", r: 2, dmg: 60, cad: .5, etourdit: .5, piege: true, txt: "Décharge et étourdit toutes les 2 s"},

    {id: "laser", nom: "Laser", emoji: "🔴", r: 3, dmg: 12, cad: 5, portee: 4, mode: "continu", rampe: [60, 160], txt: "Monte de 60 à 160 DPS sur la même cible"},
    {id: "mortier", nom: "Mortier à fragments", emoji: "🎆", r: 3, dmg: 120, cad: .5, portee: 4.5, mode: "zone", rayon: 1.5, txt: "Grande zone et éclats"},
    {id: "comptoir", nom: "Comptoir", emoji: "🏦", r: 3, dmg: 20, cad: 1, portee: 2, mode: "mono", or: .1, txt: "+10 % d'or sur les ennemis à portée"},
    {id: "balise", nom: "Balise", emoji: "📡", r: 3, dmg: 0, cad: 0, portee: 1.5, mode: "aura", buffDeg: .2, txt: "+20 % de dégâts aux tours voisines"},
    {id: "railgun", nom: "Railgun", emoji: "🔋", r: 3, dmg: 900, cad: 1/4.5, portee: 10, mode: "ligne", limite: 4, txt: "Se charge 4,5 s puis traverse toute la ligne. 4 max"},
    {id: "gatling", nom: "Gatling", emoji: "💢", r: 3, dmg: 14, cad: 7, portee: 3.5, mode: "mono", txt: "Un déluge de balles"},
    {id: "obusier", nom: "Obusier", emoji: "🚛", r: 3, dmg: 350, cad: .3, portee: 7, mode: "zone", rayon: 1.6, txt: "Très longue portée, grande zone"},
    {id: "incinerateur", nom: "Incinérateur", emoji: "♨️", r: 3, dmg: 18, cad: 5, portee: 2.5, mode: "cone", brule: {dps: 40, d: 3}, txt: "Cône, brûlure de 40 DPS"},
    {id: "mines", nom: "Lance-mines", emoji: "🥏", r: 3, dmg: 220, cad: .5, portee: 4, mode: "mine", rayon: 1.2, txt: "Sème des mines sur le trajet des ennemis"},
    {id: "acide", nom: "Pulvérisateur d'acide", emoji: "🧴", r: 3, dmg: 12, cad: 5, portee: 3, mode: "cone", vuln: {p: .25, d: 2}, txt: "Les ennemis touchés subissent +25 % de dégâts"},
    {id: "emp", nom: "Impulsion EMP", emoji: "📴", r: 3, dmg: 60, cad: .25, portee: 3, mode: "champ", etourdit: 1, txt: "Toutes les 4 s, étourdit tout ce qui est à portée"},
    {id: "pistolero", nom: "Pistolero", emoji: "🤠", r: 3, dmg: 90, cad: 1, portee: 4, mode: "chaine", n: 2, crit: .3, txt: "Ricochet et +30 % de chance de critique"},
    {id: "barricade", nom: "Barricade militaire", emoji: "🚧", r: 3, dmg: 40, cad: 1/3, etourdit: 2, piege: true, txt: "Bloque les ennemis 2 s toutes les 3 s"},

    {id: "missiles", nom: "Missile Battery", emoji: "🚀", r: 4, dmg: 300, cad: .5, portee: 5, mode: "zone", rayon: 1.8, txt: "Grande zone"},
    {id: "storm", nom: "Storm Coil", emoji: "🌩️", r: 4, dmg: 170, cad: 1, portee: 4, mode: "chaine", n: 5, etourdit: .3, txt: "Chaîne de 5, étourdit 0,3 s"},
    {id: "cryo", nom: "Cryo Beam", emoji: "🧊", r: 4, dmg: 24, cad: 5, portee: 4, mode: "continu", ralentit: {p: .4, d: .5}, gel: {tous: 5, d: 1}, txt: "Ralentit de 40 %, gèle 1 s toutes les 5 s"},
    {id: "ruche", nom: "Bee Hive", emoji: "🐝", r: 4, dmg: 50, cad: 5, portee: 4.5, mode: "mono", txt: "Des abeilles poursuivent les ennemis"},
    {id: "ronin", nom: "Cyber Ronin", emoji: "⚔️", r: 4, dmg: 400, cad: .9, portee: 2, mode: "mono", crit: .25, txt: "+25 % de chance de critique"},
    {id: "pince", nom: "Claw Machine", emoji: "🕹️", r: 4, dmg: 80, cad: 1, portee: 4, mode: "mono", retour: 8, txt: "Renvoie un ennemi au départ toutes les 8 s"},
    {id: "mecha", nom: "Hangar à mechas", emoji: "🦾", r: 4, dmg: 300, cad: .9, portee: 3, mode: "mono", etourdit: .4, txt: "Un mecha cogne et étourdit"},
    {id: "anubis", nom: "Balance d'Anubis", emoji: "⚖️", r: 4, dmg: 180, cad: 1.2, portee: 3.5, mode: "mono", execute: .2, txt: "Achève les ennemis sous 20 % de PV, sauf les boss"},
    {id: "torii", nom: "Torii du dragon néon", emoji: "🎏", r: 4, dmg: 60, cad: 5, portee: 3.5, mode: "cone", brule: {dps: 60, d: 2}, txt: "Souffle néon, brûlure de 60 DPS"},
    {id: "circuit", nom: "Circuit de course", emoji: "🏁", r: 4, dmg: 350, cad: .8, portee: 6, mode: "ligne", txt: "Des bolides traversent tout sur leur passage"},
    {id: "bunker", nom: "Bunker secret", emoji: "🏢", r: 4, dmg: 600, cad: .5, portee: 5, mode: "zone", rayon: 1.5, camp: "base", txt: "Pilonnage lourd depuis un bunker"},

    {id: "dragon", nom: "Dragon", emoji: "🐉", r: 5, dmg: 140, cad: 5, portee: 5, mode: "cone", brule: {dps: 100, d: 3}, camp: "enfers", txt: "Grand cône, forte brûlure"},
    {id: "trounoir", nom: "Trou noir", emoji: "🕳️", r: 5, dmg: 80, cad: 5, portee: 3.5, mode: "champ", ralentit: {p: .5, d: .3}, camp: "colosse", txt: "Attire et ralentit tout ce qui est à portée"},
    {id: "horloge", nom: "Horloge", emoji: "🕰️", r: 5, dmg: 0, cad: 0, portee: 2, mode: "aura", buffCad: .3, txt: "+30 % de cadence aux tours à portée"},
    {id: "plasma", nom: "Laser à plasma", emoji: "🔆", r: 5, dmg: 100, cad: 5, portee: 3, mode: "continu", pct: [.011, .022, .033], txt: "Brûle 1,1 puis 2,2 puis 3,3 % des PV actuels par seconde"},
    {id: "sonique", nom: "Canon sonique", emoji: "📢", r: 5, dmg: 500, cad: 1.2, portee: 6, mode: "ligne", recul: .4, txt: "Onde qui traverse et repousse"},
    {id: "kraken", nom: "Puits du Kraken", emoji: "🐙", r: 5, dmg: 120, cad: 5, portee: 3, mode: "champ", retour: 4, txt: "Blesse à portée, renvoie un ennemi au départ toutes les 4 s"},
    {id: "alien", nom: "Liaison extraterrestre", emoji: "👽", r: 5, dmg: 1500, cad: .45, portee: 99, mode: "zone", rayon: 1, vise: "fort", txt: "Frappe orbitale n'importe où sur le terrain"},
    {id: "reine", nom: "Reine des glaces", emoji: "👸", r: 5, dmg: 100, cad: 5, portee: 3.5, mode: "champ", ralentit: {p: .5, d: .5}, txt: "Blizzard : blesse et ralentit tout à portée"},
    {id: "faille", nom: "Faille temporelle", emoji: "⏳", r: 5, dmg: 0, cad: 0, portee: 2.5, mode: "aura", buffCad: .2, buffDeg: .2, txt: "+20 % de cadence et de dégâts aux tours voisines"},
    {id: "golem", nom: "Golem doré", emoji: "💎", r: 5, dmg: 800, cad: .8, portee: 2.5, mode: "mono", or: .5, txt: "+50 % d'or sur les ennemis à portée"},
    {id: "titan", nom: "Titan de pierre", emoji: "🗻", r: 5, dmg: 1800, cad: .4, portee: 3, mode: "zone", rayon: 1.6, etourdit: .5, txt: "Fait trembler le sol et étourdit"},
    {id: "oeil", nom: "Œil céleste", emoji: "👁️", r: 5, dmg: 900, cad: .8, portee: 99, mode: "ligne", txt: "Un rayon qui traverse tout le terrain"},

    {id: "corrompu", nom: "Serveur corrompu", emoji: "🖥️", r: 6, dmg: 400, cad: 5, portee: 5, mode: "continu", infection: true, camp: "serveur", txt: "L'infection se propage et double l'or des infectés"},
    {id: "silo", nom: "Silo nucléaire", emoji: "☢️", r: 6, dmg: 0, cad: 1/180, charge: 180, portee: 99, mode: "silo", txt: "Toutes les 3 min : tue tout, boss à -50 % de PV, puis retombées pendant 60 s"}
  ];

  /* Angle de tir en degrés, centré sur l'orientation de la tour.
     Les tours absentes de cette liste tirent à 360° (électricité, abeilles, champ, auras, pièges). */
  const ARCS = {arbalete: 120, mitrailleuse: 120, catapulte: 120, canon: 120, harpon: 90, barils: 150, baliste_p: 90,
    baliste: 70, givre: 120, bombarde: 120, triple: 120, guet: 90, caserne_a: 180, goudron_l: 120, boomerang: 120, marteau: 180,
    flammes: 90, poison: 120, sniper: 60, flak: 150, riveteuse: 100, broyeur: 90, tornade: 120,
    laser: 100, mortier: 120, comptoir: 120, railgun: 40, gatling: 100, obusier: 90, incinerateur: 90, mines: 150, acide: 90,
    missiles: 120, cryo: 90, ronin: 150, pince: 120, mecha: 180, torii: 110, circuit: 90, bunker: 120,
    dragon: 100, plasma: 100, sonique: 90, golem: 180, titan: 180,
    corrompu: 120};
  TOURS.forEach(t => { t.arc = ARCS[t.id] || 360; });

  /* ports : côtés ouverts sans rotation (0 haut, 1 droite, 2 bas, 3 gauche) */
  const FORMES = {
    droit:  {nom: "Droit",      signe: "┃", ports: [0, 2],       poids: 35},
    virage: {nom: "Virage",     signe: "┗", ports: [0, 1],       poids: 35},
    t:      {nom: "T",          signe: "┻", ports: [0, 1, 3],    poids: 15},
    croix:  {nom: "Croisement", signe: "╋", ports: [0, 1, 2, 3], poids: 15}
  };
  const MATIERES = [
    {id: "terre",  nom: "Terre",         r: 0, couleur: "#a5794f", lent: 0,   poids: 1},
    {id: "paves",  nom: "Pavés",         r: 1, couleur: "#9aa0a8", lent: 0,   poids: 1},
    {id: "bois",   nom: "Bois",          r: 2, couleur: "#b5763a", lent: 0,   poids: 1},
    {id: "marbre", nom: "Marbre",        r: 3, couleur: "#e6e4ee", lent: 0,   poids: 1},
    {id: "orpur",  nom: "Or",            r: 4, couleur: "#e8c04a", lent: 0,   poids: 1},
    {id: "miel",   nom: "Miel",          r: 4, couleur: "#f0a51e", lent: .05, poids: .5},
    {id: "slime",  nom: "Slime",         r: 5, couleur: "#74d94b", lent: .10, poids: 1},
    {id: "goudron",nom: "Goudron",       r: 5, couleur: "#2b2b33", lent: .15, poids: .35},
    {id: "sable",  nom: "Sable mouvant", r: 6, couleur: "#d3b56f", lent: .20, poids: 1}
  ];

  /* mult : multiplicateurs de chance par rapport à la Forêt
     (peu commun, rare, épique, légendaire, mythique, secret) */
  const CAMPS = [
    {id: "foret",    nom: "Forêt",              emoji: "🌲", r: 0, prix: 100,       ennemi: "🐺", mult: [1, 1, 1, 1, 1, 1]},
    {id: "caserne",  nom: "Caserne",            emoji: "🏘️", r: 0, prix: 150,       ennemi: "💂", mult: [1.1, 1.1, 1.2, 1.2, 1.2, 1]},
    {id: "bandits",  nom: "Camp de bandits",    emoji: "⛺", r: 0, prix: 300,       ennemi: "🦹", mult: [1.2, 1.3, 1.3, 1.4, 1.4, 1]},
    {id: "gobelins", nom: "Camp gobelin",       emoji: "🏚️", r: 1, prix: 1000,      ennemi: "👺", mult: [1.6, 1.9, 2.2, 2.4, 2.5, 1]},
    {id: "saloon",   nom: "Saloon",             emoji: "🍺", r: 1, prix: 1500,      ennemi: "🤠", mult: [1.6, 2, 2.4, 2.7, 2.9, 1]},
    {id: "crypte",   nom: "Crypte",             emoji: "⚰️", r: 2, prix: 4000,      ennemi: "💀", mult: [1.9, 2.9, 4, 4.5, 5, 1]},
    {id: "base",     nom: "Base militaire",     emoji: "🏭", r: 2, prix: 10000,     ennemi: "👮", mult: [1.9, 3, 4.3, 4.9, 5.7, 1]},
    {id: "crique",   nom: "Crique pirate",      emoji: "🏴‍☠️", r: 2, prix: 25000,     ennemi: "🦜", mult: [2, 3.2, 4.7, 5.4, 6.5, 1]},
    {id: "fouilles", nom: "Porte des fouilles", emoji: "🌀", r: 4, prix: 500000,    ennemi: "🦂", mult: [2.1, 4.6, 8.5, 12, 17, 1.1]},
    {id: "dojo",     nom: "Dojo néon",          emoji: "🏯", r: 4, prix: 800000,    ennemi: "🥋", mult: [2.1, 4.7, 8.9, 12, 19, 1.2]},
    {id: "cartes",   nom: "Royaume des cartes", emoji: "🃏", r: 4, prix: 1200000,   ennemi: "🤡", mult: [2.1, 4.8, 9.2, 13, 21, 1.2]},
    {id: "colosse",  nom: "Colosse déchu",      emoji: "🗿", r: 5, prix: 5000000,   ennemi: "🤖", mult: [2.1, 5.1, 10, 14, 25, 1.5], pitie: 100},
    {id: "paradis",  nom: "Porte du Paradis",   emoji: "⛩️", r: 5, prix: 15000000,  ennemi: "👼", mult: [2.1, 5.3, 11, 15, 27, 1.7], pitie: 100},
    {id: "enfers",   nom: "Gueule des Enfers",  emoji: "🌋", r: 5, prix: 20000000,  ennemi: "😈", mult: [2.1, 5.3, 11, 15, 27, 1.7], pitie: 100},
    {id: "serveur",  nom: "Serveur corrompu",   emoji: "💾", r: 6, prix: 100000000, ennemi: "👾", mult: [2.1, 5.5, 11, 16, 30, 3.8], pitie: 180}
  ];

  /* Arbre hexagonal : chaque lettre est une case, de gauche à droite.
     [ligne (0 = celle du Départ), colonne de la première case (en demi-cases depuis le Départ), cases]
     Minuscule : une famille de FAMILLES. Majuscule ou * : un nœud unique de SPECIAUX. Point : vide. */
  const CARTE = [
    [-9, -7, "kkkk...cc"],
    [-8, -6, "kkkkcccc"],
    [-7, -5, "kkkcccc"],
    [-6, -4, "kkkcccJ"],
    [-5, -5, "hkkcccdB"],
    [-4, -8, "ShhkkccddNM"],
    [-3, -11, "Hhhhhkccddd"],
    [-2, -12, "Whhhhhkcdddd"],
    [-1, -15, "LTbbbbhhcddddd"],
    [0, -16, "Qfffffff*dddddAC"],
    [1, -13, "ffffftolllluuzz"],
    [2, -12, "fffttoollluuzzG"],
    [3, -11, "fRtsooolluuz.P"],
    [4, -8, "tsooooluuz"],
    [5, -7, "sooooouuz"],
    [6, -8, "sIUoooozz"],
    [7, -9, "sV...XYZz"],
    [8, 8, "E"],
    [9, 7, "F"]
  ];
  /* Le prix d'une famille monte de ×raison à chaque nœud ; val est un gain fixe ou une liste, nœud par nœud */
  const FAMILLES = {
    d: {nom: "Dégâts", emoji: "💥", stat: "degats", val: .08, base: 50, raison: 2.2, couleur: "#c8434f"},
    c: {nom: "Chance crit.", emoji: "🎯", stat: "critC", val: .02, base: 70, raison: 2, couleur: "#d97a2b"},
    k: {nom: "Dégâts crit.", emoji: "🗡️", stat: "critD", val: .15, base: 100, raison: 2.1, couleur: "#d43f8d"},
    h: {nom: "PV château", emoji: "❤️", stat: "pv", val: [50, 50, 100, 100, 150, 150, 200, 200, 250, 250, 300, 300, 350, 450], base: 40, raison: 2.6, couleur: "#2da58e"},
    b: {nom: "Terrain", emoji: "🗺️", stat: "terrain", val: 2, base: 150, raison: 20, couleur: "#2f7fdd"},
    f: {nom: "Défenses", emoji: "🏗️", stat: "defenses", val: [2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4], base: 60, raison: 2.5, couleur: "#8a4fd0"},
    t: {nom: "Pièges", emoji: "🚧", stat: "pieges", val: 1, base: 500, raison: 40, couleur: "#8a7a6a"},
    s: {nom: "Camps", emoji: "⛺", stat: "camps", val: [1, 2, 4, 5, 7], base: 200, raison: 12, couleur: "#a8622f"},
    o: {nom: "Or", emoji: "💰", stat: "or", val: .08, base: 60, raison: 2.1, couleur: "#d9a227"},
    l: {nom: "Chance", emoji: "🍀", stat: "chance", val: .05, base: 80, raison: 2, couleur: "#38a84d"},
    u: {nom: "Super chance", emoji: "🍀", stat: "chance", val: .08, base: 50000, raison: 1.9, couleur: "#2b7fd6"},
    z: {nom: "Ultra chance", emoji: "🍀", stat: "chance", val: .12, base: 20000000, raison: 1.5, couleur: "#c9a81f"}
  };
  const SPECIAUX = {
    A: {nom: "Cadence I", emoji: "⏩", stat: "cadence", val: .1, cout: 1e8},
    C: {nom: "Cadence II", emoji: "⏩", stat: "cadence", val: .15, cout: 1e9},
    B: {nom: "Labo de brûlure I", emoji: "🧯", stat: "brulure", val: .5, cout: 2.5e8},
    J: {nom: "Labo de brûlure II", emoji: "🧯", stat: "brulure", val: .5, cout: 2e9},
    N: {nom: "Tueur de boss I", emoji: "👹", stat: "bossDeg", val: .25, cout: 2.5e8},
    M: {nom: "Tueur de boss II", emoji: "👹", stat: "bossDeg", val: .25, cout: 2e9},
    Q: {nom: "Long tir I", emoji: "🔭", stat: "portee", val: .1, cout: 2e8},
    L: {nom: "Long tir II", emoji: "🔭", stat: "portee", val: .1, cout: 2e9},
    T: {nom: "Terrain V", emoji: "🗺️", stat: "terrain", val: 2, cout: 1e9},
    W: {nom: "Vague 50", emoji: "🚀", stat: "vagueDepart", val: 50, cout: 4e8},
    H: {nom: "Vague 100", emoji: "🚀", stat: "vagueDepart", val: 100, cout: 1.36e9},
    S: {nom: "Seconde vie", emoji: "💖", stat: "secondeVie", val: 1, cout: 1e10},
    I: {nom: "Intérêts I", emoji: "🏦", stat: "interet", val: .001, cout: 2e7},
    U: {nom: "Intérêts II", emoji: "🏦", stat: "interet", val: .001, cout: 1.94e9},
    X: {nom: "Chasseur de primes I", emoji: "👑", stat: "bossOr", val: .05, cout: 3e7},
    Y: {nom: "Chasseur de primes II", emoji: "👑", stat: "bossOr", val: .05, cout: 8.98e8},
    Z: {nom: "Chasseur de primes III", emoji: "👑", stat: "bossOr", val: .1, cout: 5e9},
    E: {nom: "Double butin I", emoji: "🎁", stat: "doubleButin", val: .05, cout: 1e9},
    F: {nom: "Double butin II", emoji: "🎁", stat: "doubleButin", val: .05, cout: 5e9},
    P: {nom: "Pré-fusion I", emoji: "✨", stat: "prefusion", val: .05, cout: 1e9},
    R: {nom: "Arsenal", emoji: "🏗️", stat: "defenses", val: 5, cout: 5e8},
    V: {nom: "Camps VI", emoji: "⛺", stat: "camps", val: 5, cout: 2e9},
    G: {nom: "Trèfle d'or", emoji: "☘️", stat: "chance", val: .5, cout: 3e9}
  };

  /* Patch note affiché par le bouton 📜 : la version la plus récente en premier */
  const PATCH_NOTES = [
    {version: "v2", titre: "Le patch de la collection", lignes: [
      "L'arbre d'améliorations passe à plus de 170 cases, avec de nouvelles familles : Super chance, Ultra chance, Pièges",
      "Nouvelles améliorations uniques : Cadence, Labo de brûlure, Tueur de boss, Long tir, Double butin, Pré-fusion…",
      "Les prix montent maintenant par paliers, des premières dizaines d'or jusqu'aux milliards",
      "Les cases encore hors de portée sont cachées : à toi de les découvrir",
      "L'or remonte plus vite dans les vagues hautes",
      "Ton or dépensé dans l'ancien arbre t'est entièrement remboursé",
      "De 23 à 71 tours : Railgun, Sniper, Pistolero, Balance d'Anubis, Laser à plasma, Silo nucléaire…",
      "Les pièges arrivent : ils se posent directement sur les chemins",
      "Avec Vague 50 et Vague 100, tu peux commencer un combat plus loin",
      "Ajout de l'Index 📖 pour voir toutes les tours et tes chances de les obtenir"
    ]},
    {version: "v1.2", titre: "Le patch du patch note", lignes: [
      "Ajout du patch note. Parce que c'est drôle."
    ]},
    {version: "v1.1", titre: "Le patch des plaintes", lignes: [
      "Classement de la meilleure vague : semaine, depuis toujours et sur ton appareil",
      "Les bâtiments se déplacent en les glissant, fini le retirer puis replacer",
      "Aperçu en temps réel de ce que tu places, avec sa zone de tir",
      "La plupart des tours tirent maintenant en cône : pense à bien les orienter",
      "Compte à rebours du boss au-dessus de chaque camp",
      "La chance d'obtenir une tour ou un chemin s'affiche quand tu cliques dessus",
      "Relance auto pour farmer quand le château tombe",
      "Plus aucun chemin illimité : tout se droppe, croisements compris",
      "Les boss ont moins de PV, pour compenser les cônes"
    ]},
    {version: "v1", titre: "La sortie", lignes: [
      "Construis ton terrain : camps, chemins et tours, tous reliés au château",
      "Vagues d'ennemis, boss et or à gagner selon le camp",
      "Chaque boss tué fait un tirage : une tour ou un chemin, du commun au secret",
      "23 tours à collectionner et à fusionner",
      "Chemins de 9 matières, dont le miel, le slime et le goudron qui ralentissent",
      "Arbre d'améliorations : terrain, dégâts, critiques, chance, or et plus encore",
      "Boutique de 15 camps, renouvelée toutes les 2 minutes",
      "Sauvegarde sur ton compte"
    ]}
  ];

  return {RARETES, TOURS, FORMES, MATIERES, CAMPS, CARTE, FAMILLES, SPECIAUX, PATCH_NOTES};
})();
