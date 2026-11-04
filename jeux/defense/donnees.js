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
     mono, zone (rayon), cone, chaine (n), continu (5 fois/s), champ (tous à portée), aura (ne tire pas) */
  const TOURS = [
    {id: "arbalete", nom: "Arbalète", emoji: "🏹", r: 0, dmg: 10, cad: 1, portee: 3, mode: "mono", txt: "Une seule cible"},
    {id: "mitrailleuse", nom: "Mitrailleuse", emoji: "🔫", r: 0, dmg: 3, cad: 3, portee: 2.5, mode: "mono", txt: "Tir rapide, courte portée"},
    {id: "catapulte", nom: "Catapulte", emoji: "☄️", r: 0, dmg: 12, cad: .5, portee: 3.5, mode: "zone", rayon: .8, txt: "Petite zone"},

    {id: "baliste", nom: "Baliste", emoji: "🎯", r: 1, dmg: 60, cad: 1/3, portee: 6, mode: "mono", vise: "fort", txt: "Vise l'ennemi le plus résistant"},
    {id: "givre", nom: "Tour de givre", emoji: "❄️", r: 1, dmg: 6, cad: 1.5, portee: 3, mode: "mono", ralentit: {p: .2, d: 2}, txt: "Ralentit de 20 %"},
    {id: "bombarde", nom: "Bombarde", emoji: "💣", r: 1, dmg: 24, cad: .5, portee: 3.5, mode: "zone", rayon: 1.2, txt: "Zone moyenne"},

    {id: "flammes", nom: "Lance-flammes", emoji: "🔥", r: 2, dmg: 6, cad: 4, portee: 2.5, mode: "cone", brule: {dps: 8, d: 2}, txt: "Cône, brûlure de 8 DPS"},
    {id: "arc", nom: "Arc électrique", emoji: "⚡", r: 2, dmg: 30, cad: 1, portee: 3.5, mode: "chaine", n: 3, txt: "Touche 3 ennemis à la chaîne"},
    {id: "poison", nom: "Tour à poison", emoji: "🧪", r: 2, dmg: 10, cad: 1, portee: 3.5, mode: "mono", poison: {dps: 7, max: 35, d: 4}, txt: "Poison cumulable, 35 DPS max"},

    {id: "laser", nom: "Laser", emoji: "🔴", r: 3, dmg: 12, cad: 5, portee: 4, mode: "continu", rampe: [60, 160], txt: "Monte de 60 à 160 DPS sur la même cible"},
    {id: "mortier", nom: "Mortier à fragments", emoji: "🎆", r: 3, dmg: 120, cad: .5, portee: 4.5, mode: "zone", rayon: 1.5, txt: "Grande zone et éclats"},
    {id: "comptoir", nom: "Comptoir", emoji: "🏦", r: 3, dmg: 20, cad: 1, portee: 2, mode: "mono", or: .1, txt: "+10 % d'or sur les ennemis à portée"},
    {id: "balise", nom: "Balise", emoji: "📡", r: 3, dmg: 0, cad: 0, portee: 1.5, mode: "aura", buffDeg: .2, txt: "+20 % de dégâts aux tours voisines"},

    {id: "missiles", nom: "Missile Battery", emoji: "🚀", r: 4, dmg: 300, cad: .5, portee: 5, mode: "zone", rayon: 1.8, txt: "Grande zone"},
    {id: "storm", nom: "Storm Coil", emoji: "🌩️", r: 4, dmg: 170, cad: 1, portee: 4, mode: "chaine", n: 5, etourdit: .3, txt: "Chaîne de 5, étourdit 0,3 s"},
    {id: "cryo", nom: "Cryo Beam", emoji: "🧊", r: 4, dmg: 24, cad: 5, portee: 4, mode: "continu", ralentit: {p: .4, d: .5}, gel: {tous: 5, d: 1}, txt: "Ralentit de 40 %, gèle 1 s toutes les 5 s"},
    {id: "ruche", nom: "Bee Hive", emoji: "🐝", r: 4, dmg: 50, cad: 5, portee: 4.5, mode: "mono", txt: "Des abeilles poursuivent les ennemis"},
    {id: "ronin", nom: "Cyber Ronin", emoji: "⚔️", r: 4, dmg: 500, cad: .5, portee: 2, mode: "mono", crit: .25, txt: "+25 % de chance de critique"},
    {id: "pince", nom: "Claw Machine", emoji: "🕹️", r: 4, dmg: 80, cad: 1, portee: 4, mode: "mono", retour: 8, txt: "Renvoie un ennemi au départ toutes les 8 s"},

    {id: "dragon", nom: "Dragon", emoji: "🐉", r: 5, dmg: 140, cad: 5, portee: 5, mode: "cone", brule: {dps: 100, d: 3}, camp: "enfers", txt: "Grand cône, forte brûlure"},
    {id: "trounoir", nom: "Trou noir", emoji: "🕳️", r: 5, dmg: 80, cad: 5, portee: 3.5, mode: "champ", ralentit: {p: .5, d: .3}, camp: "colosse", txt: "Attire et ralentit tout ce qui est à portée"},
    {id: "horloge", nom: "Horloge", emoji: "🕰️", r: 5, dmg: 0, cad: 0, portee: 2, mode: "aura", buffCad: .3, txt: "+30 % de cadence aux tours à portée"},

    {id: "corrompu", nom: "Serveur corrompu", emoji: "🖥️", r: 6, dmg: 400, cad: 5, portee: 5, mode: "continu", infection: true, camp: "serveur", txt: "L'infection se propage et double l'or des infectés"}
  ];

  /* ports : côtés ouverts sans rotation (0 haut, 1 droite, 2 bas, 3 gauche) */
  const FORMES = {
    droit:  {nom: "Droit",      signe: "┃", ports: [0, 2],       poids: 40},
    virage: {nom: "Virage",     signe: "┗", ports: [0, 1],       poids: 40},
    t:      {nom: "T",          signe: "┻", ports: [0, 1, 3],    poids: 15},
    croix:  {nom: "Croisement", signe: "╋", ports: [0, 1, 2, 3], poids: 5}
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

  /* Arbre hexagonal : 6 secteurs de 10 nœuds, du centre vers l'extérieur
     (1 nœud sur l'anneau 1, 2 sur le 2, 3 sur le 3, 4 sur le 4).
     [nom, emoji, statistique, valeur] */
  const n = (nom, emoji, stat, val) => ({nom, emoji, stat, val});
  const deg = (s, v) => n("Dégâts " + s, "💥", "degats", v);
  const cc = (s, v) => n("Chance crit. " + s, "🎯", "critC", v);
  const cd = (s, v) => n("Dégâts crit. " + s, "🗡️", "critD", v);
  const pv = (s, v) => n("PV château " + s, "❤️", "pv", v);
  const def = (s, v) => n("Défenses " + s, "🏗️", "defenses", v);
  const ter = s => n("Terrain " + s, "🗺️", "terrain", 2);
  const cmp = s => n("Camps " + s, "⛺", "camps", 1);
  const or = (s, v) => n("Or " + s, "💰", "or", v);
  const ch = (s, v) => n("Chance " + s, "🍀", "chance", v);
  const SECTEURS = [
    [deg("I", .1), deg("II", .1), deg("III", .15), deg("IV", .15), deg("V", .2), deg("VI", .2), deg("VII", .3), deg("VIII", .3), deg("IX", .4), n("Cadence I", "⏩", "cadence", .1)],
    [cc("I", .02), cd("I", .15), cc("II", .03), cd("II", .2), cc("III", .04), cd("III", .25), cc("IV", .05), cd("IV", .3), cc("V", .05), cd("V", .4)],
    [pv("I", 50), pv("II", 50), pv("III", 100), pv("IV", 100), pv("V", 150), pv("VI", 200), pv("VII", 300), pv("VIII", 400), pv("IX", 500), n("Seconde vie", "💖", "secondeVie", 1)],
    [def("I", 3), ter("I"), def("II", 4), def("III", 5), ter("II"), def("IV", 5), ter("III"), def("V", 5), ter("IV"), def("VI", 10)],
    [cmp("I"), cmp("II"), n("Prime de boss I", "👑", "bossOr", .1), cmp("III"), cmp("IV"), n("Prime de boss II", "👑", "bossOr", .15), cmp("V"), cmp("VI"), cmp("VII"), cmp("VIII")],
    [or("I", .1), ch("I", .1), or("II", .15), ch("II", .15), n("Intérêts I", "🏦", "interet", .001), ch("III", .25), or("III", .25), ch("IV", .4), n("Double butin", "🎁", "doubleButin", .05), n("Intérêts II", "🏦", "interet", .001)]
  ];
  const COUT_ANNEAU = [60, 400, 3000, 30000];

  return {RARETES, TOURS, FORMES, MATIERES, CAMPS, SECTEURS, COUT_ANNEAU};
})();
